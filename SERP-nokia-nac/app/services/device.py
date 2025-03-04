"""
Service for device status operations with Nokia NAC.
"""
import logging
from typing import Dict, Any, Optional
import httpx
from network_as_code.models.device import DeviceIpv4Addr
from app.core.client import nokia_nac_client
from app.core.config import settings

logger = logging.getLogger(__name__)


async def get_device(device_id: str) -> Any:
    """
    Get a device by ID (phone number).
    
    Args:
        device_id: The phone number of the device.
        
    Returns:
        The device object.
    """
    try:
        # Aseguramos que el número de teléfono tenga el formato correcto
        if not device_id.startswith("+"):
            device_id = "+" + device_id.strip()

        # Obtenemos el dispositivo usando el cliente Nokia NAC
        device = nokia_nac_client.devices.get(
            phone_number=device_id,
            ipv4_address=DeviceIpv4Addr(
                public_address=settings.DEFAULT_IPV4
            )
        )
        return device
    except Exception as e:
        logger.error(f"Error getting device {device_id}: {str(e)}")
        raise


async def get_device_status(device_id: str) -> Dict[str, Any]:
    """
    Get the status of a device.
    
    Args:
        device_id: The phone number of the device.
        
    Returns:
        A dictionary with device status information.
    """
    try:
        device = await get_device(device_id)

        # Convert to dictionary for API response
        device_dict = {
            "device_id": device_id,
            "network_access_identifier": getattr(device, "network_access_identifier", None),
            "phone_number": getattr(device, "phone_number", None),
            "ipv4_address": getattr(device, "ipv4_address", None),
            "ipv6_address": getattr(device, "ipv6_address", None),
            "status": "online"  # Assume online if no error
        }
        return device_dict
    except Exception as e:
        logger.error(f"Error getting device status for {device_id}: {str(e)}")
        raise


async def subscribe_to_status(device_id: str, notification_url: str, notification_token: Optional[str] = None) -> Dict[str, Any]:
    """
    Subscribe to device status changes.
    
    Args:
        device_id: The phone number of the device.
        notification_url: The URL to send notifications to.
        notification_token: Optional authentication token for notifications.
        
    Returns:
        Subscription information.
    """
    # This is a placeholder as actual implementation would depend on Nokia NAC SDK capabilities
    return {"subscription_id": "not_implemented_yet"}


async def unsubscribe_from_status(subscription_id: str) -> Dict[str, Any]:
    """
    Cancel a subscription to device status changes.
    
    Args:
        subscription_id: The ID of the subscription to cancel.
        
    Returns:
        Success message.
    """
    # This is a placeholder as actual implementation would depend on Nokia NAC SDK capabilities
    return {"message": "Suscripción cancelada correctamente"}
