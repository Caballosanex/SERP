from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from pydantic import validator


class DeviceBase(SQLModel):
    """Modelo base para dispositivos"""
    phone_number: str = Field(index=True)
    name: str
    description: Optional[str] = None
    is_active: bool = True


class Device(DeviceBase, table=True):
    """Modelo de dispositivo para la base de datos"""
    __tablename__ = "devices"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Campos específicos para Nokia NAC
    last_known_status: Optional[str] = None
    last_location_lat: Optional[float] = None
    last_location_lon: Optional[float] = None
    last_location_timestamp: Optional[datetime] = None
    active_qod_session_id: Optional[str] = None
    active_qod_profile: Optional[str] = None
    active_qod_start_time: Optional[datetime] = None
    active_qod_end_time: Optional[datetime] = None
    
    @validator("phone_number")
    def validate_phone_number(cls, v):
        """Validar que el número de teléfono tenga el formato correcto para Nokia NAC"""
        if not v.startswith("+"):
            raise ValueError("El número de teléfono debe incluir el código de país con formato +XXXXXXXXXXXX")
        return v


class DeviceCreate(DeviceBase):
    """Modelo para crear un nuevo dispositivo"""
    pass


class DeviceRead(DeviceBase):
    """Modelo para leer información de un dispositivo"""
    id: int
    created_at: datetime
    updated_at: datetime
    last_known_status: Optional[str] = None
    last_location_lat: Optional[float] = None
    last_location_lon: Optional[float] = None
    last_location_timestamp: Optional[datetime] = None
    active_qod_session_id: Optional[str] = None
    active_qod_profile: Optional[str] = None
    active_qod_start_time: Optional[datetime] = None
    active_qod_end_time: Optional[datetime] = None


class DeviceUpdate(SQLModel):
    """Modelo para actualizar un dispositivo existente"""
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    phone_number: Optional[str] = None 