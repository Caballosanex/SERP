from sqlalchemy import create_engine
from models import Base


# Get Settings
from src.configs.config import settings
settings

POSTGRES_PASSWORD = settings.POSTGRES_PASSWORD
POSTGRES_USER = settings.POSTGRES_USER
POSTGRES_DB = settings.POSTGRES_DB
POSTGRES_HOST = settings.POSTGRES_HOST
POSTGRES_PORT = "5432"
DATABASE_URL = "postgresql+asyncpg://" + POSTGRES_USER + ":" + POSTGRES_PASSWORD + "@" + POSTGRES_HOST + ":" + POSTGRES_PORT + "/" + POSTGRES_DB

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)