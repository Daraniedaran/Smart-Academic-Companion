from openai import OpenAI
from app.config import API_KEY, IS_OPENROUTER, HAS_VALID_KEY

client = None

if HAS_VALID_KEY:
    try:
        if IS_OPENROUTER:
            client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=API_KEY,
                default_headers={
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "Smart Academic Companion"
                }
            )
        else:
            client = OpenAI(api_key=API_KEY)
    except Exception as e:
        print(f"[STARTUP] Error initializing API client: {e}")
