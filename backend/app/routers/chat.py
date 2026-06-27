from fastapi import APIRouter, HTTPException
from app.models import ChatRequest
from app.services.ai_client import client
from app.config import IS_OPENROUTER, OPENROUTER_MODEL, OPENAI_MODEL

router = APIRouter()

SYSTEM_PROMPT = (
    "You are a Smart Academic Companion — an expert AI assistant for college students. "
    "Your capabilities include:\n"
    "1. **Academics & Studies** — All subjects (CS, Math, Physics, Engineering, etc.)\n"
    "2. **Technology & Development** — Programming, frameworks, cloud, DevOps, AI/ML, databases\n"
    "3. **IT Industry & Current Affairs** — Tech trends, career guidance, job market insights\n\n"
    "Guidelines:\n"
    "- Respond in well-structured markdown with headers, bullet points, and code blocks where appropriate.\n"
    "- Include practical examples and actionable advice.\n"
    "- Greet users warmly when they say hello or introduce themselves.\n"
    "- Be enthusiastic, encouraging, and thorough."
)

def _get_model() -> str:
    return OPENROUTER_MODEL if IS_OPENROUTER else OPENAI_MODEL

@router.post("/chat")
async def chat_with_bot(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if not client:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY in your .env file."
        )
    
    # Setup fallback models for OpenRouter free tier
    models_to_try = []
    if IS_OPENROUTER:
        models_to_try = [
            _get_model(),
            "google/gemini-2.5-flash:free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "openrouter/free"
        ]
        # Remove duplicates while preserving order
        seen = set()
        models_to_try = [m for m in models_to_try if not (m in seen or seen.add(m))]
    else:
        models_to_try = [_get_model()]

    last_err = None
    for model_name in models_to_try:
        try:
            print(f"[CHAT] Attempting chat completion with model: {model_name}")
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": req.message}
                ]
            )
            return {"response": response.choices[0].message.content.strip(), "source": "ai"}
        except Exception as e:
            print(f"[CHAT] Error with model {model_name}: {e}")
            last_err = e
            continue

    raise HTTPException(
        status_code=502,
        detail=f"AI service temporarily unavailable. Last error: {last_err}"
    )

