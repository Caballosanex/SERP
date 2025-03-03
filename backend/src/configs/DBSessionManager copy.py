from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker, async_scoped_session
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy.orm import sessionmaker
from contextvars import ContextVar

from src.configs.config import settings

# Define a context variable to store the current task
current_task = ContextVar("current_task")

POSTGRES_PASSWORD = settings.POSTGRES_PASSWORD
POSTGRES_USER = settings.POSTGRES_USER
POSTGRES_DB = settings.POSTGRES_DB
POSTGRES_HOST = settings.POSTGRES_HOST
POSTGRES_PORT = settings.POSTGRES_PORT
DATABASE_URL = "postgresql+asyncpg://" + POSTGRES_USER + ":" + POSTGRES_PASSWORD + "@" + POSTGRES_HOST + ":" + POSTGRES_PORT + "/" + POSTGRES_DB

class DatabaseSessionManager:
    def __init__(self):
        self.engine: AsyncEngine | None = None
        self.session_maker: async_sessionmaker | None = None

    def init_db(self):
        """Initialize the async database engine and session maker."""
        self.engine = create_async_engine(
            DATABASE_URL,
            echo=True,  # Enable logging for debugging (optional)
            pool_pre_ping=True,  # Check if connection is alive
        )
        self.session_maker = async_sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False
        )

    async def close(self):
        """Close the database engine."""
        if self.engine:
            await self.engine.dispose()

    async def get_session(self) -> AsyncSession:
        """Dependency function for getting an async session."""
        if not self.session_maker:
            raise Exception("DatabaseSessionManager is not initialized")
        async with self.session_maker() as session:
            yield session  # Provide session and close after request

# Initialize the DatabaseSessionManager
sessionmanager = DatabaseSessionManager()
