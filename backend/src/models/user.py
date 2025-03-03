from sqlalchemy import Column, String, Enum, DateTime, func
import enum
from src.configs.database import Base
import uuid as uuid_pkg
from sqlmodel import Field, Session, SQLModel, create_engine, select
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    # __tablename__ = "users"

    id: uuid_pkg.UUID = Field(
        default_factory=uuid_pkg.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    username: str = Field(sa_column=Column(String(21), unique=True, nullable=False))

    time_created: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now()))
    time_updated: Optional[datetime] = Field(sa_column=Column(DateTime(timezone=True), onupdate=func.now()))
