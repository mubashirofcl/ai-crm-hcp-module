import json
import os
import operator
from typing import TypedDict, Annotated, List, Any
from dotenv import load_dotenv

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage

from agent.tools import (
    log_interaction, edit_interaction, search_hcp_profile,
    get_interaction_history, generate_follow_up_plan
)

load_dotenv()

# State Definition for LangGraph
class AgentState(TypedDict):
    messages: Annotated[List[Any], operator.add]

# LLM Configuration
llm = ChatGroq(
    model=os.getenv("MODEL_NAME", "llama-3.1-8b-instant"),
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.1,
    max_tokens=1024,
    timeout=30,
)

tools = [
    log_interaction,
    edit_interaction,
    search_hcp_profile,
    get_interaction_history,
    generate_follow_up_plan
]

llm_with_tools = llm.bind_tools(tools)

SYSTEM_PROMPT = """You are an AI assistant for a pharmaceutical CRM system.
You help field sales reps log interactions with Healthcare Professionals (HCPs) and manage their CRM data.

When users describe an interaction or make a request, YOU MUST USE THE APPROPRIATE TOOL. 
Do not just answer them; call the tool to update the database.

AVAILABLE HCPs IN SYSTEM (from database):
- ID 1: Dr. Ravi Sharma - Cardiology - Apollo Hospital - New Delhi
- ID 2: Dr. Priya Deshmukh - Oncology - Tata Memorial - Mumbai
- ID 3: Dr. Arjun Reddy - Neurology - NIMHANS - Bengaluru
- ID 4: Dr. Sneha Patel - Rheumatology - AIIMS - Ahmedabad
- ID 5: Dr. Vikram Singh - Internal Medicine - Fortis Escorts - Jaipur
- ID 6: Dr. Anjali Menon - Cardiology - Aster Medcity - Kochi

CRITICAL: If the user mentions a doctor (like "Dr. Mubashir Ali") who is NOT in the list above, DO NOT invent or guess an hcp_id. Instead, politely inform the user that the HCP is not in the system.

PRODUCTS: CardioMax, OncoShield, NeuroClear, ArthroFlex, ImmunoBoost
INTERACTION TYPES: In-Person Visit, Phone Call, Email, Virtual Meeting, Conference
SENTIMENT: Positive, Neutral, Negative

If the user gives you information about a meeting with a valid HCP, extract it and call the 'log_interaction' tool. 
Always use current date (2025-04-29) if not specified.
After the tool runs, you will receive its output. Summarize the output nicely for the user.
For lists or histories, present them neatly in markdown.
"""

# Graph Nodes
def agent_node(state: AgentState):
    messages = state["messages"]
    # Ensure SystemMessage is present at the start
    if not messages or not isinstance(messages[0], SystemMessage):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    # If the LLM decided to use a tool, route to the 'tools' node
    if getattr(last_message, "tool_calls", None):
        return "tools"
    # Otherwise, end the graph
    return END

# Build Official LangGraph StateGraph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(tools))

# Add Edges
workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
workflow.add_edge("tools", "agent")

# Compile LangGraph
crm_graph = workflow.compile()


def run_agent(message: str, conversation_history: list = []) -> dict:
    """
    Main entry point for routers/agent.py to call.
    Runs the full LangGraph and securely parses the final outputs.
    Because Groq is extremely fast, this multi-node graph will still complete in ~3 seconds.
    """
    messages = [SystemMessage(content=SYSTEM_PROMPT)]
    
    # Add history
    for msg in conversation_history[-4:]:
        if msg.get("role") == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg.get("role") == "assistant":
            messages.append(AIMessage(content=msg["content"]))
            
    # Add current message
    messages.append(HumanMessage(content=message))
    
    # INVOKE LANGGRAPH!
    final_state = crm_graph.invoke({"messages": messages})
    
    final_messages = final_state.get("messages", [])
    response_text = "Done."
    if final_messages:
        response_text = final_messages[-1].content
        
    tools_used = []
    form_updates = {}
    
    # Scan through the execution trace to extract tool usage and form updates
    for msg in final_messages:
        if isinstance(msg, AIMessage) and getattr(msg, "tool_calls", None):
            for call in msg.tool_calls:
                if call["name"] not in tools_used:
                    tools_used.append(call["name"])
        
        # If the tool returned form_data JSON, we extract it to instantly update the React UI
        if isinstance(msg, ToolMessage):
            try:
                data = json.loads(msg.content)
                if isinstance(data, dict) and "form_data" in data:
                    form_updates.update(data["form_data"])
            except Exception:
                pass

    return {
        "response": response_text,
        "tools_used": tools_used,
        "form_updates": form_updates,
        "success": True
    }
