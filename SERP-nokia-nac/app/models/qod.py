from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from ..core.config import settings

class QoDSessionCreate(BaseModel):
    device_id: str = Field(..., description="Device phone number or identifier")
    profile: str = Field(default=settings.DEFAULT_QOD_PROFILE, description="QoS profile")
    duration: int = Field(default=settings.DEFAULT_QOD_DURATION, description="Session duration in seconds")
    service_ipv4: str = Field(default=settings.DEFAULT_IPV4, description="Service IPv4 address")

class QoDSession(QoDSessionCreate):
    session_id: str
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None

class QoDSessionList(BaseModel):
    sessions: List[QoDSession]
    total: int

class EmergencyQoDRequest(BaseModel):
    devices: List[str] = Field(..., description="List of device phone numbers")
    profile: str = Field(default=settings.DEFAULT_QOD_PROFILE, description="QoS profile")
    duration: int = Field(default=settings.DEFAULT_QOD_DURATION, description="Session duration in seconds") 