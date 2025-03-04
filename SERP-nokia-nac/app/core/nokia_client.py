import network_as_code as nac
from .config import settings
import logging

logger = logging.getLogger(__name__)

class NokiaNACClient:
    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NokiaNACClient, cls).__new__(cls)
            try:
                cls._client = nac.NetworkAsCodeClient(
                    token=settings.NOKIA_NAC_API_KEY
                )
                logger.info("Nokia NAC client initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing Nokia NAC client: {str(e)}")
                raise
        return cls._instance

    @property
    def client(self):
        return self._client

    def get_device(self, phone_number: str = None, ipv4_address: str = None):
        """
        Get a device by phone number or IPv4 address
        """
        try:
            if phone_number:
                return self.client.devices.get(phone_number=phone_number)
            elif ipv4_address:
                return self.client.devices.get(
                    ipv4_address=nac.models.device.DeviceIpv4Addr(
                        public_address=ipv4_address
                    )
                )
            else:
                raise ValueError("Either phone_number or ipv4_address must be provided")
        except Exception as e:
            logger.error(f"Error getting device: {str(e)}")
            raise

nokia_client = NokiaNACClient() 