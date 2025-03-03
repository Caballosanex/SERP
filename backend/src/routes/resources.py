from pydantic import BaseModel # type: ignore No warning about pydantic. Imported in requirements.txt
from datetime import datetime
from typing import List, Optional, Dict
from fastapi import APIRouter, HTTPException # type: ignore No warning about pydantic. Imported in requirements.txt

router = APIRouter()


class Location(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None
    timestamp: Optional[datetime] = None
    


class Device(BaseModel):
    id: str
    type: str  # "ambulance", "fire_truck", "police_car"
    qos_status: Optional[str] = "inactive"  # "active", "inactive"
    qos_request_id: Optional[str] = None
    location: Optional[Location] = None


class Alert(BaseModel):
    id: str = None
    type: str  # "medical", "fire", "police"
    location: str
    description: str
    priority: int  # 1-5
    timestamp: datetime = None
    status: str = "active"  # "active", "resolved", "closed"
    resolution_notes: Optional[str] = None


class DeviceCreate(BaseModel):
    type: str
    location: Optional[Location] = None


class DeviceUpdate(BaseModel):
    type: Optional[str]
    qos_status: Optional[str]
    location: Optional[Location]


# Storage (in memory for demo)
alerts = {}
devices = {}

devices["ambulance-001"] = Device(id="ambulance-001", type="ambulance", location={"latitude": 41.3851, "longitude": 2.1734})
devices["fire-001"] = Device(id="fire-001", type="fire_truck", location={"latitude": 41.3851, "longitude": 2.1734})
devices["police-001"] = Device(id="police-001", type="police_car", location={"latitude": 41.3851, "longitude": 2.1734})



# Device endpoints
@router.get("/api/devices", response_model=List[Device], tags=["Devices"])
async def list_devices():
    """List all devices"""
    return [Device(**device.dict()) for device in devices.values()]


@router.post("/api/devices", response_model=Device, status_code=201, tags=["Devices"])
async def create_device(device_id: str, device: DeviceCreate):
    """Create a new device"""
    if device_id in devices:
        raise HTTPException(status_code=409, detail="Device already exists")

    new_device = Device(
        id=device_id,
        type=device.type,
        location=device.location
    )
    devices[device_id] = new_device
    return new_device


@router.get("/api/devices/{device_id}", response_model=Device, tags=["Devices"])
async def get_device(device_id: str):
    """Get device details"""
    if device_id not in devices:
        raise HTTPException(status_code=404, detail="Device not found")
    return devices[device_id]


@router.patch("/api/devices/{device_id}", response_model=Device, tags=["Devices"])
async def update_device(device_id: str, update: DeviceUpdate):
    """Update device details"""
    if device_id not in devices:
        raise HTTPException(status_code=404, detail="Device not found")

    device = devices[device_id]
    update_data = update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(device, field, value)

    return device


@router.delete("/api/devices/{device_id}", status_code=200)
async def delete_device(device_id: str):
    """Delete a device"""
    if device_id not in devices:
        raise HTTPException(status_code=404, detail="Device not found")

    # Desactivar QoS si está activo
    if devices[device_id].qos_status == "active":
        try:
            # Importación local para evitar dependencia circular
            from src.routes.qosod import deactivate_device_qos
            await deactivate_device_qos(device_id)
        except Exception as e:
            print(f"Error al desactivar QoS: {str(e)}")

    # Eliminar el dispositivo
    del devices[device_id]
    return {"message": "Device deleted successfully"}
#END DEVICE ENDPOINTS


    