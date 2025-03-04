from datetime import datetime
from typing import List, Optional, Dict
from fastapi import APIRouter,  HTTPException, Depends # type: ignore No warning about pydantic. Imported in requirements.txt

from src.models.resource import Resource, ResourceStatusEnum
from src.models.location import Location
from src.models.address import Address
from src.models.emergency import Emergency
from src.models.emergencyresourceslink import EmergencyResourceLink

from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from src.configs.database import get_db
from sqlalchemy import select
from pydantic import BaseModel, Field
import uuid as uuid_pkg

router = APIRouter()

# LIST ALL RESOURCES
@router.get("/api/devices", response_model=List[Resource], tags=["Devices"])
async def list_devices(session: Annotated[AsyncSession, Depends(get_db)]):
    """List all devices"""
    resources = await session.execute(select(Resource))
    # return emergencies
    items = resources.scalars().all()
    return items




# CREATE A RESOURCE
class ResourceCreateRequest(BaseModel):

    resource_type: Optional[str] = Field(None, max_length=128)
            
    actual_address_longitude: Optional[float] = Field(None, ge=-180, le=180)
    actual_address_latitude: Optional[float] = Field(None, ge=-90, le=90)
    actual_longitude: Optional[float] = Field(None, ge=-180, le=180)
    actual_latitude: Optional[float] = Field(None, ge=-90, le=90)

    normal_address_longitude: Optional[float] = Field(None, ge=-180, le=180)
    normal_address_latitude: Optional[float] = Field(None, ge=-90, le=90)
    normal_longitude: Optional[float] = Field(None, ge=-180, le=180)
    normal_latitude: Optional[float] = Field(None, ge=-90, le=90)

    status: Optional[ResourceStatusEnum] = ResourceStatusEnum.UNKNOWN
    responsible: Optional[str] = Field(None, max_length=128)
    telephone: Optional[str] = Field(None, max_length=128)
    email: Optional[str] = Field(None, max_length=128)


# @router.post("/api/devices", response_model=Resource, status_code=201, tags=["Devices"])
@router.post("/api/devices", status_code=201, tags=["Devices"])
async def create_device(db: Annotated[AsyncSession, Depends(get_db)], request: ResourceCreateRequest):
    """Create a new device"""
    async with db.begin():  # Ensures rollback on failure
        actual_location = Location(
            latitude=request.actual_latitude,
            longitude=request.actual_longitude
        )
        db.add(actual_location)
        # await db.flush()  # Get user.id before committing

        #For future implementations
        actual_address = Address(
            latitude=request.actual_address_latitude,
            longitude=request.actual_address_longitude
        )
        db.add(actual_address)
        # await db.flush()  # Get product.id before committing

        normal_location = Location(
            latitude=request.normal_latitude,
            longitude=request.normal_longitude
        )
        db.add(normal_location)
        # await db.flush()  # Get user.id before committing

        #For future implementations
        normal_address = Address(
            latitude=request.normal_address_latitude,
            longitude=request.normal_address_longitude
        )
        db.add(normal_address)
        # await db.flush()  # Get product.id before committing

        resource = Resource(
            resource_type=request.resource_type,
            
            actual_address=actual_address.id,
            actual_location=actual_location.id,
            normal_address=normal_address.id,
            normal_location=normal_location.id,

            status=request.status,
            responsible=request.responsible,
            telephone=request.telephone,
            email=request.email  
        )
        db.add(resource)
        # await db.flush()  # Get product.id before committing
        resource_id =  resource.id

    await db.commit()
    
    return {"message": "Resource Created", "resouce_id:": resource_id}
    # return resource




# READ A RESOURCE
@router.get("/api/devices/{resource_id}", response_model=Resource, tags=["Devices"])
async def get_device(db: Annotated[AsyncSession, Depends(get_db)], resource_id: str):
    """Get device details"""

    try:
        resource_uuid = uuid_pkg.UUID(resource_id)  # Convert to UUID type
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")


    stmt = select(Resource).where(Resource.id == resource_uuid)
    result = await db.execute(stmt)
    resource = result.scalar_one_or_none()
    if resource is None:
        raise HTTPException(status_code=404, detail="Example not found")
    return resource


