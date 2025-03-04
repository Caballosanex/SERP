"""
API router for location operations.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..models.device import DeviceLocation
from ..core.nokia_client import nokia_client
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/location", tags=["Location"])


@router.get("/{device_id}", response_model=DeviceLocation)
async def get_device_location(
    device_id: str,
    max_age: Optional[int] = Query(settings.DEFAULT_MAX_AGE, description="Maximum age of location data in seconds")
):
    """Get device location"""
    try:
        device = nokia_client.get_device(phone_number=device_id)
        location = device.location(max_age=max_age)
        
        return DeviceLocation(
            latitude=location.latitude,
            longitude=location.longitude,
            elevation=getattr(location, "elevation", None),
            accuracy=getattr(location, "accuracy", None)
        )
    except Exception as e:
        logger.error(f"Error getting device location: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify")
async def verify_device_location(verification: LocationRequest):
    """Verificar la ubicación de un dispositivo con un radio opcional"""
    try:
        return await location.verify_device_location(
            device_id=verification.device_id,
            radius=verification.radius
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al verificar la ubicación: {str(e)}")
