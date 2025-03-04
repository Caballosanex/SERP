"""
Nokia Network as Code client setup.
"""
import logging
import network_as_code as nac
from .config import settings

logger = logging.getLogger(__name__)


def create_nac_client():
    """Create and return a Nokia Network as Code client instance."""
    try:
        client = nac.NetworkAsCodeClient(
            token=settings.NOKIA_NAC_API_KEY
        )
        logger.info("Nokia NAC client initialized successfully")
        return client
    except Exception as e:
        logger.error(f"Error initializing Nokia NAC client: {str(e)}")
        raise


# Create a single instance of the client to be reused
try:
    nokia_nac_client = create_nac_client()
except Exception as e:
    logger.critical(f"Failed to initialize Nokia NAC client: {str(e)}")
    raise
