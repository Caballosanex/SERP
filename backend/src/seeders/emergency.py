from faker import Faker
from src.seeders.address import address_seeder
from src.seeders.location import location_seeder
from src.seeders.resource import resource_seeder
from src.models.emergency import Emergency, EmergencyType, PriorityType, StatusType
import enum
import random
import string


from src.configs.database import get_db


resourcesNames = ["ambulance","firetruck","policecar"]

async def emergency_seeder():

    fake = Faker()

    name = random.choice(resourcesNames) + "-" + str(random.randint(100, 999))

    description = "That's a pseudorandom type for an emergency"
    priority = random.choice(list(PriorityType))
    emergency_type = random.choice(list(EmergencyType))
    status = random.choice(list(StatusType))

    location_emergency = await location_seeder()
    address_emergency = await address_seeder()

    resource = await resource_seeder()
    resource_id = resource.id
    location_resource = resource.actual_location
    address_resource = resource.actual_address

    destination = await resource_seeder()
    destination_id = destination.id
    location_destination = destination.actual_location
    address_destination = destination.actual_address

    name_contact = fake.first_name()
    telephone_contact = fake.phone_number()
    id_contact = ''.join(random.choices(string.digits, k=7)) + random.choice(string.ascii_uppercase)

    emergencySeed = Emergency(

        name = name,

        description = description,
        priority = priority,
        emergency_type = emergency_type,
        status = status,

        location_emergency = location_emergency,
        address_emergency = address_emergency,

        resource_id = resource_id,
        location_resource = location_resource,
        address_resource = address_resource,

        destination_id = destination_id,
        location_destination = location_destination,
        address_destination = address_destination,

        name_contact = name_contact,
        telephone_contact = telephone_contact,
        id_contact = id_contact
    )
    async for db_session in get_db():
        async with db_session as db:
            db.add(emergencySeed)
            await db.commit()
            await db.refresh(emergencySeed) 
    return emergencySeed.id