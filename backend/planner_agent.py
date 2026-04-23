import os
import json
import time
import random
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='planner_agent.log',
    filemode='a'
)
logger = logging.getLogger("PlannerAgent")

class PlannerStep(BaseModel):
    step_id: int = Field(description="Unique ID for the step")
    action: str = Field(description="Description of the action to take")
    dependency: Optional[int] = Field(description="ID of the step this depends on, if any")
    resource_required: str = Field(description="Resource or tool needed for this step")
    estimated_time: str = Field(description="Time estimated to complete this step")

class ExecutionSchedule(BaseModel):
    goal: str = Field(description="The high-level goal being planned")
    steps: List[PlannerStep] = Field(description="Decomposed steps for the goal")
    total_estimated_time: str = Field(description="Total time for the entire plan")
    validation_status: str = Field(description="Status of resource validation (e.g., 'Validated', 'Pending')")

class PlannerAgent:
    def __init__(self):
        # Support multiple API keys separated by commas in .env
        api_keys_raw = os.getenv("GOOGLE_API_KEY", "")
        self.api_keys = [k.strip() for k in api_keys_raw.split(",") if k.strip()]
        
        if not self.api_keys:
            logger.error("No GOOGLE_API_KEY(s) found in .env")
            self.clients = []
        else:
            self.clients = [genai.Client(api_key=key) for key in self.api_keys]
            logger.info(f"Initialized {len(self.clients)} API clients for rotation.")
        
        # Models for rotation to handle 429 errors
        self.model_pool = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-2.0-flash",
            "gemini-1.5-pro",
            "gemini-2.0-flash-lite-preview-02-05",
            "gemini-flash-latest"
        ]

    def _call_llm(self, system_instruction: str, user_prompt: str, temperature: float = 0.7) -> str:
        """
        Robust LLM call with key rotation and model rotation.
        """
        if not self.clients:
            raise Exception("No Gemini API clients initialized. Check GOOGLE_API_KEY.")

        max_attempts = len(self.api_keys) * len(self.model_pool)
        base_delay = 1 

        for attempt in range(max_attempts):
            client = self.clients[attempt % len(self.clients)]
            model_name = self.model_pool[(attempt // len(self.clients)) % len(self.model_pool)]
            
            try:
                logger.info(f"Calling LLM (Key Index {attempt % len(self.clients)}, Model {model_name}, Attempt {attempt+1})")
                
                config = {
                    "temperature": temperature,
                    "system_instruction": system_instruction,
                }
                
                response = client.models.generate_content(
                    model=model_name,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(**config)
                )
                
                if not response.text:
                    raise Exception("Empty response from LLM")
                
                return response.text

            except Exception as e:
                error_str = str(e).lower()
                if "429" in error_str or "resource_exhausted" in error_str:
                    logger.warning(f"Quota exhausted for key {attempt % len(self.clients)} with model {model_name}. Rotating...")
                    if attempt == max_attempts - 1:
                        raise e 
                    if (attempt + 1) % len(self.clients) == 0:
                        time.sleep(base_delay * ((attempt // len(self.clients)) + 1))
                elif "404" in error_str:
                    continue
                else:
                    if attempt == max_attempts - 1: raise e
                    time.sleep(0.5)

        raise Exception("LLM Quota Limit Reached across all keys and models")

    def _parse_plan(self, text: str) -> Dict[str, Any]:
        """
        Parses the LLM's text output into a structured ExecutionSchedule.
        """
        sections = {
            "GOAL:": "",
            "ASSUMPTIONS:": "",
            "PLAN OVERVIEW:": "",
            "DETAILED SCHEDULE:": "",
            "RESOURCES NEEDED:": "",
            "OPTIMIZATION TIPS:": ""
        }
        
        current_section = None
        lines = text.split('\n')
        
        for line in lines:
            line_stripped = line.strip()
            found_header = False
            for header in sections.keys():
                if line_stripped.upper().startswith(header):
                    current_section = header
                    found_header = True
                    break
            
            if found_header:
                continue
                
            if current_section:
                sections[current_section] += line + "\n"

        # Extract Goal
        goal = sections["GOAL:"].strip() or "Dynamic Plan"
        
        # Parse Steps from DETAILED SCHEDULE
        steps = []
        schedule_text = sections["DETAILED SCHEDULE:"].strip()
        step_id = 1
        for line in schedule_text.split('\n'):
            line = line.strip()
            if line and (line[0].isdigit() or 'AM' in line.upper() or 'PM' in line.upper() or '-' in line):
                # Try to extract time and action
                parts = line.split(':', 1)
                if len(parts) == 2:
                    time_slot = parts[0].strip()
                    action = parts[1].strip()
                else:
                    time_slot = "TBD"
                    action = line
                
                steps.append({
                    "step_id": step_id,
                    "action": action,
                    "resource_required": "Refer to Resources Section",
                    "estimated_time": time_slot,
                    "dependency": step_id - 1 if step_id > 1 else None
                })
                step_id += 1

        # If no steps found, create a fallback step with the overview
        if not steps:
            steps.append({
                "step_id": 1,
                "action": sections["PLAN OVERVIEW:"].strip()[:200] or "Execute the plan as described.",
                "resource_required": "General",
                "estimated_time": "Full Day",
                "dependency": None
            })

        return {
            "goal": goal,
            "steps": steps,
            "total_estimated_time": "See Detailed Schedule",
            "validation_status": "Validated",
            "full_text_plan": text # Keep the full text for display
        }

    def create_plan(self, goal: str) -> Dict[str, Any]:
        """
        Generates a dynamic planning agent response based on the new requirements.
        Uses a two-pass LLM approach for generation and optimization.
        """
        # Step 2: Extract constraints (simple heuristic for now, or use LLM)
        # We'll use a lightweight LLM call to extract constraints as requested in the execution flow
        extraction_prompt = "Extract key constraints like time limits, number of locations, or specific goals from this user input. Return them as a comma-separated list."
        try:
            constraints = self._call_llm(
                system_instruction="You are a constraint extractor.",
                user_prompt=f"Input: {goal}\n{extraction_prompt}",
                temperature=0.1
            )
            logger.info(f"Extracted constraints: {constraints}")
        except:
            constraints = "None detected"

        system_prompt = """You are an intelligent Planning Agent designed to convert vague user goals into detailed, realistic, and time-bound execution plans. 

Your job is to: 

* Understand the user’s intent, even if the input is short or vague 
* Make smart assumptions when details are missing 
* Break the goal into logical phases 
* Decompose each phase into actionable steps 
* Assign realistic time slots to each step 
* Optimize for efficiency and real-world constraints 
* Think like a human planner: practical, structured, and goal-oriented 

Output format MUST be: 

GOAL: <Restate clearly> 

ASSUMPTIONS: <List assumptions> 

PLAN OVERVIEW: <Phases> 

DETAILED SCHEDULE: 
<Time-based steps like 8:00 AM – 9:00 AM: Action item> 

RESOURCES NEEDED: 
<List tools, platforms, people> 

OPTIMIZATION TIPS: <Improvements and efficiency tips> 

RULES: 

* Be specific and realistic 
* No generic advice 
* Respect all constraints (time, number of locations, etc.) 
* Ensure plans fit within real-world time limits (e.g., one-day plans max ~16 hours) 
"""
        
        try:
            # Step 3: Append constraints to prompt
            user_prompt = f"User Goal: {goal}\nDetected Constraints: {constraints}"
            
            # Step 4: Send to LLM (Pass 1: Initial Generation)
            logger.info(f"Pass 1: Generating initial plan for: {goal}")
            initial_plan = self._call_llm(
                system_instruction=system_prompt, 
                user_prompt=user_prompt, 
                temperature=0.7
            )

            # Step 5: Optimization Pass (Requirement 6)
            logger.info("Pass 2: Optimizing plan...")
            optimization_instruction = "Improve this plan for realism, efficiency, and better time optimization. Maintain the required format strictly."
            final_plan_text = self._call_llm(
                system_instruction=system_prompt, 
                user_prompt=f"Original Plan:\n{initial_plan}\n\nTask: {optimization_instruction}", 
                temperature=0.6 
            )

            # Step 6: Return structured response
            return self._parse_plan(final_plan_text)

        except Exception as e:
            logger.error(f"Error in PlannerAgent: {e}")
            return {
                "goal": f"Error: {goal}",
                "steps": [{
                    "step_id": 1,
                    "action": f"Failed to generate plan: {str(e)}",
                    "resource_required": "System",
                    "estimated_time": "0 min",
                    "dependency": None
                }],
                "total_estimated_time": "N/A",
                "validation_status": "Error"
            }

if __name__ == "__main__":
    # Test the agent with the example goal
    agent = PlannerAgent()
    test_goal = "promote a movie in one day at 8 places"
    result = agent.create_plan(test_goal)
    print("\n--- FINAL PLAN ---\n")
    print(result)
