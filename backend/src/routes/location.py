from typing import List, Optional, Dict
from pydantic import BaseModel # type: ignore No warning about pydantic. Imported in requirements.txt
from datetime import datetime
#Import Nokia Api Service
from src.services.opencameragateway import nokia_api_call
# from src.routes.resources import devices

from fastapi import APIRouter,  HTTPException, Depends # type: ignore No warning about pydantic. Imported in requirements.txt

from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from src.configs.database import get_db
from sqlalchemy import select

from src.models.resource import Resource
from src.models.location import Location
import uuid as uuid_pkg

router = APIRouter()


# class Location(BaseModel):
#     latitude: float
#     longitude: float
#     accuracy: Optional[float] = None
#     speed: Optional[float] = None
#     heading: Optional[float] = None
#     timestamp: Optional[datetime] = None



# # Location endpoints
# @router.get("/api/devices/{device_id}/location", response_model=Location, tags=["Location"])
# async def get_device_location(device_id: str):
#     """Get current device location"""
#     if device_id not in devices:
#         raise HTTPException(status_code=404, detail="Device not found")

#     response = await nokia_api_call(
#         "POST",
#         "location",
#         {"device_id": device_id, "accuracy_level": "high"}
#     )

#     location = Location(
#         latitude=response["latitude"],
#         longitude=response["longitude"],
#         accuracy=response.get("accuracy"),
#         speed=response.get("speed"),
#         heading=response.get("heading"),
#         timestamp=datetime.now()
#     )

#     devices[device_id].location = location
#     return location
# #END LOCATION ENDPOINTS

@router.get("/api/devices/{resource_id}/location", response_model=Location, tags=["Location"])
async def get_device_location(resource_id: str, db: Annotated[AsyncSession, Depends(get_db)]):
    try:
        resource_uuid = uuid_pkg.UUID(resource_id)  # Convert to UUID type
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")

    stmt = select(Resource).where(Resource.id == resource_uuid)
    result = await db.execute(stmt)
    resource = result.scalar_one_or_none()

    stmt = select(Location).where(Location.id == resource.actual_location)
    result = await db.execute(stmt)
    location = result.scalar_one_or_none()
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return location
