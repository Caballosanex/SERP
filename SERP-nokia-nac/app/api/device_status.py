"""
API router for device status operations.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import DeviceInfo, StatusSubscription
from app.services import device

router = APIRouter(prefix="/device/status", tags=["Device Status"])


@router.get("/{device_id}")
async def get_device_status(device_id: str):
    """Obtener el estado de un dispositivo (online/offline)"""
    try:
        return await device.get_device_status(device_id)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener el estado del dispositivo: {str(e)}")


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
