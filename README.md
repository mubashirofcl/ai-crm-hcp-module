# 💊 AI-First CRM HCP Module

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![LangGraph](https://img.shields.io/badge/LangGraph-Agent-FF6F00?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-llama--3.1--8b-F55036?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 📖 Overview
The AI-First CRM HCP Module is a next-generation healthcare relationship management system engineered to eliminate manual data entry for field representatives. It features a premium, card-based split-screen interface where a dynamic, read-only structured form is seamlessly controlled by a conversational AI assistant. Built as a technical submission, the system utilizes an optimized **LangGraph** architecture and **Groq API** to intelligently parse natural language and automatically execute complex database operations in under 3 seconds.

## ✨ Key Features
- **Premium Split-Screen UI:** A sleek, modern card-based layout featuring frosted glass headers and responsive scaling.
- **AI-Controlled Form:** Zero manual entry required—the AI maps conversations directly into the PostgreSQL database and pushes updates to the React UI instantly via Redux.
- **5 LangGraph Tools:** Autonomous agent routing with a strict `StateGraph` setup to handle searches, logs, edits, and analytics.
- **Groq LLM Integration:** Lightning-fast inference using models like `llama-3.1-8b-instant` and `gemma2-9b-it`.
- **PostgreSQL Database:** Robust, persistent relational storage mapped securely via SQLAlchemy ORM.

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18, Redux Toolkit | Card-based split-screen UI, dynamic state management |
| **Backend** | FastAPI (Python) | High-performance REST API routing and orchestrator |
| **Database** | PostgreSQL, SQLAlchemy | Relational data persistence and ORM modeling |
| **AI Agent** | LangGraph, LangChain | Stateful graph execution (`StateGraph`) and Tool binding |
| **LLM Inference**| Groq API | Ultra-fast natural language understanding and extraction |

## 🧠 LangGraph Agent Tools

| Tool Name | Trigger Phrase (Example) | What It Does |
|-----------|--------------------------|--------------|
| `log_interaction` | *"I met with Dr. Priya Sharma today..."* | Extracts details (products, sentiment, duration) and saves a new interaction to the DB. |
| `edit_interaction`| *"Change the duration to 45 minutes..."* | Dynamically targets and updates a specific field in the newly logged interaction. |
| `search_hcp_profile` | *"Find Dr. Rajesh Kumar..."* | Searches the database for Healthcare Professional profiles. |
| `get_interaction_history` | *"Show my history with Dr. Sarah Johnson."* | Retrieves a chronologically ordered list of past interactions with an HCP. |
| `generate_follow_up_plan` | *"Plan my next visit for Dr. Priya Sharma."* | Analyzes past interactions and generates a structured follow-up action plan. |

## 📂 Project Structure

```text
ai-crm-hcp-module/
├── backend/
│   ├── agent/
│   │   ├── graph.py         # The core LangGraph StateGraph implementation
│   │   └── tools.py         # The 5 @tool decorated DB functions
│   ├── routers/
│   │   ├── agent.py
│   │   ├── hcps.py
│   │   └── interactions.py
│   ├── .env                 # Environment variables (Groq Key, DB URL)
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── requirements.txt
│   └── schemas.py
├── database/
│   └── schema.sql           # Initial DB migration script
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── LogInteraction/
│   │   │       ├── ChatInterface.jsx   # Right-side AI Chat
│   │   │       ├── LogInteractionPage.jsx # Main Split-Screen Container
│   │   │       └── StructuredForm.jsx  # Left-side Auto-updating Form
│   │   ├── store/
│   │   │   ├── agentSlice.js
│   │   │   └── interactionSlice.js
│   │   ├── App.css          # Premium layout styling
│   │   ├── App.jsx
│   │   ├── index.css        # Global variables (Google Inter font)
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- A valid Groq API Key

### 2. Database Setup
Ensure PostgreSQL is running locally on port `5432` with a user `crm_user` and password `crm_password123`. Then execute the schema:
```bash
psql -U postgres -c "CREATE DATABASE crm_hcp_db;"
psql -U postgres -d crm_hcp_db -f database/schema.sql
```

### 3. Backend Setup
Navigate to the backend directory, create a virtual environment, and start the FastAPI server:
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate  
pip install -r requirements.txt

# Add your GROQ_API_KEY inside the .env file
# MODEL_NAME=llama-3.1-8b-instant

uvicorn main:app --reload --port 8000
```

### 4. Frontend Setup
In a new terminal window, install dependencies and start the React application:
```bash
cd frontend
npm install
npm start
```
The application will automatically open at `http://localhost:3000`.

## 💬 How to Use

Interact with the AI Assistant on the right panel using natural language. Try these exact example prompts to test the LangGraph routing:

1. **Logging:** *"I visited Dr. Sarah Johnson today at City Medical Center for 30 minutes. We discussed CardioMax. The meeting was extremely positive."*  
2. **Editing:** *"Actually, update the duration of that meeting to 45 minutes."*  
3. **Searching:** *"Find Dr. Priya Sharma."*  
4. **History:** *"What was my last interaction with Dr. Sharma?"*  
5. **Planning:** *"What should I do next for Dr. Sarah Johnson based on our history?"*  

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/agent/chat` | Main LangGraph conversational endpoint (returns `form_updates`) |
| `GET`  | `/api/agent/tools` | Returns metadata for the 5 AI tools |
| `GET`  | `/api/hcps` | Lists all seeded HCPs |
| `POST` | `/api/interactions` | Manual fallback endpoint to save an interaction |

