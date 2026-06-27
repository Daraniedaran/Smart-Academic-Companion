from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from app.services.file_service import validate_file, save_upload, list_notes, extract_text_from_file
from app.models import NotesQueryRequest
from app.services.ai_client import client
from app.config import IS_OPENROUTER, OPENROUTER_MODEL, OPENAI_MODEL, UPLOAD_DIR
import os
import mimetypes

router = APIRouter()

def _get_model() -> str:
    return OPENROUTER_MODEL if IS_OPENROUTER else OPENAI_MODEL

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    validate_file(file)
    contents = await file.read()
    save_upload(file, contents)
    return {"message": f"File '{file.filename}' uploaded successfully"}

@router.get("/notes")
async def get_notes():
    return {"notes": list_notes()}

@router.get("/notes/{filename}")
async def get_note_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    content_type, _ = mimetypes.guess_type(file_path)
    return FileResponse(file_path, media_type=content_type or "application/octet-stream")

@router.post("/notes/query")
async def query_notes(req: NotesQueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    if not client:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please check your keys in .env."
        )
        
    notes_list = list_notes()
    if not notes_list:
        return {"answer": "You have not uploaded any notes yet. Please upload notes first so I can answer questions about them."}
        
    context_parts = []
    for note in notes_list:
        note_name = note["name"]
        text = extract_text_from_file(note_name)
        if text.strip():
            # Limit text length to avoid token limit issues
            truncated_text = text[:25000]
            context_parts.append(f"--- START OF NOTE: {note_name} ---\n{truncated_text}\n--- END OF NOTE: {note_name} ---")
    
    if not context_parts:
        return {"answer": "No readable text content (such as text or PDF) was found in your uploaded notes. Please upload PDF or TXT notes so I can answer your questions."}
        
    notes_context = "\n\n".join(context_parts)
    
    models_to_try = []
    if IS_OPENROUTER:
        models_to_try = [
            _get_model(),
            "google/gemini-2.5-flash:free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "openrouter/free"
        ]
        seen = set()
        models_to_try = [m for m in models_to_try if not (m in seen or seen.add(m))]
    else:
        models_to_try = [_get_model()]
        
    system_prompt = (
        "You are an expert academic assistant. Your task is to answer the student's question based strictly on the provided study notes.\n"
        "Guidelines:\n"
        "- Provide a clear, detailed, and structured answer in Markdown format.\n"
        "- Ground your answer in the facts found in the notes. If the notes are insufficient or don't mention the answer, provide the best general academic answer possible but clearly state that the answer was not found in the uploaded notes.\n"
        "- Cite the specific filenames (e.g. 'Lecture1.pdf') where you found the information to help the user identify where the answers are."
    )
    
    user_message = (
        f"Here is the content of the student's uploaded notes:\n\n"
        f"{notes_context}\n\n"
        f"Student's Question: {req.query}\n\n"
        f"Please analyze the notes and answer the question."
    )
    
    last_err = None
    for model_name in models_to_try:
        try:
            print(f"[NOTES QUERY] Attempting with model: {model_name}")
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
            )
            return {"answer": response.choices[0].message.content.strip()}
        except Exception as e:
            print(f"[NOTES QUERY] Error with model {model_name}: {e}")
            last_err = e
            continue
            
    raise HTTPException(
        status_code=502,
        detail=f"AI service temporarily unavailable. Last error: {last_err}"
    )

