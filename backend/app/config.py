from dotenv import load_dotenv
import os
from pathlib import Path

_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

OPENROUTER_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
API_KEY = OPENROUTER_KEY or OPENAI_KEY
IS_OPENROUTER = bool(OPENROUTER_KEY)
OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "google/gemini-2.5-flash:free")
OPENAI_MODEL = "gpt-3.5-turbo"
HAS_VALID_KEY = bool(API_KEY) and not API_KEY.startswith("your-")
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".doc", ".docx", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 10 * 1024 * 1024
UPLOAD_DIR = "uploads"


print(f"[CONFIG] .env loaded from: {_env_path}")
print(f"[CONFIG] OpenRouter key present: {bool(OPENROUTER_KEY)}")
print(f"[CONFIG] Using AI model: {OPENROUTER_MODEL if IS_OPENROUTER else OPENAI_MODEL}")
print(f"[CONFIG] AI client will be active: {HAS_VALID_KEY}")
