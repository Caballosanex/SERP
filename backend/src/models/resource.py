# from sqlalchemy import Column, String, Enum, Integer, Float, ForeignKey, DateTime, func
# from sqlalchemy.dialects.postgresql import UUID
# import enum
# from src.configs.database import Base
# import uuid

# from src.models.location import Location
# from src.models.address import Address

# class ResourceStatusEnum(str, enum.Enum):
#     UNKNOWN = "Unknown"
#     ACTIVE = "Active"
#     INACTIVE = "Inactive"
#     RESTING = "Resting"
#     AVAILIBLE = "Availible"

# class Resource(Base):
#     __tablename__ = "resources"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

#     resource_type = Column(String(128), nullable=False)

#     actual_address = Column(UUID(as_uuid=True), ForeignKey(Address.id))
#     actual_location = Column(UUID(as_uuid=True), ForeignKey(Location.id))

#     normal_address = Column(UUID(as_uuid=True), ForeignKey(Address.id))
#     normal_location = Column(UUID(as_uuid=True), ForeignKey(Location.id))

#     status = Column(Enum(ResourceStatusEnum), default=ResourceStatusEnum.UNKNOWN)
#     responsible = Column(String(128), nullable=False)
#     telephone = Column(String(128), nullable=False)
#     email = Column(String(128), nullable=False)

#     time_created = Column(DateTime(timezone=True), server_default=func.now())
#     time_updated = Column(DateTime(timezone=True), onupdate=func.now())


from sqlalchemy import Column, String, Enum, Integer, Float, ForeignKey, DateTime, func, ForeignKey
# from sqlalchemy.dialects.postgresql import UUID
import enum
from src.configs.database import Base
import uuid as uuid_pkg
from src.models.location import Location
from src.models.address import Address
from typing import Optional
from datetime import datetime
from sqlmodel import Field, Session, SQLModel, create_engine, select, Relationship
from uuid import uuid4, UUID
from src.models.emergencyresourceslink import EmergencyResourceLink

# Enum for resource status
class ResourceStatusEnum(str, enum.Enum):
    UNKNOWN = "Unknown"
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    RESTING = "Resting"
    AVAILABLE = "Available"  # Corrected typo "AVAILIBLE" -> "AVAILABLE"

class Resource(SQLModel, table=True):
    # __tablename__ = "resources"

    # id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id: uuid_pkg.UUID = Field(
        default_factory=uuid_pkg.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    resource_type: Optional[str] = Field(sa_column=Column(String(128), nullable=False))

    actual_address: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="address.id", ondelete="SET NULL")
    actual_location: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="location.id", ondelete="SET NULL")

    normal_address: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="address.id", ondelete="SET NULL")
    normal_location: Optional[uuid_pkg.UUID] = Field(default=None, foreign_key="location.id", ondelete="SET NULL")

    status: Optional[ResourceStatusEnum] = Field(sa_column=Column(Enum(ResourceStatusEnum), default=ResourceStatusEnum.UNKNOWN))
    responsible: Optional[str] = Field(sa_column=Column(String(128), nullable=False))
    telephone: Optional[str] = Field(sa_column=Column(String(128), nullable=False))
    email: Optional[str] = Field(sa_column=Column(String(128), nullable=False))

    time_created: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now()))
    time_updated: Optional[datetime] = Field(sa_column=Column(DateTime(timezone=True), onupdate=func.now()))

    emergencies: list["Emergency"] = Relationship(back_populates="resources", link_model=EmergencyResourceLink)