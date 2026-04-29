from fastapi import APIRouter
from schemas import ChatMessage
from agent.graph import run_agent

router = APIRouter(prefix="/api/agent", tags=["agent"])

@router.post("/chat")
async def chat_with_agent(body: ChatMessage):
    try:
        result = run_agent(
            message=body.message,
            conversation_history=body.conversation_history or []
        )
        return result
    except Exception as e:
        return {
            "response": f"Error: {str(e)}",
            "tools_used": [],
            "form_updates": {},
            "success": False
        }

@router.get("/tools")
def get_tools():
    return {
        "tools": [
            {"name": "log_interaction", "description": "Log a new HCP interaction from natural language"},
            {"name": "edit_interaction", "description": "Edit a specific field of an existing interaction"},
            {"name": "search_hcp_profile", "description": "Search HCP profiles by name or specialty"},
            {"name": "get_interaction_history", "description": "Get past interaction history for an HCP"},
            {"name": "generate_follow_up_plan", "description": "Generate AI follow-up plan for next visit"}
        ]
    }
