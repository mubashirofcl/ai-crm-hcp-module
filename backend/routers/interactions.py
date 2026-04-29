from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Interaction
from schemas import InteractionCreate, InteractionUpdate, InteractionResponse

router = APIRouter(prefix="/api/interactions", tags=["interactions"])

@router.post("/", response_model=dict)
def create_interaction(interaction: InteractionCreate, db: Session = Depends(get_db)):
    db_interaction = Interaction(**interaction.model_dump(exclude_unset=True))
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return {"id": db_interaction.id, "message": "Interaction created successfully"}

@router.get("/{id}", response_model=InteractionResponse)
def get_interaction(id: int, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(Interaction.id == id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction

@router.put("/{id}", response_model=InteractionResponse)
def update_interaction(id: int, interaction: InteractionUpdate, db: Session = Depends(get_db)):
    db_interaction = db.query(Interaction).filter(Interaction.id == id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    update_data = interaction.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interaction, key, value)
    
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@router.get("/", response_model=list[InteractionResponse])
def list_interactions(db: Session = Depends(get_db)):
    return db.query(Interaction).order_by(Interaction.created_at.desc()).limit(20).all()
