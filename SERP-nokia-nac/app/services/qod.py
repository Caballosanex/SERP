"""
Service for Quality of Service on Demand (QoD) operations with Nokia NAC.
"""
import logging
import traceback
import time
import httpx
import datetime
from typing import Dict, Any, List, Optional
from app.services.device import get_device
from app.core.client import nokia_nac_client
from app.core.config import settings

logger = logging.getLogger(__name__)


async def create_qod_session(device_id: str, profile: str, duration: Optional[int] = 3600) -> Dict[str, Any]:
    """
    Create a QoD session for a device.
    
    Args:
        device_id: The phone number of the device.
        profile: The QoS profile to apply.
        duration: Duration of the session in seconds.
        
    Returns:
        A dictionary with session information.
    """
    try:
        # Aseguramos que el número de teléfono tenga el formato correcto
        if not device_id.startswith("+"):
            device_id = "+" + device_id.strip()

        logger.info(f"Creating QoD session for device: {device_id}")
        logger.info(f"  profile: {profile}")
        logger.info(f"  duration: {duration}")

        # Obtenemos el dispositivo usando el cliente Nokia NAC
        device = await get_device(device_id)

        logger.info(f"Device found: {device}")

        # Creamos la sesión QoD con los parámetros aceptados
        qod_session = device.create_qod_session(
            service_ipv4=settings.DEFAULT_IPV4,  # Formato correcto según documentación
            profile=profile,
            duration=duration
        )

        logger.info(f"QoD session created: {qod_session}")

        # Devolvemos la información de la sesión creada
        return {
            "session_id": qod_session.id if hasattr(qod_session, 'id') else str(qod_session),
            "device_id": device_id,
            "profile": profile,
            "duration": duration,
            "status": "active",
            "created_at": datetime.datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error creating QoD session: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")

        # Error detail for better debugging
        error_detail = str(e)
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            error_detail = f"{error_detail}. Response: {e.response.text}"

        # Try with direct HTTP request as fallback
        try:
            if hasattr(nokia_nac_client, '_api') and hasattr(nokia_nac_client._api, 'client'):
                http_client = nokia_nac_client._api.client

                if hasattr(http_client, 'base_url') and hasattr(http_client, 'headers'):
                    api_url = f"{http_client.base_url}/sessions"
                    headers = http_client.headers

                    # Create the payload with exact format
                    payload = {
                        "qosProfile": profile,
                        "device": {
                            "phoneNumber": device_id
                        },
                        "applicationServer": {
                            "ipv4Address": settings.DEFAULT_IPV4
                        },
                        "duration": duration
                    }

                    logger.info(
                        f"Attempting direct request with payload: {payload}")

                    # Make the HTTP request
                    async with httpx.AsyncClient() as direct_client:
                        response = await direct_client.post(
                            api_url,
                            json=payload,
                            headers=headers
                        )

                        if response.status_code in [200, 201, 202]:
                            try:
                                response_data = response.json()
                                session_id = response_data.get(
                                    'id', f"session-{int(time.time())}")
                            except Exception:
                                session_id = f"session-{int(time.time())}"

                            return {
                                "session_id": session_id,
                                "device_id": device_id,
                                "profile": profile,
                                "duration": duration,
                                "status": "active",
                                "created_at": datetime.datetime.now().isoformat(),
                                "method": "direct_http"
                            }
                        else:
                            error_detail = f"{error_detail}. Direct request failed: HTTP {response.status_code}: {response.text}"
        except Exception as direct_err:
            error_detail = f"{error_detail}. Direct request error: {str(direct_err)}"

        raise Exception(f"Error creating QoD session: {error_detail}")


async def get_qod_session(session_id: str) -> Dict[str, Any]:
    """
    Get information about a QoD session.
    
    Args:
        session_id: The ID of the QoD session.
        
    Returns:
        A dictionary with session information.
    """
    try:
        # In a real implementation, this would use the Nokia NAC SDK to get session info
        # For now, returning a placeholder
        return {
            "session_id": session_id,
            "status": "active",
            "created_at": "2023-07-04T20:21:00Z",
            "expires_at": "2023-07-04T21:21:00Z"
        }
    except Exception as e:
        logger.error(f"Error getting QoD session {session_id}: {str(e)}")
        raise


async def delete_qod_session(session_id: str) -> Dict[str, Any]:
    """
    Delete a QoD session.
    
    Args:
        session_id: The ID of the QoD session to delete.
        
    Returns:
        A success message.
    """
    try:
        # In a real implementation, this would use the Nokia NAC SDK to delete the session
        # For now, returning a placeholder
        return {"message": "Sesión QoD eliminada correctamente"}
    except Exception as e:
        logger.error(f"Error deleting QoD session {session_id}: {str(e)}")
        raise


async def get_qod_profiles() -> Dict[str, List[str]]:
    """
    Get available QoD profiles.
    
    Returns:
        A dictionary with a list of available profiles.
    """
    # Profiles according to Nokia NAC documentation
    profiles = [
        "QOS_A",
        "QOS_B",
        "QOS_C",
        "QOS_D",
        "QOS_E"
    ]
    return {"profiles": profiles}
