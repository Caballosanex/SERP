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
from sqlmodel import Field, Session, SQLModel, create_engine, select, Relationship
from sqlalchemy.orm import relationship
from datetime import datetime

from src.models.emergencyresourceslink import EmergencyResourceLink

class EmergencyType(str, enum.Enum):
    Incendi = "Incendi"
    Emergencia_Medica = "Emergencia Medica"
    Accident = "Accident"
    Desastre_Natural = "Desastre Natural"
    Altres = "Altres"

class PriorityType(str, enum.Enum):
    Alta = "Alta"
    Mitjana = "Mitjana"
    Baixa = "Baixa"

class StatusType(str, enum.Enum):
    Active = "Actiu"
    Solved = "Resolt"
    Archived = "Arxivad"

class Emergency(SQLModel, table=True):
    # __tablename__ = "emergencies"

    id: uuid_pkg.UUID = Field(
        default_factory=uuid_pkg.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    name: str = Field(sa_column=Column(String(64), nullable=False))
    description: str = Field(sa_column=Column(String(512), nullable=False))
    priority: PriorityType = Field(sa_column=Column(Enum(PriorityType), default=PriorityType.Mitjana))
    emergency_type: EmergencyType = Field(sa_column=Column(Enum(EmergencyType), default=EmergencyType.Altres))
    status: StatusType = Field(sa_column=Column(Enum(StatusType), default=StatusType.Active))

    location_emergency: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="location.id", ondelete="SET NULL")
    address_emergency: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="address.id", ondelete="SET NULL")

    resource_id: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="resource.id", ondelete="SET NULL")
    location_resource: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="location.id", ondelete="SET NULL")
    address_resource: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="address.id", ondelete="SET NULL")

    destination_id: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="resource.id", ondelete="SET NULL")
    location_destination: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="location.id", ondelete="SET NULL")
    address_destination: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="address.id", ondelete="SET NULL")

    name_contact: str = Field(sa_column=Column(String(128)))
    telephone_contact: str = Field(sa_column=Column(String(128)))
    id_contact: str = Field(sa_column=Column(String(128)))

    time_created: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), server_default=func.now()))
    time_updated: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True), onupdate=func.now()))

    resources: list[Resource] = Relationship(back_populates="emergencies", link_model=EmergencyResourceLink)