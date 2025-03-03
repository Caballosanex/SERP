from typing import List, Optional, Dict
from pydantic import BaseModel # type: ignore No warning about pydantic. Imported in requirements.txt
from datetime import datetime
#Import Nokia Api Service
from src.services.opencameragateway import nokia_api_call
from src.routes.resources import devices

from fastapi import APIRouter, HTTPException # type: ignore No warning about pydantic. Imported in requirements.txt

router = APIRouter()




class Location(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None
    timestamp: Optional[datetime] = None



# Location endpoints
@router.get("/api/devices/{device_id}/location", response_model=Location, tags=["Location"])
async def get_device_location(device_id: str):
    """Get current device location"""
    if device_id not in devices:
        raise HTTPException(status_code=404, detail="Device not found")

    response = await nokia_api_call(
        "POST",
        "location",
        {"device_id": device_id, "accuracy_level": "high"}
    )

    location = Location(
        latitude=response["latitude"],
        longitude=response["longitude"],
        accuracy=response.get("accuracy"),
        speed=response.get("speed"),
        heading=response.get("heading"),
        timestamp=datetime.now()
    )

    devices[device_id].location = location
    return location
#END LOCATION ENDPOINTS 