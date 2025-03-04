from datetime import datetime, timedelta
import logging
from typing import List, Optional
from ..core.nokia_client import nokia_client
from ..models.qod import QoDSessionCreate, QoDSession
from ..core.config import settings
import httpx

logger = logging.getLogger(__name__)

class QoDService:
    def __init__(self):
        self.client = nokia_client.client
        self._active_sessions = {}

    async def create_session(self, session_data: QoDSessionCreate) -> QoDSession:
        try:
            # Normalize phone number
            phone_number = session_data.device_id if session_data.device_id.startswith("+") else f"+{session_data.device_id}"
            
            # Get device
            device = nokia_client.get_device(phone_number=phone_number)
            
            # Create QoD session
            qod_session = device.create_qod_session(
                service_ipv4=session_data.service_ipv4,
                profile=session_data.profile,
                duration=session_data.duration
            )
            
            # Create session object
            session = QoDSession(
                session_id=str(qod_session.id),
                device_id=phone_number,
                profile=session_data.profile,
                duration=session_data.duration,
                service_ipv4=session_data.service_ipv4,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(seconds=session_data.duration)
            )
            
            # Store session
            self._active_sessions[session.session_id] = session
            
            return session
            
        except Exception as e:
            logger.error(f"Error creating QoD session: {str(e)}")
            # Fallback to direct HTTP request if SDK fails
            try:
                return await self._create_session_direct(session_data)
            except Exception as direct_err:
                logger.error(f"Direct request also failed: {str(direct_err)}")
                raise

    async def _create_session_direct(self, session_data: QoDSessionCreate) -> QoDSession:
        """Fallback method using direct HTTP request"""
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {settings.NOKIA_NAC_API_KEY}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "qosProfile": session_data.profile,
                "device": {
                    "phoneNumber": session_data.device_id
                },
                "applicationServer": {
                    "ipv4Address": session_data.service_ipv4
                },
                "duration": session_data.duration
            }
            
            response = await client.post(
                f"{settings.NOKIA_NAC_API_URL}/sessions",
                json=payload,
                headers=headers
            )
            
            if response.status_code in [200, 201, 202]:
                response_data = response.json()
                return QoDSession(
                    session_id=response_data.get("id", f"session-{int(datetime.now().timestamp())}"),
                    **session_data.dict()
                )
            else:
                raise Exception(f"HTTP {response.status_code}: {response.text}")

    async def get_session(self, session_id: str) -> Optional[QoDSession]:
        return self._active_sessions.get(session_id)

    async def list_sessions(self, device_id: Optional[str] = None) -> List[QoDSession]:
        if device_id:
            return [s for s in self._active_sessions.values() if s.device_id == device_id]
        return list(self._active_sessions.values())

    async def delete_session(self, session_id: str) -> bool:
        if session_id in self._active_sessions:
            del self._active_sessions[session_id]
            return True
        return False

qod_service = QoDService() 