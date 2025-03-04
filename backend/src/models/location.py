# from sqlalchemy import Column, String, Enum, Integer, Float, ForeignKey, DateTime, func
# from sqlalchemy.dialects.postgresql import UUID
# import enum
# from src.configs.database import Base
# import uuid

# class Location(Base):
#     __tablename__ = "locations"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

#     latitude = Column(Float, nullable=False)
#     longitude = Column(Float, nullable=False)
#     accuracy = Column(Float, nullable=True)
#     speed = Column(Float, nullable=True)
#     heading = Column(Float, nullable=True)

#     time_created = Column(DateTime(timezone=True), server_default=func.now())
#     time_updated = Column(DateTime(timezone=True), onupdate=func.now())

from sqlalchemy import Column, Float, DateTime, func
# from sqlalchemy.dialects.postgresql import UUID
import uuid as uuid_pkg
from src.configs.database import Base
from typing import Optional
from datetime import datetime
from sqlmodel import Field, Session, SQLModel, create_engine, select
# from uuid import uuid4, UUID

# class Location(SQLModel, table=True):
#     __tablename__ = "locations"

#     # id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     id: UUID = Field(default=uuid4, primary_key=True)
#     latitude: float = Column(Float, nullable=False)
#     longitude: float = Column(Float, nullable=False)
#     accuracy: Optional[float] = Column(Float, nullable=True)
#     speed: Optional[float] = Column(Float, nullable=True)
#     heading: Optional[float] = Column(Float, nullable=True)

#     time_created: datetime = Column(DateTime(timezone=True), server_default=func.now())
#     time_updated: Optional[datetime] = Column(DateTime(timezone=True), onupdate=func.now())

class Location(SQLModel, table=True):
    # __tablename__ = "locations"

    # id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id: uuid_pkg.UUID = Field(
        default_factory=uuid_pkg.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    latitude: float = Field(sa_column=Column(Float, nullable=False))
    longitude: float = Field(sa_column=Column(Float, nullable=False))
    accuracy: Optional[float] = Field(sa_column=Column(Float, nullable=True))
    speed: Optional[float] = Field(sa_column=Column(Float, nullable=True))
    heading: Optional[float] = Field(sa_column=Column(Float, nullable=True))

    time_created: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now()))
    time_updated: Optional[datetime] = Field(sa_column=Column(DateTime(timezone=True), onupdate=func.now()))
