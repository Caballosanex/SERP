from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class DeviceBase(BaseModel):
    phone_number: str = Field(..., description="Phone number with international format (+XX...)")
    ipv4_address: Optional[str] = Field(None, description="Public IPv4 address")

class DeviceStatus(DeviceBase):
    status: str = Field(..., description="Device status (online/offline)")
    last_update: datetime = Field(default_factory=datetime.now)
    location: Optional[Dict[str, Any]] = None

class DeviceLocation(BaseModel):
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    accuracy: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class DeviceCreate(DeviceBase):
    name: str = Field(..., description="Device name or identifier")
    type: str = Field(..., description="Device type (e.g., ambulance, police car)")
    description: Optional[str] = None 