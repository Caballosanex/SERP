from typing import List, Optional, Dict
from pydantic import BaseModel # type: ignore No warning about pydantic. Imported in requirements.txt
from datetime import datetime
import uuid
from fastapi import APIRouter, HTTPException, Depends # type: ignore No warning about pydantic. Imported in requirements.txt
from src.routes.resources import devices
from src.routes.qosod import QoSConfig, activate_device_qos, deactivate_device_qos

# Importar servicio de asignaciones de emergencia
# Esto es una suposición basada en el uso - necesitarás crear este módulo si no existe
from src.services.emergency_assignments import emergency_assignments
from src.configs.database import get_db
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
router = APIRouter()

from src.models.emergency import Emergency
import json

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


class DeviceCreate(BaseModel):
    type: str
    location: Optional[Location] = None


class DeviceUpdate(BaseModel):
    type: Optional[str]
    qos_status: Optional[str]
    location: Optional[Location]



class Alert(BaseModel):
    id: str = None
    type: str  # "medical", "fire", "police"
    location: str
    description: str
    priority: int  # 1-5
    timestamp: datetime = None
    status: str = "active"  # "active", "resolved", "closed"
    resolution_notes: Optional[str] = None

class AlertCreate(BaseModel):
    type: str
    location: str
    description: str
    priority: int


class AlertUpdate(BaseModel):
    status: Optional[str] = None
    resolution_notes: Optional[str] = None
    priority: Optional[int] = None
    description: Optional[str] = None


# Storage (in memory for demo)
alerts = {}
devices = {}

devices["ambulance-001"] = Device(id="ambulance-001", type="ambulance", location={"latitude": 41.3851, "longitude": 2.1734})
devices["fire-001"] = Device(id="fire-001", type="fire_truck", location={"latitude": 41.3851, "longitude": 2.1734})
devices["police-001"] = Device(id="police-001", type="police_car", location={"latitude": 41.3851, "longitude": 2.1734})

# Alert endpoints
# @router.get("/api/alerts", response_model=List[Emergency], tags=["Alerts"])
@router.get("/api/alerts", tags=["Alerts"])
async def list_alerts(session: Annotated[AsyncSession, Depends(get_db)]):
    """List all alerts"""
    # return [Alert(**alert.dict()) for alert in alerts.values()]

    # stmt = select(Emergency).all()
    # emergencies = await session.execute(stmt)
    emergencies = await session.execute(select(Emergency))
    # return emergencies
    items = emergencies.scalars().all()
    return items

@router.post("/api/alerts", response_model=Alert, status_code=201, tags=["Alerts"])
async def create_alert(alert: AlertCreate):
    """Create a new alert"""
    if not 1 <= alert.priority <= 5:
        raise HTTPException(
            status_code=400,
            detail="Priority must be between 1 and 5"
        )

    new_alert = Alert(
        id=str(uuid.uuid4()),
        type=alert.type,
        location=alert.location,
        description=alert.description,
        priority=alert.priority,
        timestamp=datetime.now()
    )
    alerts[new_alert.id] = new_alert

    # Asignar dispositivos automáticamente según el tipo de alerta
    await assign_devices_to_alert(new_alert)
    return new_alert


async def assign_devices_to_alert(alert: Alert):
    """Asigna dispositivos a una alerta basándose en el tipo"""
    device_type = get_device_type_for_alert(alert.type)
    for device_id, device in devices.items():
        if device.type == device_type:
            emergency_assignments.assign_device(alert.id, device_id)
            # Activar QoS para el dispositivo asignado
            await activate_device_qos(device_id, QoSConfig(priority_level=alert.priority))


def get_device_type_for_alert(alert_type: str) -> str:
    """Maps alert types to device types"""
    type_mapping = {
        "medical": "ambulance",
        "fire": "fire_truck",
        "police": "police_car"
    }
    return type_mapping.get(alert_type.lower(), "unknown")


@router.get("/api/devices/{device_id}/assignments", response_model=List[Alert], tags=["Devices"])
async def get_device_assignments(device_id: str):
    """Get alerts assigned to a specific device"""
    if device_id not in devices:
        raise HTTPException(status_code=404, detail="Device not found")
    
    device = devices[device_id]
    device_type = device.type
    alert_type = get_alert_type_for_device(device_type)
    
    assigned_alerts = []
    for alert_id, alert in alerts.items():
        if alert.status == "active" and alert.type == alert_type:
            if device_id in emergency_assignments.get_alert_devices(alert_id):
                assigned_alerts.append(alert)
    
    return assigned_alerts


def get_alert_type_for_device(device_type: str) -> str:
    """Maps device types to alert types"""
    type_mapping = {
        "ambulance": "medical",
        "fire_truck": "fire",
        "police_car": "police"
    }
    return type_mapping.get(device_type.lower(), "unknown")


@router.get("/api/alerts/{alert_id}", response_model=Alert, tags=["Alerts"])
async def get_alert(alert_id: str):
    """Get alert details"""
    if alert_id not in alerts:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alerts[alert_id]


@router.patch("/api/alerts/{alert_id}", response_model=Alert)
async def update_alert(alert_id: str, alert_update: AlertUpdate):
    """Update an alert"""
    if alert_id not in alerts:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert = alerts[alert_id]
    update_data = alert_update.dict(exclude_unset=True)

    # Si estamos resolviendo la alerta
    if update_data.get("status") == "resolved":
        alert_type = alert.type
        device_type = get_required_device_type(alert_type)

        # Buscar el dispositivo asignado a esta alerta
        for device_id, device in devices.items():
            if device.type == device_type and device.qos_status == "active":
                # Verificar si hay otras alertas activas que requieren este dispositivo
                has_other_active_alerts = any(
                    a.status == "active"
                    and a.id != alert_id
                    and get_required_device_type(a.type) == device_type
                    for a in alerts.values()
                )

                # Solo desactivar QoS si no hay otras alertas activas
                if not has_other_active_alerts:
                    await deactivate_device_qos(device_id)

    alert = alerts[alert_id] = alert.copy(update=update_data)
    return alert


def get_required_device_type(alert_type: str) -> str:
    """Maps alert types to required device types"""
    type_mapping = {
        "medical": "ambulance",
        "fire": "fire_truck",
        "police": "police_car"
    }
    return type_mapping.get(alert_type.lower(), "unknown")
#END ALERT ENDPOINTS