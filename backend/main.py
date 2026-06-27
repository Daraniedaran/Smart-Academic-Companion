# Smart Academic Companion — Backend API
# Run with: uvicorn main:app --reload
# Or: python main.py

import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
