"""
Service for location operations with Nokia NAC.
"""
import logging
from typing import Dict, Any, Optional
from app.services.device import get_device
from app.core.config import settings

logger = logging.getLogger(__name__)


async def get_device_location(device_id: str, max_age: Optional[int] = 3600) -> Dict[str, Any]:
    """
    Get the location of a device.
    
    Args:
        device_id: The phone number of the device.
        max_age: Maximum age of the location information in seconds.
        
    Returns:
        A dictionary with location information.
    """
    try:
        device = await get_device(device_id)

        # Get location information
        location = device.location(max_age=max_age)

        # Convert to dictionary for API response
        location_dict = {
            "device_id": device_id,
            "latitude": location.latitude if hasattr(location, "latitude") else None,
            "longitude": location.longitude if hasattr(location, "longitude") else None,
            "elevation": location.elevation if hasattr(location, "elevation") else None,
            "accuracy": getattr(location, "accuracy", None),
            "timestamp": getattr(location, "timestamp", None)
        }
        return location_dict
    except Exception as e:
        logger.error(
            f"Error getting location for device {device_id}: {str(e)}")
        raise


async def verify_device_location(device_id: str, radius: Optional[int] = None) -> Dict[str, Any]:
    """
    Verify a device's location within a given radius.
    
    Args:
        device_id: The phone number of the device.
        radius: The radius in meters to check.
        
    Returns:
        A dictionary with verification result.
    """
    try:
        location = await get_device_location(device_id)

        # For now, just return the location. In a real implementation,
        # this would compare the location to a reference point with the radius.
        return {
            "device_id": device_id,
            "location": location,
            "radius": radius,
            "verified": True  # Placeholder
        }
    except Exception as e:
        logger.error(
            f"Error verifying location for device {device_id}: {str(e)}")
        raise
