from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from app.api import qod, device_status, location
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/nokia_nac.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="SERP Nokia NAC API",
    description="API para interactuar con Nokia Network as Code",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(qod.router)
app.include_router(device_status.router)
app.include_router(location.router)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Nokia NAC microservice")
    # Here you could add initialization code if needed

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Nokia NAC microservice")
    # Here you could add cleanup code if needed

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
