from pydantic import BaseModel
from typing import Optional
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
load_dotenv(".env",verbose=True)

print("DEBUG = ",  os.getenv("DATABASE_URL"))

class Settings(BaseModel):
    POSTGRES_HOST: Optional[str] = os.getenv("POSTGRES_HOST")
    POSTGRES_PASSWORD: Optional[str] = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_USER: Optional[str] = os.getenv("POSTGRES_USER")
    POSTGRES_DB: Optional[str] = os.getenv("POSTGRES_DB")
    POSTGRES_PORT: Optional[str] = os.getenv("POSTGRES_PORT")

    class Config:
        env_file = "../../.env"

settings = Settings()