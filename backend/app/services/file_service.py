import os
from fastapi import HTTPException, UploadFile
from app.config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE, UPLOAD_DIR

def validate_file(file: UploadFile):
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' is not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    return file

def ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload(file: UploadFile, contents: bytes) -> str:
    ensure_upload_dir()
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        f.write(contents)
    return save_path

def list_notes():
    ensure_upload_dir()
    files = []
    for f in os.listdir(UPLOAD_DIR):
        full_path = os.path.join(UPLOAD_DIR, f)
        if os.path.isfile(full_path):
            files.append({"name": f, "size": os.path.getsize(full_path)})
    return files

_extracted_text_cache = {}

def extract_text_from_file(filename: str) -> str:
    global _extracted_text_cache
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        return ""
    
    try:
        mtime = os.path.getmtime(file_path)
        cache_key = (filename, mtime)
        if cache_key in _extracted_text_cache:
            return _extracted_text_cache[cache_key]
    except Exception:
        cache_key = None

    ext = os.path.splitext(filename)[1].lower()
    text = ""
    if ext == ".txt":
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception as e:
            print(f"Error reading text file {filename}: {e}")
    elif ext == ".pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            parts = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    parts.append(t)
            text = "\n".join(parts)
        except Exception as e:
            print(f"Error reading PDF file {filename}: {e}")
            
    if cache_key:
        _extracted_text_cache[cache_key] = text
    return text


