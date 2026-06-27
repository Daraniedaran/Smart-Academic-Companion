from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

class PerformanceRequest(BaseModel):
    marks: str

class FeedbackRequest(BaseModel):
    message: str

class NotesQueryRequest(BaseModel):
    query: str

