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

print(f"[STARTUP] API Key found: {bool(API_KEY)}")
print(f"[STARTUP] Using OpenRouter: {IS_OPENROUTER}")

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
        print(f"[STARTUP] ✅ AI client initialized successfully!")
    except Exception as e:
        print(f"[STARTUP] ❌ Error initializing API client: {e}")
else:
    print(f"[STARTUP] ⚠️ No valid API key found. Using mock fallback responses.")

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
    elif any(kw in msg for kw in ["ai", "artificial intelligence", "machine learning", "deep learning", "neural network", "llm", "gpt", "chatgpt", "gemini"]):
        return (
            "### Artificial Intelligence & Machine Learning Overview\n\n"
            "AI and ML are transforming the IT industry at an unprecedented pace. Here's a quick breakdown:\n\n"
            "#### Key Concepts\n"
            "- **Machine Learning (ML):** Algorithms that learn patterns from data without being explicitly programmed.\n"
            "- **Deep Learning:** A subset of ML using multi-layer neural networks for complex tasks like image recognition and NLP.\n"
            "- **Large Language Models (LLMs):** Models like GPT-4, Gemini, and LLaMA that understand and generate human-like text.\n\n"
            "#### Current IT Trends (2025-2026)\n"
            "- **Agentic AI:** AI systems that autonomously plan and execute multi-step tasks.\n"
            "- **Multimodal Models:** Models processing text, images, audio, and video together.\n"
            "- **AI in DevOps:** Automated code review, testing, and deployment pipelines.\n"
            "- **Edge AI:** Running AI models locally on devices for faster and private inference.\n\n"
            "Would you like me to dive deeper into any specific area?"
        )
    elif any(kw in msg for kw in ["cloud", "aws", "azure", "gcp", "docker", "kubernetes", "devops", "ci/cd"]):
        return (
            "### Cloud Computing & DevOps in the IT Industry\n\n"
            "Cloud infrastructure is the backbone of modern IT. Here's what you need to know:\n\n"
            "#### Major Cloud Platforms\n"
            "- **AWS (Amazon Web Services):** Market leader with 200+ services. Key: EC2, S3, Lambda, RDS.\n"
            "- **Microsoft Azure:** Strong enterprise integration. Key: Azure Functions, Cosmos DB, AKS.\n"
            "- **Google Cloud Platform (GCP):** Best for data/AI workloads. Key: BigQuery, Vertex AI, Cloud Run.\n\n"
            "#### DevOps Essentials\n"
            "- **Containerization:** Docker packages apps into portable containers.\n"
            "- **Orchestration:** Kubernetes manages container deployments at scale.\n"
            "- **CI/CD:** Continuous Integration and Deployment pipelines automate testing and releases (GitHub Actions, Jenkins).\n\n"
            "#### 2025-2026 Trends\n"
            "- Serverless computing adoption continues to rise.\n"
            "- Infrastructure as Code (IaC) with Terraform is becoming standard.\n"
            "- Platform engineering teams are replacing traditional DevOps roles.\n\n"
            "What specific cloud or DevOps topic would you like to explore?"
        )
    elif any(kw in msg for kw in ["cybersecurity", "security", "hacking", "encryption", "firewall", "vulnerability", "pentest"]):
        return (
            "### Cybersecurity in the IT Sector\n\n"
            "Cybersecurity is one of the fastest-growing fields in IT. Here's an overview:\n\n"
            "#### Core Domains\n"
            "- **Network Security:** Firewalls, IDS/IPS, VPNs, and zero-trust architecture.\n"
            "- **Application Security:** OWASP Top 10, secure coding practices, input validation.\n"
            "- **Cloud Security:** IAM policies, encryption at rest/transit, compliance frameworks.\n"
            "- **Penetration Testing:** Ethical hacking to find vulnerabilities before attackers do.\n\n"
            "#### Current Trends (2025-2026)\n"
            "- **AI-Powered Threat Detection:** Using ML to identify anomalous network behavior.\n"
            "- **Zero Trust Architecture:** 'Never trust, always verify' approach gaining enterprise adoption.\n"
            "- **Quantum-Safe Cryptography:** Preparing encryption standards for post-quantum era.\n"
            "- **Supply Chain Security:** Increased scrutiny of open-source dependencies.\n\n"
            "Want me to explain any specific cybersecurity concept or certification path?"
        )
    elif any(kw in msg for kw in ["web", "react", "javascript", "python", "java", "programming", "coding", "frontend", "backend", "fullstack", "full stack", "api", "database", "sql", "node"]):
        return (
            "### Software Development & Programming\n\n"
            "Software development is the core of the IT industry. Here's a structured overview:\n\n"
            "#### Popular Tech Stacks (2025-2026)\n"
            "- **Frontend:** React, Next.js, Vue.js, Svelte, TypeScript\n"
            "- **Backend:** Node.js, Python (FastAPI/Django), Go, Rust, Java (Spring Boot)\n"
            "- **Databases:** PostgreSQL, MongoDB, Redis, Supabase\n"
            "- **Mobile:** React Native, Flutter, Swift, Kotlin\n\n"
            "#### Industry Trends\n"
            "- **AI-Assisted Development:** GitHub Copilot, Cursor, and AI coding agents are reshaping workflows.\n"
            "- **Edge Computing:** Processing data closer to users for low-latency applications.\n"
            "- **WebAssembly (WASM):** Running high-performance code in browsers beyond JavaScript.\n"
            "- **Serverless & Microservices:** Building scalable, event-driven architectures.\n\n"
            "#### Learning Path\n"
            "1. Pick a language (Python or JavaScript recommended for beginners).\n"
            "2. Build projects — portfolio matters more than certificates.\n"
            "3. Learn Git, APIs, and databases early.\n\n"
            "Which area would you like to dive deeper into?"
        )
    elif any(kw in msg for kw in ["blockchain", "crypto", "web3", "nft", "smart contract", "ethereum", "bitcoin"]):
        return (
            "### Blockchain & Web3 Technology\n\n"
            "Blockchain technology extends far beyond cryptocurrency. Here's what's relevant in IT:\n\n"
            "#### Core Concepts\n"
            "- **Blockchain:** A decentralized, immutable ledger of transactions.\n"
            "- **Smart Contracts:** Self-executing code on platforms like Ethereum and Solana.\n"
            "- **DApps:** Decentralized applications running on blockchain networks.\n\n"
            "#### IT Industry Applications\n"
            "- Supply chain transparency and verification.\n"
            "- Decentralized identity and authentication systems.\n"
            "- Tokenized digital assets and DeFi protocols.\n\n"
            "#### 2025-2026 Trends\n"
            "- Layer 2 scaling solutions (Polygon, Arbitrum) for faster transactions.\n"
            "- Enterprise blockchain adoption (Hyperledger, private chains).\n"
            "- Regulatory frameworks taking shape globally.\n\n"
            "Would you like to learn about smart contract development or blockchain architecture?"
        )
    elif any(kw in msg for kw in ["data science", "big data", "analytics", "pandas", "numpy", "visualization", "tableau", "power bi"]):
        return (
            "### Data Science & Analytics\n\n"
            "Data science is driving decision-making across every IT sector:\n\n"
            "#### Essential Skills\n"
            "- **Programming:** Python (Pandas, NumPy, Scikit-learn), R, SQL.\n"
            "- **Visualization:** Matplotlib, Seaborn, Plotly, Tableau, Power BI.\n"
            "- **Statistics:** Hypothesis testing, regression analysis, probability theory.\n"
            "- **ML Frameworks:** TensorFlow, PyTorch, XGBoost.\n\n"
            "#### Industry Trends (2025-2026)\n"
            "- **Real-time Analytics:** Stream processing with Apache Kafka and Flink.\n"
            "- **DataOps:** Automating data pipelines and governance.\n"
            "- **Generative AI for Data:** Using LLMs to query databases with natural language.\n"
            "- **Data Mesh Architecture:** Decentralized domain-oriented data ownership.\n\n"
            "What specific data science topic would you like to explore?"
        )
    elif any(kw in msg for kw in ["trend", "latest", "current", "news", "update", "2025", "2026", "industry", "job", "placement", "salary", "hiring"]):
        return (
            "### IT Industry Current Affairs & Trends (2025-2026)\n\n"
            "Here are the major trends shaping the IT sector right now:\n\n"
            "#### 🔥 Top Technology Trends\n"
            "1. **Agentic AI & Autonomous Systems** — AI agents that plan, reason, and execute tasks independently.\n"
            "2. **Spatial Computing & XR** — Apple Vision Pro and Meta Quest driving mixed reality adoption.\n"
            "3. **Quantum Computing** — IBM, Google, and startups pushing toward practical quantum advantage.\n"
            "4. **Green IT & Sustainable Tech** — Carbon-aware computing and energy-efficient data centers.\n"
            "5. **AI Governance & Ethics** — EU AI Act and global regulatory frameworks being enforced.\n\n"
            "#### 💼 IT Job Market Insights\n"
            "- **In-Demand Roles:** AI/ML Engineers, Cloud Architects, Cybersecurity Analysts, Data Engineers, Full-Stack Developers.\n"
            "- **Emerging Roles:** Prompt Engineers, AI Safety Researchers, Platform Engineers.\n"
            "- **Skill Premium:** Cloud certifications (AWS, Azure, GCP) and AI/ML skills command 20-40% higher salaries.\n\n"
            "#### 🏢 Major Industry Moves\n"
            "- Tech giants investing heavily in AI infrastructure and custom chips.\n"
            "- Remote/hybrid work remains standard in IT companies globally.\n"
            "- Open-source AI models challenging proprietary solutions.\n\n"
            "Want details on any specific trend or career path?"
        )
    else:
        return (
            f"Thank you for reaching out! As your Smart Academic Companion, I'm equipped to help with a wide range of topics:\n\n"
            f"You asked: *\"{message}\"*\n\n"
            f"### What I Can Help You With\n\n"
            f"#### 📚 Academics & Studies\n"
            f"- Explain any subject topic (CS, Math, Physics, Engineering)\n"
            f"- Design study schedules and exam preparation plans\n"
            f"- Solve coding questions and explain algorithms\n\n"
            f"#### 💻 Technology & Development\n"
            f"- Programming languages, frameworks, and best practices\n"
            f"- Cloud computing, DevOps, and system design\n"
            f"- AI/ML concepts and implementation guidance\n\n"
            f"#### 🌐 IT Industry & Current Affairs\n"
            f"- Latest tech trends and industry developments\n"
            f"- Career guidance, job market insights, and certifications\n"
            f"- Cybersecurity, blockchain, and emerging technologies\n\n"
            f"Try asking something specific like *'Explain cloud computing'*, *'Latest AI trends 2026'*, or *'How to prepare for a React interview'*!"
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
                    {"role": "system", "content": (
                        "You are a Smart Academic Companion — an expert AI assistant for students and tech enthusiasts. "
                        "You can answer ANY question related to:\n"
                        "1. **Academics & Studies** — All subjects including Computer Science, Mathematics, Physics, Engineering, and more.\n"
                        "2. **Technology & Development** — Programming languages, frameworks, software architecture, cloud computing, DevOps, AI/ML, databases, APIs, and development best practices.\n"
                        "3. **IT Industry Current Affairs** — Latest tech trends, industry news, job market insights, emerging technologies (AI, blockchain, quantum computing, cybersecurity), company developments, and career guidance.\n\n"
                        "Guidelines:\n"
                        "- Give detailed, well-structured responses formatted in markdown with headers, bullet points, and code blocks where appropriate.\n"
                        "- Include practical examples, real-world applications, and actionable advice.\n"
                        "- When discussing current trends, reference the latest developments in 2025-2026.\n"
                        "- For coding questions, provide working code examples with explanations.\n"
                        "- Be enthusiastic, encouraging, and thorough in your responses."
                    )},
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
