"""
Pydantic models/schemas for the Nokia NAC API.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# Device Status Models


class DeviceInfo(BaseModel):
    """Information about a device."""
    device_id: str  # Formato: device@testcsp.net o número de teléfono


class StatusSubscription(BaseModel):
    """Subscription to device status changes."""
    device_id: str
    notification_url: str
    notification_token: Optional[str] = None


# Location Models
class LocationRequest(BaseModel):
    """Request for device location."""
    device_id: str
    radius: Optional[int] = None


class LocationResponse(BaseModel):
    """Response with device location."""
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    timestamp: Optional[datetime] = None


# QoD Models
class QoDSessionCreate(BaseModel):
    """Create a QoD session for a device."""
    device_id: str
    profile: str  # Perfil QoS
    duration: Optional[int] = 3600  # Duración en segundos (por defecto 1 hora)


class QoDSessionResponse(BaseModel):
    """Response with QoD session details."""
    session_id: str
    device_id: str
    profile: str
    duration: int
    status: str
    created_at: datetime
    expires_at: Optional[datetime] = None


# Emergency Models
class EmergencyQoDActivation(BaseModel):
    """Activate QoD for devices in an emergency."""
    devices: List[str]
    profile: str = "QOS_E"
    duration: int = 3600


class EmergencyQoDDeactivation(BaseModel):
    """Deactivate QoD for devices in an emergency."""
    devices: List[str]


class EmergencyQoDStatusResponse(BaseModel):
    """Response with QoD status for devices in an emergency."""
    emergency_id: str
    results: List[Dict[str, Any]]


# Health Check Models
class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
