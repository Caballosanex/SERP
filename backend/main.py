from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import httpx
import uuid
import logging
import asyncio


# Get Settings
from src.configs.config import settings
settings




# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SERP Backend API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from src.routes import emergencies, location, qosod, resources

app.include_router(emergencies.router)
app.include_router(location.router)
app.include_router(qosod.router)
app.include_router(resources.router)


# Config DB
from src.configs.DBSessionManager import sessionmanager

#Seed DB
from src.seeders.main import seed_db
@app.on_event("startup")
async def startup_event():
    # Initialize the DatabaseSessionManager
    # sessionmanager.init_db()
    await seed_db()


@app.on_event("shutdown")
async def shutdown():
    await sessionmanager.close()  # Cleanup DB connecti