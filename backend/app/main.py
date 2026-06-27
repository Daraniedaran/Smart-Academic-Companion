from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, notes, performance, feedback, health

app = FastAPI(title="Smart Academic Companion", version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(notes.router, tags=["Notes"])
app.include_router(performance.router, tags=["Performance"])
app.include_router(feedback.router, tags=["Feedback"])
