from fastapi import FastAPI, HTTPException, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import os
import json
import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from dotenv import load_dotenv
from pipeline import ScriptPipeline
from rag_manager import RAGManager
from planner_agent import PlannerAgent

# Load environment variables
load_dotenv()

# --- Auth Configuration ---
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="Entertainment Script Generator API")

# Enable CORS - Production Safe Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to ["*"] for deployment testing as requested
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# API Router with prefix
api_router = APIRouter(prefix="/api")

# Initialize RAG and Pipeline
# ... (rest of the initialization code)
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
USERS_FILE = "users.json"
ENGAGEMENT_FILE = "user_engagement.json"
TRIAL_USAGE_FILE = "trial_usage.json"

# --- Helper Functions ---
def load_trial_usage():
    if os.path.exists(TRIAL_USAGE_FILE):
        with open(TRIAL_USAGE_FILE, "r") as f:
            return json.load(f)
    return {}

def save_trial_usage(data):
    with open(TRIAL_USAGE_FILE, "w") as f:
        json.dump(data, f, indent=4)

def check_trial_limit(user_id: str, feature: str):
    if user_id != "user_demo" and not user_id.startswith("guest_"):
        return True, 0  # Authenticated users have no limit
    
    usage = load_trial_usage()
    user_usage = usage.get(user_id, {"planner": 0, "generator": 0})
    
    limit = 2
    current = user_usage.get(feature, 0)
    
    if current >= limit:
        return False, current
    
    return True, current

def increment_trial_usage(user_id: str, feature: str):
    if user_id != "user_demo" and not user_id.startswith("guest_"):
        return
    
    usage = load_trial_usage()
    if user_id not in usage:
        usage[user_id] = {"planner": 0, "generator": 0}
    
    usage[user_id][feature] = usage[user_id].get(feature, 0) + 1
    save_trial_usage(usage)
def load_engagement():
    if os.path.exists(ENGAGEMENT_FILE):
        with open(ENGAGEMENT_FILE, "r") as f:
            return json.load(f)
    return {}

def save_engagement(data):
    with open(ENGAGEMENT_FILE, "w") as f:
        json.dump(data, f, indent=4)
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

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

# --- Pydantic Models ---
class Character(BaseModel):
    name: str
    role: Optional[str] = ""
    traits: Optional[str] = ""

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignUpRequest(BaseModel):
    email: EmailStr
    username: str
    password: str

class ScriptCriteria(BaseModel):
    idea: str
    user_id: Optional[str] = "guest"
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
    user_id: Optional[str] = "guest"

class PlanRequest(BaseModel):
    goal: str
    user_id: Optional[str] = "guest"

class EngagementRequest(BaseModel):
    user_id: str
    movie_id: int
    movie_data: Optional[Dict[str, Any]] = None

class RatingRequest(BaseModel):
    user_id: str
    movie_id: int
    rating: float

# --- Endpoints ---
@app.get("/")
async def root():
    return {"message": "Entertainment Script Generator API is running"}

@app.get("/health")
async def health_root():
    return {"status": "ok"}

@api_router.get("/health")
async def health():
    return {"status": "ok"}

@api_router.post("/signup")
async def signup(request: SignUpRequest):
    users = load_users()
    
    if request.email in users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account already exists. Please sign in."
        )
    
    # Check if username exists
    for u in users.values():
        if u["username"] == request.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken. Please choose another one."
            )
            
    userId = f"user_{request.username.lower().replace(' ', '_')}"
    
    users[request.email] = {
        "email": request.email,
        "username": request.username,
        "password": get_password_hash(request.password),
        "userId": userId,
        "created_at": datetime.now().isoformat()
    }
    
    save_users(users)
    
    token = create_access_token({"sub": request.email})
    
    return {
        "success": True,
        "username": request.username,
        "userId": userId,
        "token": token
    }

@api_router.post("/login")
async def login(request: LoginRequest):
    users = load_users()
    
    user = users.get(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found. Please sign up first."
        )
    
    if not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Please try again."
        )
    
    token = create_access_token({"sub": request.email})
    
    # Load user engagement data
    engagement = load_engagement()
    user_data = engagement.get(user["userId"], {
        "watchlist": [],
        "favorites": [],
        "ratings": {}
    })
    
    # Load trial usage (should be 0 for auth users but good for consistency)
    trial_usage = load_trial_usage().get(user["userId"], {"planner": 0, "generator": 0})
    
    return {
        "success": True,
        "username": user["username"],
        "userId": user["userId"],
        "token": token,
        "engagement": user_data,
        "trial_usage": trial_usage
    }

# --- User Engagement Endpoints ---

@api_router.get("/engagement/{user_id}")
async def get_engagement(user_id: str):
    engagement = load_engagement()
    trial_usage = load_trial_usage().get(user_id, {"planner": 0, "generator": 0})
    return {
        "engagement": engagement.get(user_id, {"watchlist": [], "favorites": [], "ratings": {}}),
        "trial_usage": trial_usage
    }

