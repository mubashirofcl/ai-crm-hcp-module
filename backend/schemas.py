# backend/schemas.py
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date

class HCPResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    specialty: Optional[str] = None
    hospital: Optional[str] = None
    city: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    tier: Optional[str] = None
    npi_number: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class InteractionCreate(BaseModel):
    hcp_id: int
    rep_id: Optional[int] = None
    interaction_type: Optional[str] = None
    interaction_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    products_discussed: Optional[List[str]] = None
    summary: Optional[str] = None
    notes: Optional[str] = None
    sentiment: Optional[str] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[date] = None
    location: Optional[str] = None
    next_steps: Optional[str] = None

    @field_validator('interaction_date', 'follow_up_date', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        if v == "":
            return None
        return v

class InteractionUpdate(BaseModel):
    hcp_id: Optional[int] = None
    rep_id: Optional[int] = None
    interaction_type: Optional[str] = None
    interaction_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    products_discussed: Optional[List[str]] = None
    summary: Optional[str] = None
    notes: Optional[str] = None
    sentiment: Optional[str] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[date] = None
    location: Optional[str] = None
    next_steps: Optional[str] = None

    @field_validator('interaction_date', 'follow_up_date', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        if v == "":
            return None
        return v

class InteractionResponse(BaseModel):
    id: int
    hcp_id: Optional[int] = None
    rep_id: Optional[int] = None
    interaction_type: Optional[str] = None
    interaction_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    products_discussed: Optional[List[str]] = None
    summary: Optional[str] = None
    notes: Optional[str] = None
    sentiment: Optional[str] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[date] = None
    location: Optional[str] = None
    next_steps: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ChatMessage(BaseModel):
    message: str
    conversation_history: List[Dict[str, Any]] = Field(default_factory=list)

class ChatResponse(BaseModel):
    response: str
    tools_used: List[str] = Field(default_factory=list)
    form_updates: Dict[str, Any] = Field(default_factory=dict)
    success: bool
