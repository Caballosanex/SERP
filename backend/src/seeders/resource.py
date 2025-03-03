from faker import Faker
from src.seeders.address import address_seeder
from src.seeders.location import location_seeder
from src.models.resource import Resource, ResourceStatusEnum
import enum
import random

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.configs.database import get_db



RESOURCE_TYPES = ["ambulance", "firetruck", "police"]

async def resource_seeder():
    
    fake = Faker()

    resource_type = random.choice(RESOURCE_TYPES)

    actual_address = await address_seeder()
    actual_location = await location_seeder()

    normal_address = await address_seeder()
    normal_location = await location_seeder()

    status = random.choice(list(ResourceStatusEnum))
    responsible =  fake.first_name() + " " + fake.last_name()
    telephone = fake.phone_number()
    email = f"{fake.first_name()}{fake.last_name()}@mail.com"

    resourceSeed = Resource(
        resource_type = resource_type,

        actual_address = actual_address,
        actual_location = actual_location,

        normal_address = normal_address,
        normal_location = normal_location,

        status = status,
        responsible = responsible,
        telephone = telephone,
        email = email
    )
    async for db_session in get_db():
        async with db_session as db:
            db.add(resourceSeed)
            await db.commit()
            await db.refresh(resourceSeed) 


    return resourceSeed
