"""
API router for device status operations.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import DeviceInfo, StatusSubscription
from app.services import device
from typing import Optional
from ..models.device import DeviceStatus, DeviceBase
from ..core.nokia_client import nokia_client
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/device", tags=["Device Status"])


@router.get("/status/{device_id}", response_model=DeviceStatus)
async def get_device_status(device_id: str):
    """Get device status (online/offline)"""
    try:
        device = nokia_client.get_device(phone_number=device_id)
        return DeviceStatus(
            phone_number=device_id,
            status="online",  # Assuming device is online if no error
            ipv4_address=getattr(device, "ipv4_address", {}).get("public_address")
        )
    except Exception as e:
        logger.error(f"Error getting device status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/info/{device_id}", response_model=DeviceBase)
async def get_device_info(device_id: str):
    """Get detailed device information"""
    try:
        device = nokia_client.get_device(phone_number=device_id)
        return DeviceBase(
            phone_number=device_id,
            ipv4_address=getattr(device, "ipv4_address", {}).get("public_address")
        )
    except Exception as e:
        logger.error(f"Error getting device info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/subscribe")
async def subscribe_to_device_status(subscription: StatusSubscription):
    """Suscribirse a cambios de estado de un dispositivo"""
    try:
        return await device.subscribe_to_status(
            device_id=subscription.device_id,
            notification_url=subscription.notification_url,
            notification_token=subscription.notification_token
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al suscribirse a cambios de estado: {str(e)}")


@router.delete("/subscription/{subscription_id}")
async def unsubscribe_from_device_status(subscription_id: str):
    """Cancelar una suscripción a cambios de estado"""
    try:
        return await device.unsubscribe_from_status(subscription_id)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al cancelar la suscripción: {str(e)}")
