"""
Configuration settings for the Nokia NAC microservice.
"""
import os
from pydantic import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    """Application settings."""
    # API configuration
    API_TITLE: str = "SERP Nokia NAC API"
    API_DESCRIPTION: str = "API para interactuar con Nokia Network as Code"
    API_VERSION: str = "1.0.0"

    # Nokia NAC API key
    NOKIA_NAC_API_KEY: str = os.getenv("NOKIA_NAC_API_KEY", "")

    # Default device for testing
    DEFAULT_PHONE_NUMBER: str = "+34696453332"
    DEFAULT_IPV4: str = "0.0.0.0"

    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 5002

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
