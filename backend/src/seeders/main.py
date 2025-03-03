from src.seeders.emergency import emergency_seeder

async def seed_db():
    for _ in range(5):  # Seed 10 random records
        await emergency_seeder()