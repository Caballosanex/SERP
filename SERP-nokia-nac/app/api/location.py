"""
API router for location operations.
"""
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import LocationRequest
from app.services import location

router = APIRouter(prefix="/device/location", tags=["Location"])


@router.get("/{device_id}")
async def get_device_location(device_id: str, max_age: int = 3600):
    """Obtener la ubicación de un dispositivo"""
    try:
        return await location.get_device_location(device_id, max_age)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener la ubicación del dispositivo: {str(e)}")


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
