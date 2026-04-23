from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from pipeline import ScriptPipeline
from rag_manager import RAGManager
from planner_agent import PlannerAgent

# Load environment variables
load_dotenv()

app = FastAPI(title="Entertainment Script Generator API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG and Pipeline
rag = RAGManager()
# Initialize with sample data if empty (like in main.py)
if rag.index.ntotal == 0:
    sample_data = [
        {
            "style": "Hollywood",
            "genre": "Crime Thriller",
            "text": "INT. ABANDONED WAREHOUSE - NIGHT\n\nRain drums against the rusted corrugated roof. ARJUN (40s, weary) stands in the shadows, his gun drawn but lowered.\n\nRANA (50s, impeccably dressed) sits on a crate, lighting a cigar with steady hands.\n\nRANA: You're late, Arjun. Even for a man who's lost everything.\n\nARJUN: I haven't lost the ability to pull a trigger, Rana."
        },
        {
            "style": "Bollywood",
            "genre": "Drama",
            "text": "EXT. RAIN-SOAKED TEMPLE STEPS - NIGHT\n\nLightning cracks across the sky. RAHUL (20s, heartbroken) falls to his knees.\n\nRAHUL: (Screaming at the sky) क्यूँ?! (Why did you take her from me? Is this your justice?!)\n\nPRIYA (20s, ethereal) appears. \n\nPRIYA: राहुल, शांत हो जाओ। (Rahul, calm down.)"
        },
        {
            "style": "K-Drama",
            "genre": "Romance",
            "text": "EXT. CHERRY BLOSSOM PARK - DAY\n\nMIN-HO (25, shy) stands across from JI-SOO (24, smiling).\n\nJI-SOO: 안녕하세요. (Hello.) You've been standing there for ten minutes.\n\nMIN-HO: 미안해요. (I'm sorry.) I was waiting for my courage to catch up."
        },
        {
            "style": "Anime",
            "genre": "Action",
            "text": "EXT. CRUMBLING CITYSCAPE - DAY\n\nKENJI (17, determined) stares down the massive MECHA-SENTINEL. His eyes glow with a faint blue light.\n\nKENJI: (Inner monologue) If I don't do this now, no one will. My ancestors... lend me your strength!\n\nKENJI draws his blade, sparks flying as it scrapes against the concrete."
        },
        {
            "style": "Japanese",
            "genre": "Samurai",
            "text": "EXT. CHERRY BLOSSOM GROVE - DUSK\n\nPetals fall like blood. MUSASHI (30s) faces the KAGE-RYU ASSASSIN.\n\nMUSASHI: 覚悟はいいか？ (Are you prepared?)\n\nASSASSIN: 死ぬのはお前だ。 (It is you who will die.)"
        }
    ]
    rag.add_snippets(sample_data)

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Warning: GOOGLE_API_KEY not found in environment.")
pipeline = ScriptPipeline(api_key=api_key)
planner = PlannerAgent()

# Persistence Helpers
SCRIPTS_FILE = "user_scripts.json"
PLANS_FILE = "user_plans.json"

def save_to_history(user_id: str, script_data: Dict[str, Any]):
    try:
        if os.path.exists(SCRIPTS_FILE):
            with open(SCRIPTS_FILE, "r") as f:
                history = json.load(f)
        else:
            history = {}
        
        if user_id not in history:
            history[user_id] = []
        
        # Add timestamp
        script_data["timestamp"] = datetime.now().isoformat()
        history[user_id].insert(0, script_data)  # Newest first
        
        # Limit to last 20 scripts
        history[user_id] = history[user_id][:20]
        
        with open(SCRIPTS_FILE, "w") as f:
            json.dump(history, f)
    except Exception as e:
        print(f"Error saving script history: {e}")

def save_plan_to_history(user_id: str, plan_data: Dict[str, Any]):
    try:
        if os.path.exists(PLANS_FILE):
            with open(PLANS_FILE, "r") as f:
                history = json.load(f)
        else:
            history = {}
        
        if user_id not in history:
            history[user_id] = []
        
        # Add timestamp
        plan_data["timestamp"] = datetime.now().isoformat()
        history[user_id].insert(0, plan_data)  # Newest first
        
        # Limit to last 20 plans
        history[user_id] = history[user_id][:20]
        
        with open(PLANS_FILE, "w") as f:
            json.dump(history, f)
    except Exception as e:
        print(f"Error saving plan history: {e}")

class Character(BaseModel):
    name: str
    role: Optional[str] = ""
    traits: Optional[str] = ""

class LoginRequest(BaseModel):
    username: str
    password: str

class ScriptCriteria(BaseModel):
    idea: str
    user_id: Optional[str] = "guest"  # Added user_id
    language: Optional[str] = "English"
    length: Optional[str] = "Medium (3-5 pages)"
    style: Optional[str] = "Hollywood"
    genre: Optional[str] = ""
    characters: Optional[List[Character]] = []
    setting: Optional[str] = ""
    time: Optional[str] = ""
    tone: Optional[str] = ""

class RefineRequest(BaseModel):
    script: str
    action: str  # "intense", "humorous", "dialogue"
    user_id: Optional[str] = "guest"  # Added user_id

class PlanRequest(BaseModel):
    goal: str
    user_id: Optional[str] = "guest"

@app.get("/")
async def root():
    return {"message": "Entertainment Script Generator API is running"}

@app.post("/login")
async def login(request: LoginRequest):
    # Simplified login for demo purposes
    # In a production app, this would verify credentials against a database
    userId = f"user_{request.username.lower().replace(' ', '_')}"
    return {
        "success": True,
        "username": request.username,
        "userId": userId,
        "token": "mock-jwt-token"
    }

@app.get("/get_user_scripts/{user_id}")
async def get_user_scripts(user_id: str):
    try:
        if os.path.exists(SCRIPTS_FILE):
            with open(SCRIPTS_FILE, "r") as f:
                history = json.load(f)
            return history.get(user_id, [])
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_user_plans/{user_id}")
async def get_user_plans(user_id: str):
    try:
        if os.path.exists(PLANS_FILE):
            with open(PLANS_FILE, "r") as f:
                history = json.load(f)
            return history.get(user_id, [])
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plan")
async def create_plan(request: PlanRequest):
    try:
        plan = planner.create_plan(request.goal)
        # Save to history
        save_plan_to_history(request.user_id, plan)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_script")
async def generate_script(criteria: ScriptCriteria):
    try:
        # Step 1: Transform/Enrich input
        structured_input = pipeline.transform_user_input(criteria.idea)
        
        # Merge manual criteria
        manual_criteria = criteria.dict(exclude_unset=True)
        # Remove 'idea' as it's not part of the structured_input expected by pipeline.generate_scene
        manual_criteria.pop('idea', None)
        
        # Merge manual into structured
        structured_input.update(manual_criteria)
        
        # Step 2: Generate scene
        generated_scene = pipeline.generate_scene(structured_input)
        
        if generated_scene.startswith("ERROR:"):
            raise HTTPException(status_code=500, detail=generated_scene)
            
        result = {
            "script": generated_scene,
            "specifications": structured_input
        }
        
        # Save to history
        save_to_history(criteria.user_id, result)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/refine_script")
async def refine_script(request: RefineRequest):
    try:
        new_scene = pipeline.iterate_scene(request.script, request.action)
        if new_scene.startswith("ERROR:"):
            raise HTTPException(status_code=500, detail=new_scene)
            
        result = {"script": new_scene}
        
        # Save to history
        save_to_history(request.user_id, result)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