@api_router.post("/watchlist/add")
async def add_to_watchlist(request: EngagementRequest):
    if request.user_id == "user_demo" or request.user_id.startswith("guest_"):
        return {"success": False, "message": "Demo mode restricted"}
    
    engagement = load_engagement()
    user_id = request.user_id
    if user_id not in engagement:
        engagement[user_id] = {"watchlist": [], "favorites": [], "ratings": {}}
    
    # Avoid duplicates
    if not any(m["id"] == request.movie_id for m in engagement[user_id]["watchlist"]):
        engagement[user_id]["watchlist"].append(request.movie_data)
        save_engagement(engagement)
    
    return {"success": True, "watchlist": engagement[user_id]["watchlist"]}

@api_router.post("/watchlist/remove")
async def remove_from_watchlist(request: EngagementRequest):
    if request.user_id == "user_demo" or request.user_id.startswith("guest_"):
        return {"success": False, "message": "Demo mode restricted"}
        
    engagement = load_engagement()
    user_id = request.user_id
    if user_id in engagement:
        engagement[user_id]["watchlist"] = [m for m in engagement[user_id]["watchlist"] if m["id"] != request.movie_id]
        save_engagement(engagement)
    
    return {"success": True, "watchlist": engagement.get(user_id, {}).get("watchlist", [])}

@api_router.post("/favorites/toggle")
async def toggle_favorite(request: EngagementRequest):
    if request.user_id == "user_demo" or request.user_id.startswith("guest_"):
        return {"success": False, "message": "Demo mode restricted"}
        
    engagement = load_engagement()
    user_id = request.user_id
    if user_id not in engagement:
        engagement[user_id] = {"watchlist": [], "favorites": [], "ratings": {}}
    
    favs = engagement[user_id]["favorites"]
    if request.movie_id in favs:
        favs.remove(request.movie_id)
    else:
        favs.append(request.movie_id)
    
    save_engagement(engagement)
    return {"success": True, "favorites": favs}

@api_router.post("/ratings/submit")
async def submit_rating_endpoint(request: RatingRequest):
    if request.user_id == "user_demo" or request.user_id.startswith("guest_"):
        return {"success": False, "message": "Demo mode restricted"}
        
    engagement = load_engagement()
    user_id = request.user_id
    if user_id not in engagement:
        engagement[user_id] = {"watchlist": [], "favorites": [], "ratings": {}}
    
    engagement[user_id]["ratings"][str(request.movie_id)] = request.rating
    save_engagement(engagement)
    return {"success": True, "ratings": engagement[user_id]["ratings"]}

@api_router.get("/get_user_scripts/{user_id}")
async def get_user_scripts(user_id: str):
    try:
        if os.path.exists(SCRIPTS_FILE):
            with open(SCRIPTS_FILE, "r") as f:
                history = json.load(f)
            return history.get(user_id, [])
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/get_user_plans/{user_id}")
async def get_user_plans(user_id: str):
    try:
        if os.path.exists(PLANS_FILE):
            with open(PLANS_FILE, "r") as f:
                history = json.load(f)
            return history.get(user_id, [])
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/plan")
async def create_plan(request: PlanRequest):
    try:
        # Check trial limit
        allowed, count = check_trial_limit(request.user_id, "planner")
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You've used your 2 free demo attempts. Sign in or create an account to continue."
            )
            
        plan = planner.create_plan(request.goal)
        # Save to history
        save_plan_to_history(request.user_id, plan)
        
        # Increment usage
        increment_trial_usage(request.user_id, "planner")
        
        return {**plan, "trial_count": count + 1}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/generate_script")
async def generate_script(criteria: ScriptCriteria):
    try:
        # Check trial limit
        allowed, count = check_trial_limit(criteria.user_id, "generator")
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You've used your 2 free demo attempts. Sign in or create an account to continue."
            )

        # Step 1: Transform/Enrich input
        structured_input = pipeline.transform_user_input(criteria.idea)
        
        # Merge manual criteria
        manual_criteria = criteria.model_dump(exclude_unset=True)
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
        
        # Increment usage
        increment_trial_usage(criteria.user_id, "generator")
        
        return {**result, "trial_count": count + 1}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/refine_script")
async def refine_script(request: RefineRequest):
    try:
        # Check trial limit
        allowed, count = check_trial_limit(request.user_id, "generator")
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You've used your 2 free demo attempts. Sign in or create an account to continue."
            )

        new_scene = pipeline.iterate_scene(request.script, request.action)
        if new_scene.startswith("ERROR:"):
            raise HTTPException(status_code=500, detail=new_scene)
            
        result = {"script": new_scene}
        
        # Save to history
        save_to_history(request.user_id, result)
        
        # Increment usage
        increment_trial_usage(request.user_id, "generator")
        
        return {**result, "trial_count": count + 1}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
