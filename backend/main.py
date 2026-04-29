from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import interactions, hcps, agent

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-First CRM HCP Module", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interactions.router)
app.include_router(hcps.router)
app.include_router(agent.router)

@app.on_event("startup")
def startup_event():
    print("CRM Backend started successfully")

@app.get("/")
def health_check():
    return {"status": "running", "version": "1.0.0", "docs": "/docs"}
