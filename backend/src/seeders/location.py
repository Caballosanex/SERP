from faker import Faker
from src.models.location import Location
import random
from src.configs.database import get_db
import asyncio


async def location_seeder():
    
    latitude: float = round(random.uniform(0, 360), 5)
    longitude:float = round(random.uniform(0, 360), 5)
    accuracy:float = round(random.uniform(0, 200), 5)
    speed:float = round(random.uniform(0, 360), 3)
    heading:float = round(random.uniform(0, 360), 5)

    locationSeed = Location(
        latitude = latitude,
        longitude = longitude,
        accuracy = accuracy,
        speed = speed,
        heading = heading
    )

    async for db_session in get_db():
        async with db_session as db:
            db.add(locationSeed)
            await db.commit()
            await db.refresh(locationSeed) 
    return locationSeed.id