import json
from datetime import datetime
from langchain_core.tools import tool
from database import SessionLocal
from models import Interaction, HCP, Rep
from sqlalchemy import or_, desc

@tool
def log_interaction(
    hcp_id: str,
    interaction_type: str,
    interaction_date: str,
    duration_minutes: str,
    products_discussed: str,
    notes: str,
    sentiment: str,
    follow_up_required: str,
    location: str,
    next_steps: str = ""
) -> str:
    """Extracts interaction details from natural language and logs a new HCP interaction to the database."""
    db = SessionLocal()
    try:
        # Parse interaction_date string to datetime
        try:
            dt = datetime.fromisoformat(interaction_date.replace("Z", "+00:00"))
        except ValueError:
            dt = datetime.now()

        # Handle comma-separated products string
        products_list = [p.strip() for p in products_discussed.split(",") if p.strip()] if products_discussed else []

        try:
            dur_mins = int(duration_minutes)
        except (ValueError, TypeError):
            dur_mins = 0
            
        if isinstance(follow_up_required, str):
            follow_req = follow_up_required.lower() in ("true", "1", "yes", "y")
        else:
            follow_req = bool(follow_up_required)

        new_interaction = Interaction(
            hcp_id=int(hcp_id),
            interaction_type=interaction_type,
            interaction_date=dt,
            duration_minutes=dur_mins,
            products_discussed=products_list,
            notes=notes,
            sentiment=sentiment,
            follow_up_required=follow_req,
            location=location,
            next_steps=next_steps
        )
        db.add(new_interaction)
        db.commit()
        db.refresh(new_interaction)

        form_data = {
            "hcp_id": new_interaction.hcp_id,
            "interaction_type": new_interaction.interaction_type,
            "interaction_date": new_interaction.interaction_date.isoformat() if new_interaction.interaction_date else None,
            "duration_minutes": new_interaction.duration_minutes,
            "products_discussed": products_list,
            "notes": new_interaction.notes,
            "sentiment": new_interaction.sentiment,
            "follow_up_required": new_interaction.follow_up_required,
            "location": new_interaction.location,
            "next_steps": new_interaction.next_steps
        }

        return json.dumps({
            "success": True,
            "interaction_id": new_interaction.id,
            "message": "Interaction logged",
            "form_data": form_data
        })
    except Exception as e:
        db.rollback()
        return json.dumps({"success": False, "message": str(e)})
    finally:
        db.close()

@tool
def edit_interaction(interaction_id: str, field_name: str, new_value: str) -> str:
    """Edits a specific field of an existing logged interaction."""
    db = SessionLocal()
    try:
        interaction = db.query(Interaction).filter(Interaction.id == int(interaction_id)).first()
        if not interaction:
            return json.dumps({"success": False, "message": "Interaction not found"})

        parsed_value = new_value
        if field_name == "interaction_date" or field_name == "follow_up_date":
            try:
                parsed_value = datetime.fromisoformat(new_value.replace("Z", "+00:00"))
            except ValueError:
                pass
        elif field_name == "duration_minutes":
            parsed_value = int(new_value)
        elif field_name == "follow_up_required":
            parsed_value = new_value.lower() in ("true", "1", "yes")
        elif field_name == "products_discussed":
            parsed_value = [p.strip() for p in new_value.split(",") if p.strip()]

        setattr(interaction, field_name, parsed_value)
        db.commit()

        returned_value = parsed_value
        if isinstance(parsed_value, datetime):
            returned_value = parsed_value.isoformat()

        return json.dumps({
            "success": True,
            "message": f"Updated field {field_name}",
            "form_data": {field_name: returned_value}
        })
    except Exception as e:
        db.rollback()
        return json.dumps({"success": False, "message": str(e)})
    finally:
        db.close()

@tool
def search_hcp_profile(search_query: str) -> str:
    """Searches for HCP profiles by name or specialty and returns their details."""
    db = SessionLocal()
    try:
        search_pattern = f"%{search_query}%"
        hcps = db.query(HCP).filter(
            or_(
                HCP.first_name.ilike(search_pattern),
                HCP.last_name.ilike(search_pattern),
                HCP.specialty.ilike(search_pattern),
                HCP.hospital.ilike(search_pattern)
            )
        ).all()

        hcp_list = []
        for hcp in hcps:
            interaction_count = db.query(Interaction).filter(Interaction.hcp_id == hcp.id).count()
            hcp_list.append({
                "id": hcp.id,
                "first_name": hcp.first_name,
                "last_name": hcp.last_name,
                "specialty": hcp.specialty,
                "hospital": hcp.hospital,
                "city": hcp.city,
                "tier": hcp.tier,
                "interaction_count": interaction_count
            })

        return json.dumps(hcp_list)
    except Exception as e:
        return json.dumps({"success": False, "message": str(e)})
    finally:
        db.close()

@tool
def get_interaction_history(hcp_id: str, limit: str = "5") -> str:
    """Retrieves the recent interaction history for a specific HCP."""
    db = SessionLocal()
    try:
        interactions = db.query(Interaction).filter(Interaction.hcp_id == int(hcp_id)).order_by(desc(Interaction.interaction_date)).limit(int(limit)).all()
        
        history = []
        for i in interactions:
            history.append({
                "id": i.id,
                "interaction_type": i.interaction_type,
                "interaction_date": i.interaction_date.isoformat() if i.interaction_date else None,
                "duration_minutes": i.duration_minutes,
                "products_discussed": i.products_discussed,
                "sentiment": i.sentiment,
                "summary": i.summary,
                "next_steps": i.next_steps
            })

        return json.dumps(history)
    except Exception as e:
        return json.dumps({"success": False, "message": str(e)})
    finally:
        db.close()

@tool
def generate_follow_up_plan(hcp_id: str, last_interaction_summary: str) -> str:
    """Generates a smart follow-up action plan for the next HCP visit based on interaction history."""
    db = SessionLocal()
    try:
        hcp = db.query(HCP).filter(HCP.id == int(hcp_id)).first()
        if not hcp:
            return json.dumps({"success": False, "message": "HCP not found"})

        recent_interactions = db.query(Interaction).filter(Interaction.hcp_id == int(hcp_id)).order_by(desc(Interaction.interaction_date)).limit(3).all()
        
        all_products = set()
        for i in recent_interactions:
            if i.products_discussed:
                for p in i.products_discussed:
                    all_products.add(p)
                    
        plan = {
            "hcp_name": f"{hcp.first_name} {hcp.last_name}",
            "specialty": hcp.specialty,
            "recommended_timing": "Within 2-4 weeks based on HCP tier",
            "talking_points": [
                f"Follow up on {', '.join(all_products) if all_products else 'latest medical guidelines'}",
                "Address any outstanding questions from previous interactions",
                f"Share new efficacy data relevant to {hcp.specialty}"
            ],
            "action_items": [
                "Prepare relevant clinical trial summaries",
                "Ensure sufficient samples are available",
                "Draft follow-up email confirming meeting time"
            ],
            "context_summary": last_interaction_summary
        }

        return json.dumps(plan)
    except Exception as e:
        return json.dumps({"success": False, "message": str(e)})
    finally:
        db.close()
