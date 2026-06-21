from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
import re
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS for frontend development
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API key setup
OPENROUTER_KEY = os.environ.get("OPENROUTER_API_KEY")
API_KEY = OPENROUTER_KEY or os.environ.get("OPENAI_API_KEY")
IS_OPENROUTER = bool(OPENROUTER_KEY)

# Initialize client
client = None
if API_KEY and not API_KEY.startswith("your-"):
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
        print(f"Error initializing API client: {e}")

# --- Helper Mock Fallbacks ---
def get_mock_chat_response(message: str) -> str:
    msg = message.lower()
    if "recursion" in msg:
        return (
            "### Understanding Recursion\n\n"
            "Recursion is a programming technique where a function calls itself to solve a problem. "
            "To understand it, remember two essential components:\n\n"
            "1. **Base Case:** The condition that terminates the recursive calls. Without this, you get a stack overflow error.\n"
            "2. **Recursive Step:** The part where the function calls itself with a smaller input, moving closer to the base case.\n\n"
            "**Example (Factorial in Python):**\n"
            "```python\n"
            "def factorial(n):\n"
            "    if n == 1: # Base Case\n"
            "        return 1\n"
            "    return n * factorial(n - 1) # Recursive Step\n"
            "```\n"
            "Let me know if you need to trace how the call stack handles this!"
        )
    elif "study" in msg or "exam" in msg or "prepare" in msg:
        return (
            "### Effective Study Tips for Academic Success\n\n"
            "Preparing for exams can be overwhelming. Here are 3 science-backed strategies to maximize your efficiency:\n\n"
            "1. **Active Recall:** Instead of re-reading notes, test yourself. Create flashcards or explain the concept to a peer.\n"
            "2. **Spaced Repetition:** Space out study sessions over several days rather than cramming. This moves information into long-term memory.\n"
            "3. **Feynman Technique:** Try to explain a complex topic in simple terms, as if teaching a child. This will highlight gaps in your understanding.\n\n"
            "Which subject are you preparing for? I can help you outline a custom study guide."
        )
    elif "resume" in msg or "career" in msg or "internship" in msg:
        return (
            "### Core Sections of a Tech Student Resume\n\n"
            "To stand out to recruiters, ensure your resume contains:\n\n"
            "- **Contact Info:** Name, LinkedIn, GitHub, Email, Phone.\n"
            "- **Education:** Degree, College, Graduation Year, GPA (if > 3.0).\n"
            "- **Skills:** Categorized by languages (Python, Java), frameworks (React, FastAPI), and developer tools (Git, Docker).\n"
            "- **Projects:** Use the **STAR method** (Situation, Task, Action, Result). Highlight the technologies used and quantifiably measure impact (e.g., 'reduced load time by 30%').\n"
            "- **Experience:** Internships or volunteer leadership positions.\n\n"
            "Send me draft bullet points, and I can polish them!"
        )
    else:
        return (
            f"Thank you for reaching out! As your Smart Academic Companion, I'm here to help you study, manage notes, and track your progress. \n\n"
            f"You asked: *\"{message}\"*\n\n"
            f"To get the most out of our session, you can ask me to:\n"
            f"- Explain a computer science or engineering topic.\n"
            f"- Design a study schedule for your courses.\n"
            f"- Solve a coding question or explain syntax.\n\n"
            f"How can I assist you today?"
        )

