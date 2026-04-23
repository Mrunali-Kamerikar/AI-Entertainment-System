# CineVerse: AI Entertainment Hub

A comprehensive AI-powered entertainment platform featuring movie recommendations, an intelligent chatbot assistant, and a professional-grade screenplay generator.

---

## 🌟 Key Features

### 🎬 CineVerse Dashboard
- **Personalized Recommendations**: AI-driven movie suggestions tailored to your preferences.
- **Sentiment Analysis**: Real-time breakdown of movie reviews (Positive, Neutral, Negative).
- **Interactive Exploration**: Access detailed movie views, trailers, and cast information.
- **Industry Categories**: Browse films across Bollywood, Hollywood, Tollywood, K-Drama, and Anime.

### 💬 CineVerse Assistant (ChatBot)
- **AI Movie Expert**: Ask anything about films, directors, or genres.
- **Powered by Gemini**: Natural language understanding for human-like conversations.
- **Contextual Suggestions**: Receive movie ideas directly within the chat interface.

### ✍️ Professional Script Generator
- **Multi-Genre Support**: Generate screenplays in Hollywood, Bollywood, K-Drama, and Anime styles.
- **Customizable Criteria**: Specify scene ideas, languages (Hindi, English, Korean, Japanese, etc.), characters, setting, and tone.
- **AI Iteration Tools**:
  - **Intense**: Amplify the drama and stakes of your scene.
  - **Humorous**: Inject wit and comedic timing.
  - **Dialogue Only**: Refine character voices and subtext.
- **RAG-Powered**: Uses Retrieval-Augmented Generation (FAISS) to match professional script patterns.
- **💾 Script History**: Automatically save your generated scripts and access them later.
- **📥 Download Option**: Download your generated scripts as `.txt` files for professional use.
### 🤖 Entertainment Planning Agent
- **Dynamic Reasoning**: A sophisticated multi-step reasoning agent that decomposes complex goals into detailed execution plans.
- **Constraint Extraction**: Automatically identifies time limits, location counts, and specific constraints from vague user goals.
- **Two-Pass Optimization**: Uses a dual-pass LLM approach where an initial plan is generated and then refined for realism and efficiency.
- **Unified Red Theme**: A modern, cinematic dark/red UI that aligns with the CineVerse brand.
- **💾 Plan History**: Persistent storage for your generated plans, accessible via the History view.
- **📥 Plan Downloads**: Download your execution schedules as formatted `.txt` files for offline use.

---

## 🔄 Application Workflow

1.  **Authentication**: Users log in to access personalized features and their script history.
2.  **Exploration**: Browse movies on the dashboard, view ratings, and analyze review sentiments.
3.  **Consultation**: Interact with the AI ChatBot for specific movie-related queries or recommendations.
4.  **Creation**:
    - Open the **Script Generator**.
    - Input scene ideas and configure criteria (language, style, etc.).
    - The **FastAPI Backend** processes the request using **RAG** and **Gemini AI**.
    - Review the generated script and use **Iteration Tools** to refine it.
5.  **Management**: Save your work to history and download the final script.

---

## 🛠️ Tech Stack

### **Backend**
- **Language**: Python 3.10+
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **AI Model**: [Google Gemini AI](https://ai.google.dev/) (via `google-genai` SDK)
- **API Key Management**: Multi-key rotation (3 keys) across 6 model variants to handle quota limits.
- **Vector Store**: [FAISS](https://github.com/facebookresearch/faiss) (Retrieval-Augmented Generation)
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2`
- **Persistence**: JSON-based file storage for user script and plan history.

### **Frontend**
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Motion](https://motion.dev/) (framer-motion)
- **Icons**: [Lucide-React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your Gemini API Keys (comma-separated for rotation)
echo "GOOGLE_API_KEY='key1, key2, key3'" > .env

# Start the server
python server.py
```
The backend will be running at `http://localhost:8000`.

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 📂 Project Structure

```text
Entertainment-Script-Generator/
├── backend/                # FastAPI Python Server
│   ├── pipeline.py         # AI Script Generation Pipeline
│   ├── server.py           # API Endpoints & Persistence
│   ├── prompts.py          # AI Prompt Templates
│   ├── rag_manager.py      # Vector search logic
│   └── requirements.txt    # Python dependencies
├── frontend/               # Vite React Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # UI Components (ChatBot, ScriptGenerator, etc.)
│   │   │   ├── services/   # API Services (backend.ts, tmdb.ts)
│   │   │   └── pages/      # Main Dashboard, Login, and Welcome
│   └── package.json        # Frontend dependencies
└── README.md               # Project documentation
```

## 📝 License
This project is for educational purposes as part of the B.Tech 8th Semester GenAI coursework.
