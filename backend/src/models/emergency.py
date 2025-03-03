from sqlalchemy import Column, String, Enum, Integer, Float, ForeignKey, DateTime, func
# from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4, UUID
import enum
from src.configs.database import Base
import uuid as uuid_pkg
from src.models.location import Location
from src.models.address import Address
from src.models.resource import Resource
from pydantic import BaseModel
from typing import Optional
from sqlmodel import Field, Session, SQLModel, create_engine, select
from sqlalchemy.orm import relationship
from datetime import datetime

class EmergencyStatusEnum(str, enum.Enum):
    UNKNOWN = "Unknown"
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    SOLVED = "Solved"

# class Emergency(SQLModel, table=True):
#     __tablename__ = "emergencies"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     name = Column(String(64), nullable="False")

#     emergency_type = Column(String(128), nullable=False)
#     priority = Column(Integer, nullable=True)
#     emergency_status = Column(Enum(EmergencyStatusEnum), default=EmergencyStatusEnum.UNKNOWN)

#     location_emergency = Column(UUID(as_uuid=True), ForeignKey(Location.id))
#     address_emergency = Column(UUID(as_uuid=True), ForeignKey(Address.id))

#     resource_id = Column(UUID(as_uuid=True), ForeignKey(Resource.id))
#     location_resource = Column(UUID(as_uuid=True), ForeignKey(Location.id))
#     address_resource = Column(UUID(as_uuid=True), ForeignKey(Address.id))

#     destination_id = Column(UUID(as_uuid=True), ForeignKey(Resource.id))
#     location_destination = Column(UUID(as_uuid=True), ForeignKey(Location.id))
#     address_destination = Column(UUID(as_uuid=True), ForeignKey(Address.id))

#     name_contact = Column(String(128), nullable=False)
#     telephone_contact = Column(String(128), nullable=False)
#     id_contact = Column(String(128), nullable=False)

#     time_created = Column(DateTime(timezone=True), server_default=func.now())
#     time_updated = Column(DateTime(timezone=True), onupdate=func.now())


class Emergency(SQLModel, table=True):
    __tablename__ = "emergencies"

    id: uuid_pkg.UUID = Field(
        default_factory=uuid_pkg.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    name: str = Field(sa_column=Column(String(64), nullable=False))
    emergency_type: str = Field(sa_column=Column(String(128), nullable=False))
    priority: Optional[int] = Field(sa_column=Column(Integer, nullable=True))
    emergency_status: EmergencyStatusEnum = Field(sa_column=Column(Enum(EmergencyStatusEnum), default=EmergencyStatusEnum.UNKNOWN))

    location_emergency: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="locations.id")
    address_emergency: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="addresses.id")

    resource_id: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="resources.id")
    location_resource: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="locations.id")
    address_resource: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="addresses.id")

    destination_id: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="resources.id")
    location_destination: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="locations.id")
    address_destination: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="addresses.id")

    name_contact: str = Field(sa_column=Column(String(128), nullable=False))
    telephone_contact: str = Field(sa_column=Column(String(128), nullable=False))
    id_contact: str = Field(sa_column=Column(String(128), nullable=False))

    time_created: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), server_default=func.now()))
    time_updated: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True), onupdate=func.now()))

