import os
from fastapi import APIRouter, HTTPException
from app.models import FeedbackRequest
from app.config import UPLOAD_DIR

router = APIRouter()

FEEDBACK_FILE = "feedback.txt"

@router.post("/feedback")
async def submit_feedback(req: FeedbackRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Feedback cannot be empty")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(FEEDBACK_FILE, "a", encoding="utf-8") as f:
        f.write(req.message + "\n---\n")
    return {"message": "Feedback submitted anonymously"}


