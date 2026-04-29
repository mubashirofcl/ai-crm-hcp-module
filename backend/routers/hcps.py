from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from models import HCP, Interaction

router = APIRouter(prefix="/api/hcps", tags=["hcps"])

@router.get("/")
def list_hcps(db: Session = Depends(get_db)):
    hcps = db.query(HCP).all()
    return [
        {
            "id": h.id,
            "full_name": f"Dr. {h.first_name} {h.last_name}",
            "specialty": h.specialty,
            "hospital": h.hospital,
            "city": h.city,
            "tier": h.tier
        } for h in hcps
    ]

@router.get("/{id}")
def get_hcp(id: int, db: Session = Depends(get_db)):
    hcp = db.query(HCP).filter(HCP.id == id).first()
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")
    return hcp

@router.get("/{id}/interactions")
def get_hcp_interactions(id: int, db: Session = Depends(get_db)):
    interactions = db.query(Interaction).filter(Interaction.hcp_id == id).order_by(Interaction.interaction_date.desc()).all()
    return interactions

@router.get("/search/{query}")
def search_hcps(query: str, db: Session = Depends(get_db)):
    search_pattern = f"%{query}%"
    hcps = db.query(HCP).filter(
        or_(
            HCP.first_name.ilike(search_pattern),
            HCP.last_name.ilike(search_pattern),
            HCP.specialty.ilike(search_pattern)
        )
    ).all()
    return hcps
