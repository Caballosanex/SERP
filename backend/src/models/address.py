# from sqlalchemy import Column, String, Enum, DateTime, func, Float
# from sqlalchemy.dialects.postgresql import UUID
# import enum
# from src.configs.database import Base
# import uuid

# class Address(Base):
#     __tablename__ = "addresses"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
#     street_number = Column(String(16), nullable=True)
#     street_name = Column(String(64), nullable=True)
#     neighborhood = Column(String(64), nullable=True)
#     city = Column(String(64), nullable=True)
#     state = Column(String(64), nullable=True)
#     postal_code = Column(String(64), nullable=True)
#     country = Column(String(64), nullable=True)
#     country_code = Column(String(64), nullable=True)
#     latitude = Column(Float, nullable=True)
#     longitude = Column(Float, nullable=True)
#     address_line_1 = Column(String(128), nullable=True)

#     time_created = Column(DateTime(timezone=True), server_default=func.now())
#     time_updated = Column(DateTime(timezone=True), onupdate=func.now())

from sqlalchemy import Column, String, Float, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid as uuid_pkg
from src.configs.database import Base
from typing import Optional
from datetime import datetime
from sqlmodel import Field, Session, SQLModel, create_engine, select
from uuid import uuid4, UUID

class Address(SQLModel, table=True):
    # __tablename__ = "addresses"

    # id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id: uuid_pkg.UUID = Field(
        default_factory=uuid_pkg.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    
    street_number: Optional[str] = Field(sa_column=Column(String(16), nullable=True))
    street_name: Optional[str] = Field(sa_column=Column(String(64), nullable=True))
    neighborhood: Optional[str] = Field(sa_column=Column(String(64), nullable=True))
    city: Optional[str] = Field(sa_column=Column(String(64), nullable=True))
    state: Optional[str] = Field(sa_column=Column(String(64), nullable=True))
    postal_code: Optional[str] = Field(sa_column=Column(String(64), nullable=True))
    country: Optional[str] = Field(sa_column=Column(String(64), nullable=True))
    country_code: Optional[str] = Field(sa_column=Column(String(64), nullable=True))
    latitude: Optional[float] = Field(sa_column=Column(Float, nullable=True))
    longitude: Optional[float] = Field(sa_column=Column(Float, nullable=True))
    address_line_1: Optional[str] = Field(sa_column=Column(String(128), nullable=True))

    time_created: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now()))
    time_updated: Optional[datetime] = Field(sa_column=Column(DateTime(timezone=True), onupdate=func.now()))

    