def get_mock_performance_analysis(marks_str: str) -> str:
    numbers = [int(n) for n in re.findall(r'\b\d{1,3}\b', marks_str)]
    
    if not numbers:
        return (
            "### Academic Performance Analysis\n\n"
            "I couldn't identify numerical marks in your input. Please enter your marks or grades in a format like:\n"
            "- Mathematics: 85\n"
            "- Computer Science: 90\n"
            "- Physics: 65\n\n"
            "Please try again so I can compute your GPA and give specific study recommendations!"
        )
        
    avg = sum(numbers) / len(numbers)
    gpa = (avg / 100) * 4.0
    
    status = "Excellent" if gpa >= 3.5 else "Good" if gpa >= 3.0 else "Average" if gpa >= 2.0 else "Needs Attention"
    
    advice = ""
    if gpa >= 3.5:
        advice = (
            "- **Maintain Momentum:** You are performing exceptionally well. Focus on advanced elective projects and networking for research/internship roles.\n"
            "- **Peer Tutoring:** Teaching concepts to others can solidify your mastery and look great on a resume."
        )
    elif gpa >= 3.0:
        advice = (
            "- **Optimize Study Strategies:** Focus on subjects where you scored below average. Allocate 20% more time to active practice questions in those domains.\n"
            "- **Office Hours:** Seek guidance from professors early on topics that confuse you."
        )
    else:
        advice = (
            "- **Actionable Study Plan:** Create a strict weekly routine. Limit distractions and set up 1-on-1 peer tutoring.\n"
            "- **Target Fundamentals:** Spend time reviewing prerequisite materials. Frequently, lower scores stem from missing foundation blocks."
        )
        
    return (
        f"### Academic Performance Report\n\n"
        f"**Courses Analyzed:** {len(numbers)}  \n"
        f"**Average Score:** {avg:.1f}/100  \n"
        f"**Estimated GPA:** {gpa:.2f} / 4.00 ({status})\n\n"
        f"#### Strengths & Opportunities\n"
        f"- Your highest score was **{max(numbers)}**. This indicates strong understanding and capability in that area.\n"
        f"- Your lowest score was **{min(numbers)}**. This should be your primary target for improvement next semester.\n\n"
        f"#### Recommendations for Action:\n"
        f"{advice}\n\n"
        f"*Note: This feedback is generated automatically by your Smart Academic Companion.*"
    )

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_with_bot(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    if client:
        try:
            model_name = os.environ.get("OPENROUTER_MODEL", "meta-llama/llama-3-8b-instruct:free") if IS_OPENROUTER else "gpt-3.5-turbo"
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful academic assistant. Give structured response, format in markdown."},
                    {"role": "user", "content": req.message}
                ]
            )
            return {"response": response.choices[0].message.content.strip()}
        except Exception as e:
            print(f"Chat API error: {e}. Falling back to mock generator.")
            return {"response": get_mock_chat_response(req.message)}
    else:
        return {"response": get_mock_chat_response(req.message)}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    save_path = f"uploads/{file.filename}"
    os.makedirs("uploads", exist_ok=True)
    with open(save_path, "wb") as f:
        f.write(contents)
    return {"message": f"File '{file.filename}' uploaded successfully"}

@app.get("/notes")
async def list_notes():
    os.makedirs("uploads", exist_ok=True)
    files = []
    for f in os.listdir("uploads"):
        full_path = os.path.join("uploads", f)
        if os.path.isfile(full_path):
            files.append({
                "name": f,
                "size": os.path.getsize(full_path)
            })
    return {"notes": files}

class PerformanceRequest(BaseModel):
    marks: str

@app.post("/performance")
async def analyze_performance(req: PerformanceRequest):
    if not req.marks.strip():
        raise HTTPException(status_code=400, detail="Marks cannot be empty")
        
    if client:
        try:
            prompt = f"Analyze this student's marks and provide academic advice:\n{req.marks}"
            model_name = os.environ.get("OPENROUTER_MODEL", "meta-llama/llama-3-8b-instruct:free") if IS_OPENROUTER else "gpt-3.5-turbo"
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are an academic performance advisor. Formulate guidance with clear sections and headings in markdown."},
                    {"role": "user", "content": prompt}
                ]
            )
            return {"feedback": response.choices[0].message.content.strip()}
        except Exception as e:
            print(f"Performance API error: {e}. Falling back to mock analyzer.")
            return {"feedback": get_mock_performance_analysis(req.marks)}
    else:
        return {"feedback": get_mock_performance_analysis(req.marks)}

class FeedbackRequest(BaseModel):
    message: str

@app.post("/feedback")
async def submit_feedback(req: FeedbackRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Feedback cannot be empty")
    os.makedirs("uploads", exist_ok=True)
    with open("feedback.txt", "a", encoding="utf-8") as f:
        f.write(req.message + "\n---\n")
    return {"message": "Feedback submitted anonymously"}
