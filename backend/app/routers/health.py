from fastapi import APIRouter
from app.services.ai_client import client

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ai_enabled": client is not None
    }
