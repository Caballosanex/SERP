from typing import List, Optional, Dict
from pydantic import BaseModel, Field # type: ignore No warning about pydantic. Imported in requirements.txt
from datetime import datetime
import uuid
from fastapi import APIRouter, HTTPException, Depends # type: ignore No warning about pydantic. Imported in requirements.txt
# from src.routes.resources import devices
from src.routes.qosod import QoSConfig, activate_device_qos, deactivate_device_qos

# Importar servicio de asignaciones de emergencia
# Esto es una suposición basada en el uso - necesitarás crear este módulo si no existe
from src.services.emergency_assignments import emergency_assignments
from src.configs.database import get_db
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


from enum import Enum

from src.models.emergency import Emergency, EmergencyType, StatusType, PriorityType
from src.models.resource import Resource
from src.models.location import Location
from src.models.address import Address

import json

import uuid as uuid_pkg
from fastapi.responses import ORJSONResponse

router = APIRouter()

# LIST ALL EMERGENCIES
@router.get("/api/alerts", response_model=List[Emergency], tags=["Alerts"])
async def list_alerts(session: Annotated[AsyncSession, Depends(get_db)]):
    """List all alerts"""
    # return [Alert(**alert.dict()) for alert in alerts.values()]
    emergencies = await session.execute(select(Emergency))
    # return emergencies
    items = emergencies.scalars().all()
    return items


# CREATE EMERGENCY
class EmergencyRequest(BaseModel):
    name: str = Field(..., max_length=64)
    description: str = Field(..., max_length=512)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    emergency_type: EmergencyType
    priority: PriorityType


@router.post("/api/alerts", response_model=Emergency, status_code=201, tags=["Alerts"])
async def create_alert(request: EmergencyRequest, db: AsyncSession = Depends(get_db)):
    """Create a new alert"""
    async with db.begin():  # Ensures rollback on failure
        location = Location(
            latitude=request.latitude,
            longitude=request.longitude
        )
        db.add(location)
        await db.flush()  # Get user.id before committing

        #For future implementations
        address = Address(
            latitude=request.latitude,
            longitude=request.longitude
        )
        db.add(address)
        await db.flush()  # Get product.id before committing

        emergency = Emergency(
            name=request.name,
            description=request.description,
            location_emergency=location.id,
            address_emergency=address.id,
            priority=request.priority
        )
        db.add(emergency)
        e_id =  emergency.id

    await db.commit()
    
    return {"message": "Alert Created", "alert_id": e_id}

# READ EMERGENCY
@router.get("/api/alerts/{alert_id}", response_model=Emergency, tags=["Alerts"])
# @router.get("/api/alerts/{alert_id}", tags=["Alerts"])
async def get_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    """Get alert details"""
    stmt = select(Emergency).where(Emergency.id == alert_id)
    result = await db.execute(stmt)
    emergency = result.scalar_one_or_none()
    if emergency is None:
        raise HTTPException(status_code=404, detail="Emergency not found")
    return emergency


# UPDATE EMERGENCY
class EmergencyUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str]  = None
    priority: Optional[PriorityType]  = None
    emergency_type: Optional[EmergencyType]  = None
    status: Optional[StatusType]  = None

    location_emergency: Optional[uuid_pkg.UUID]  = None
    address_emergency: Optional[uuid_pkg.UUID]  = None

    resource_id: Optional[uuid_pkg.UUID]  = None
    location_resource: Optional[uuid_pkg.UUID]  = None
    address_resource: Optional[uuid_pkg.UUID]  = None

    destination_id: Optional[uuid_pkg.UUID]  = None
    location_destination: Optional[uuid_pkg.UUID]  = None
    address_destination: Optional[uuid_pkg.UUID]  = None

    # Non-optional fields
    name_contact: Optional[str]  = None
    telephone_contact: Optional[str]  = None
    id_contact: Optional[str]  = None

from src.models.emergencyresourceslink import EmergencyResourceLink

@router.patch("/api/alerts/{alert_id}", response_class=ORJSONResponse, tags=["Alerts"])
async def update_alert(alert_id: str, request: EmergencyUpdateRequest, db: AsyncSession = Depends(get_db)):
    """Update an alert"""
    stmt = select(Emergency).where(Emergency.id == alert_id)
    result = await db.execute(stmt)
    emergency = result.scalars().first() 
    if not emergency:
        raise HTTPException(status_code=404, detail="Example not found")

    #Update Emergency
    for field, value in request.dict(exclude_unset=True).items():
        setattr(emergency, field, value)
    db.commit()

    await db.refresh(emergency)
    # await db.refresh(emergency.scalars().first())

    # Si estamos resolviendo la alerta
    if emergency.status == StatusType.Solved:
        print("DEBUG - EmergecnydID ", emergency)
        # print(dir(emergency.fetchone()))
        #Get associated Resources
        statement = (
            select(Resource)
            .join(EmergencyResourceLink, Resource.id == EmergencyResourceLink.resource_id)
            .where(EmergencyResourceLink.emergency_id == emergency.id)
        )
        results = await db.execute(statement)
        emergencies = results.scalars().all() 
        #Deactivate QoS
        for device in emergencies:
            print("To Do - Deactivate QOSOD for Device", device.id)

        # return {"message": "Emergency updated to solved and devices cleaned", "emergecy_id": emergency.id}
        response =  [{"emergecy_id": str(emergency.id), "message": "Updated"}]
        print("DEBUG - Respone", response)
        return response

    
    # return {"message": "Emergency updated", "emergecy_id": emergency.id}
    return [{"emergecy_id": str(emergency.id), "message": "Updated"}]

# DELETE A EMERGENCY
@router.delete("/api/alerts/{emergency_id}", status_code=200, tags=["Alerts"])
async def delete_device(db: Annotated[AsyncSession, Depends(get_db)], emergency_id: str):
    """Delete an emergency"""

    try:
        emergency_uuid = uuid_pkg.UUID(emergency_id)  # Convert to UUID type
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")


    #Fetch Resource From DB From ID
    stmt = select(Emergency).where(Emergency.id == emergency_uuid)
    result = await db.execute(stmt)
    emergency = result.scalars().first() 
    if not emergency:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    #Delete Emergency
    await db.delete(emergency)
    await db.commit()
    
    return {"message": "Emergency Deleted"}







#CHECK AFTER CRUD

# @router.get("/api/devices/{device_id}/assignments", response_model=List[Alert], tags=["Devices"])
# async def get_device_assignments(device_id: str):
#     """Get alerts assigned to a specific device"""
#     if device_id not in devices:
#         raise HTTPException(status_code=404, detail="Device not found")
    
#     device = devices[device_id]
#     device_type = device.type
#     alert_type = get_alert_type_for_device(device_type)
    
#     assigned_alerts = []
#     for alert_id, alert in alerts.items():
#         if alert.status == "active" and alert.type == alert_type:
#             if device_id in emergency_assignments.get_alert_devices(alert_id):
#                 assigned_alerts.append(alert)
    
#     return assigned_alerts


# I DO NOT KNOW WHAT IS IT FOR - ^^' - To Do - Check IF it works
@router.get("/api/devices/{resource_id}/assignments", response_model=List[Emergency], tags=["Alerts"])
# async def get_device_assignments(device_id: str):
async def get_device_assignments(resource_id: str, db: AsyncSession = Depends(get_db)):
    """Get alerts assigned to a specific device"""
    stmt = select(Resource).where(Resource.id == resource_id)
    result = await db.execute(stmt)
    if not result:
        raise HTTPException(status_code=404, detail="Example not found")
    return result.scalars().first()