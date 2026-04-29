# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Text, ARRAY, func
from sqlalchemy.orm import relationship
from database import Base

class HCP(Base):
    __tablename__ = "hcps"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    specialty = Column(String(255))
    hospital = Column(String(255))
    city = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    tier = Column(String(1))
    npi_number = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())

class Rep(Base):
    __tablename__ = "reps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    territory = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"))
    rep_id = Column(Integer, ForeignKey("reps.id"))
    interaction_type = Column(String(100))
    interaction_date = Column(DateTime)
    duration_minutes = Column(Integer)
    products_discussed = Column(ARRAY(Text))
    summary = Column(Text)
    notes = Column(Text)
    sentiment = Column(String(50))
    follow_up_required = Column(Boolean, default=False)
    follow_up_date = Column(Date)
    location = Column(String(255))
    next_steps = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    interaction_id = Column(Integer, ForeignKey("interactions.id"))
    description = Column(Text, nullable=False)
    due_date = Column(Date)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, server_default=func.now())

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(255))
    description = Column(Text)
