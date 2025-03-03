from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import logging

from src.services import nokia_nac

# Configura el logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/nokia", tags=["Nokia NAC"])

# Modelos de datos
class DeviceInfo(BaseModel):
    device_id: str  # Formato: device@testcsp.net o número de teléfono

class QoDSessionCreate(BaseModel):
    device_id: str
    profile: str
    duration: Optional[int] = 3600  # Duración en segundos (por defecto 1 hora)

class LocationVerification(BaseModel):
    device_id: str
    radius: Optional[int] = None

class StatusSubscription(BaseModel):
    device_id: str
    notification_url: str
    notification_token: Optional[str] = None

# Rutas para Device Status
@router.get("/device/status/{device_id}")
async def get_device_status(device_id: str):
    """Obtener el estado de un dispositivo (online/offline)"""
    try:
        return await nokia_nac.get_device_status(device_id)
    except Exception as e:
        logger.error(f"Error al obtener el estado del dispositivo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener el estado del dispositivo: {str(e)}")

@router.post("/device/status/subscribe")
async def subscribe_to_device_status(subscription: StatusSubscription):
    """Suscribirse a cambios de estado de un dispositivo"""
    try:
        return await nokia_nac.subscribe_to_device_status(
            device_id=subscription.device_id,
            notification_url=subscription.notification_url,
            notification_token=subscription.notification_token
        )
    except Exception as e:
        logger.error(f"Error al suscribirse a cambios de estado: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al suscribirse a cambios de estado: {str(e)}")

@router.delete("/device/status/subscription/{subscription_id}")
async def unsubscribe_from_device_status(subscription_id: str):
    """Cancelar una suscripción a cambios de estado"""
    try:
        return await nokia_nac.unsubscribe_from_device_status(subscription_id)
    except Exception as e:
        logger.error(f"Error al cancelar la suscripción: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al cancelar la suscripción: {str(e)}")

# Rutas para Device Location
@router.get("/device/location/{device_id}")
async def get_device_location(device_id: str):
    """Obtener la ubicación de un dispositivo"""
    try:
        return await nokia_nac.get_device_location(device_id)
    except Exception as e:
        logger.error(f"Error al obtener la ubicación del dispositivo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener la ubicación del dispositivo: {str(e)}")

@router.post("/device/location/verify")
async def verify_device_location(verification: LocationVerification):
    """Verificar la ubicación de un dispositivo con un radio opcional"""
    try:
        return await nokia_nac.verify_device_location(
            device_id=verification.device_id,
            radius=verification.radius
        )
    except Exception as e:
        logger.error(f"Error al verificar la ubicación: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al verificar la ubicación: {str(e)}")

# Rutas para QoD (Quality of Service on Demand)
@router.post("/qod/sessions")
async def create_qod_session(session: QoDSessionCreate):
    """Crear una sesión de Quality of Service on Demand (QoD)"""
    try:
        return await nokia_nac.create_qod_session(
            device_id=session.device_id,
            profile=session.profile,
            duration=session.duration
        )
    except Exception as e:
        logger.error(f"Error al crear sesión QoD: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al crear sesión QoD: {str(e)}")

@router.get("/qod/sessions/{session_id}")
async def get_qod_session(session_id: str):
    """Obtener información sobre una sesión QoD específica"""
    try:
        return await nokia_nac.get_qod_session(session_id)
    except Exception as e:
        logger.error(f"Error al obtener la sesión QoD: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener la sesión QoD: {str(e)}")

@router.delete("/qod/sessions/{session_id}")
async def delete_qod_session(session_id: str):
    """Eliminar una sesión QoD"""
    try:
        return await nokia_nac.delete_qod_session(session_id)
    except Exception as e:
        logger.error(f"Error al eliminar la sesión QoD: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al eliminar la sesión QoD: {str(e)}")

@router.get("/qod/profiles")
async def get_qod_profiles():
    """Obtener los perfiles de QoD disponibles"""
    try:
        return await nokia_nac.get_qod_profiles()
    except Exception as e:
        logger.error(f"Error al obtener los perfiles QoD: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener los perfiles QoD: {str(e)}")

@router.get("/health")
async def health_check():
    """Verificar el estado de salud del servicio Nokia NAC"""
    is_healthy = await nokia_nac.check_nokia_nac_health()
    if not is_healthy:
        raise HTTPException(status_code=503, detail="El servicio Nokia NAC no está disponible")
    return {"status": "healthy", "service": "Nokia NAC Integration"} 