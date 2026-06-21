
# Smart Academic Companion (SAC)

Smart Academic Companion is a personalized AI assistant for college students. It helps students with academic guidance, note management, performance tracking, and anonymous feedback.

## 🧠 Features
- 🎓 AI-Powered Chatbot (OpenAI GPT-3.5)
- 📄 Upload and manage notes (PDF)
- 📊 Analyze academic performance
- 💬 Submit anonymous feedback

---

## 🔧 Tech Stack
- **Frontend:** React (with React Router)
- **Backend:** FastAPI
- **AI Integration:** OpenAI GPT-3.5 API

---

## 🚀 Setup Instructions

### Backend (FastAPI)
1. Navigate to the `backend` folder:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install fastapi uvicorn python-multipart openai
```

3. Activate the virtual environment:        
```bash
.\venv\Scripts\Activate.ps1
```


4. Replace the OpenAI API Key:
Edit `main.py` and replace:
```python
openai.api_key = "your-openai-api-key"
```
with your actual OpenAI API key.

4. Run the backend:
```bash
uvicorn main:app --reload
```

---

### Frontend (React)
1. Navigate to the `frontend` folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend server:
```bash
npm run dev
```
Make sure the backend runs on `localhost:8000`.

---

## 🌐 Deployment

- **Frontend** can be deployed using [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
- **Backend** can be hosted using [Render](https://render.com) or [Railway](https://railway.app)

---

## 📁 Folder Structure
```
smart_academic_companion/
├── backend/
│   └── main.py
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── pages/
│           ├── Chatbot.jsx
│           ├── Dashboard.jsx
│           ├── Feedback.jsx
│           ├── PerformanceTracker.jsx
│           └── UploadNotes.jsx
```

---

## 💡 Notes
- Make sure CORS is enabled in the backend (`allow_origins=["*"]`) for local development.
- File uploads are saved in the `uploads/` directory.

---

## ✍️ Created By
Daraniedaran K – [Mailam Engineering College]
