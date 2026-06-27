from fastapi import APIRouter, HTTPException
from app.models import PerformanceRequest
from app.services.ai_client import client
from app.config import IS_OPENROUTER, OPENROUTER_MODEL, OPENAI_MODEL

router = APIRouter()

def _get_model() -> str:
    return OPENROUTER_MODEL if IS_OPENROUTER else OPENAI_MODEL

@router.post("/performance")
async def analyze_performance(req: PerformanceRequest):
    if not req.marks.strip():
        raise HTTPException(status_code=400, detail="Marks cannot be empty")
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
            print(f"[PERFORMANCE] Attempting analysis with model: {model_name}")
            prompt = f"Analyze this student's marks and provide academic advice:\n{req.marks}"
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are an academic performance advisor. Provide clear, sectioned markdown feedback."},
                    {"role": "user", "content": prompt}
                ]
            )
            return {"feedback": response.choices[0].message.content.strip(), "source": "ai"}
        except Exception as e:
            print(f"[PERFORMANCE] Error with model {model_name}: {e}")
            last_err = e
            continue

    raise HTTPException(
        status_code=502,
        detail=f"AI service temporarily unavailable. Last error: {last_err}"
    )