# UPDATE A RESOURCE
class ResourceUpdateRequest(BaseModel):

    resource_type: Optional[str] = Field(None, max_length=128)
            
    actual_address_longitude: Optional[float] = Field(None, ge=-180, le=180)
    actual_address_latitude: Optional[float] = Field(None, ge=-90, le=90)
    actual_longitude: Optional[float] = Field(None, ge=-180, le=180)
    actual_latitude: Optional[float] = Field(None, ge=-90, le=90)

    normal_address_longitude: Optional[float] = Field(None, ge=-180, le=180)
    normal_address_latitude: Optional[float] = Field(None, ge=-90, le=90)
    normal_longitude: Optional[float] = Field(None, ge=-180, le=180)
    normal_latitude: Optional[float] = Field(None, ge=-90, le=90)

    status: Optional[ResourceStatusEnum] = ResourceStatusEnum.UNKNOWN
    responsible: Optional[str] = Field(None, max_length=128)
    telephone: Optional[str] = Field(None, max_length=128)
    email: Optional[str] = Field(None, max_length=128)


# @router.patch("/api/devices/{resource_id}", response_model=Resource, tags=["Devices"])
@router.patch("/api/devices/{resource_id}", tags=["Devices"])
async def update_device(db: Annotated[AsyncSession, Depends(get_db)], resource_id: str, request: ResourceUpdateRequest):
    """Update device details"""
    
    #Find Resource
    stmt = select(Resource).where(Resource.id == resource_id)
    result = await db.execute(stmt)
    resource = result.scalars().first() 
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    #Update Model Data
    model_data = {key: value for key, value in request.dict().items() if key in ["resource_type", "status", "responsible", "telephone", "email"]}
    # for field, value in model_data.dict(exclude_unset=True).items():
    for field, value in model_data.items():
        setattr(resource, field, value)
    db.commit()

    #Update Actual Location
    #Find Location
    stmt = select(Location).where(Location.id == resource.actual_location)
    result = await db.execute(stmt)
    actual_location = result.scalars().first() 
    if not actual_location:
        raise HTTPException(status_code=404, detail="Actual Location not found")
    actual_location.longitude = request.actual_longitude
    actual_location.latitude = request.actual_latitude
    db.commit()
    #Update Actual Address
    stmt = select(Address).where(Address.id == resource.actual_address)
    result = await db.execute(stmt)
    actual_address = result.scalars().first() 
    if not actual_address:
        raise HTTPException(status_code=404, detail="Actual Location not found")
    actual_address.longitude = request.actual_address_longitude
    actual_address.latitude = request.actual_address_latitude
    db.commit()

    
    #Update Normal Location
    #Find Location
    stmt = select(Location).where(Location.id == resource.normal_location)
    result = await db.execute(stmt)
    normal_location = result.scalars().first() 
    if not normal_location:
        raise HTTPException(status_code=404, detail="normal Location not found")
    normal_location.longitude = request.normal_longitude
    normal_location.latitude = request.normal_latitude
    db.commit()
    #Update normal Address
    stmt = select(Address).where(Address.id == resource.normal_address)
    result = await db.execute(stmt)
    normal_address = result.scalars().first() 
    if not normal_address:
        raise HTTPException(status_code=404, detail="normal Location not found")
    normal_address.longitude = request.normal_address_longitude
    normal_address.latitude = request.normal_address_latitude
    db.commit()
    
    return {"message": "Resource Updated", "resouce_id:": resource_id}


# DELETE A RESOURCE
@router.delete("/api/devices/{resource_id}", status_code=200, tags=["Devices"])
async def delete_device(db: Annotated[AsyncSession, Depends(get_db)], resource_id: str):
    """Delete a resource"""
    
    try:
        resource_uuid = uuid_pkg.UUID(resource_id)  # Convert to UUID type
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")


    #Fetch Resource From DB From ID
    stmt = select(Resource).where(Resource.id == resource_uuid)
    result = await db.execute(stmt)
    resource = result.scalars().first() 
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    #Delete all instances of value in many to many table:
    # Remove relationships in the association table (example_other_model_association)
    stmt = select(EmergencyResourceLink).where(EmergencyResourceLink.resource_id == resource.id)
    result = await db.execute(stmt)
    resourcesToEmergencies = result.scalars().all() 
    for el in resourcesToEmergencies:
        await db.delete(el)
        await db.commit()
    # await db.commit()


    #Unset ALL Emergencies with This Resource
    result = await db.execute(select(Emergency).filter(Emergency.resource_id == resource.id))
    models = result.scalars().all()
    
    # Unset (set to None) the ex2_id field for those models
    for model in models:
        model.resource_id = None  # Set ex2_id to None
        await db.commit()

    #Unset ALL Emergencies with This Resource
    resultDest = await db.execute(select(Emergency).filter(Emergency.destination_id == resource.id))
    modelsDest = resultDest.scalars().all()
    
    # Unset (set to None) the ex2_id field for those models
    for model in modelsDest:
        model.destination_id = None  # Set ex2_id to None
        await db.commit()

    #If QOSOD is Active Deactivate it ToDo - IMPORTANT

    #Delete Resource
    await db.delete(resource)
    await db.commit()
    
    return {"message": "Resource Deleted"}

    