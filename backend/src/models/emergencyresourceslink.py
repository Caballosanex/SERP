from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

import uuid as uuid_pkg

# # The association table to represent the many-to-many relationship
# class EmergenciesToResources(SQLModel, table=True):
#     __tablename__ = "emergencies_resources"

#     emergency: uuid_pkg.UUID = Field(default=None, foreign_key="emergencies.id")
#     resource: uuid_pkg.UUID = Field(default=None, foreign_key="resources.id")


class EmergencyResourceLink(SQLModel, table=True):
    emergency_id: uuid_pkg.UUID | None = Field(default=None, foreign_key="emergency.id", primary_key=True)
    resource_id: uuid_pkg.UUID | None = Field(default=None, foreign_key="resource.id", primary_key=True)
