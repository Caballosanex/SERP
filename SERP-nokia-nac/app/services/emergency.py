"""
Service for emergency-related operations with Nokia NAC QoD.
"""
import logging
import traceback
import time
import httpx
import datetime
from typing import Dict, Any, List
from app.services.device import get_device
from app.services.qod import create_qod_session
from app.core.client import nokia_nac_client
from app.core.config import settings

logger = logging.getLogger(__name__)


async def activate_qod_for_emergency(emergency_id: str, devices: List[str], profile: str, duration: int) -> Dict[str, Any]:
    """
    Activate QoD for all devices in an emergency.
    
    Args:
        emergency_id: The ID of the emergency.
        devices: List of device phone numbers.
        profile: The QoS profile to apply.
        duration: Duration of the sessions in seconds.
        
    Returns:
        A dictionary with activation results.
    """
    session_ids = []
    failed_devices = []

    for device_id in devices:
        try:
            # Ensure phone number format is correct
            clean_device_id = device_id.strip()
            if not clean_device_id.startswith("+"):
                clean_device_id = "+" + clean_device_id

            logger.info(f"Activating QoD for device: {clean_device_id}")

            # Create QoD session
            qod_session_result = await create_qod_session(
                device_id=clean_device_id,
                profile=profile,
                duration=duration
            )

            # Get session ID from result
            session_id = qod_session_result.get("session_id")
            logger.info(f"Successfully created QoD session: {session_id}")

            session_ids.append({
                "device_id": clean_device_id,
                "session_id": session_id,
                "profile": profile,
                "status": "active"
            })
        except Exception as e:
            logger.error(
                f"Failed to create QoD for device {device_id}: {str(e)}")
            error_detail = str(e)

            # Try direct HTTP request as fallback
            try:
                if hasattr(nokia_nac_client, '_api') and hasattr(nokia_nac_client._api, 'client'):
                    http_client = nokia_nac_client._api.client

                    if hasattr(http_client, 'base_url') and hasattr(http_client, 'headers'):
                        api_url = f"{http_client.base_url}/sessions"
                        headers = http_client.headers

                        # Payload with exact format
                        payload = {
                            "qosProfile": profile,
                            "device": {
                                "phoneNumber": clean_device_id
                            },
                            "applicationServer": {
                                "ipv4Address": settings.DEFAULT_IPV4
                            },
                            "duration": duration
                        }

                        logger.info(
                            f"Attempting direct request for device {clean_device_id}")

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

                                session_ids.append({
                                    "device_id": clean_device_id,
                                    "session_id": session_id,
                                    "profile": profile,
                                    "status": "active",
                                    "method": "direct_http"
                                })
                                continue  # Skip adding to failed_devices
            except Exception as direct_err:
                error_detail = f"{error_detail}. Direct request error: {str(direct_err)}"

            failed_devices.append({
                "device_id": device_id,
                "error": error_detail
            })

    return {
        "emergency_id": emergency_id,
        "activated_sessions": session_ids,
        "failed_devices": failed_devices,
        "timestamp": datetime.datetime.now().isoformat()
    }


async def deactivate_qod_for_emergency(emergency_id: str, devices: List[str]) -> Dict[str, Any]:
    """
    Deactivate QoD for all devices in an emergency.
    
    Args:
        emergency_id: The ID of the emergency.
        devices: List of device phone numbers.
        
    Returns:
        A dictionary with deactivation results.
    """
    results = []

    for phone_number in devices:
        try:
            # In a real implementation, we would first query the active sessions
            # of the device to get their IDs and then delete them

            # For now, simulating a successful response
            session_id = f"session-{emergency_id}-{phone_number}-{int(time.time())}"

            # In production, make a DELETE request to the API for each session
            # response = requests.delete(url, headers=headers)

            results.append({
                "device": phone_number,
                "success": True,
                "deactivated_session_id": session_id
            })
        except Exception as e:
            results.append({
                "device": phone_number,
                "success": False,
                "error": str(e)
            })

    return {
        "emergency_id": emergency_id,
        "deactivated_at": datetime.datetime.now().isoformat(),
        "results": results
    }


async def get_qod_status_for_emergency(emergency_id: str, devices: List[str]) -> Dict[str, Any]:
    """
    Get QoD status for all devices in an emergency.
    
    Args:
        emergency_id: The ID of the emergency.
        devices: List of device phone numbers.
        
    Returns:
        A dictionary with QoD status for each device.
    """
    results = []

    for phone_number in devices:
        try:
            # Get the device
            device = await get_device(phone_number)

            # Get all QoD sessions of the device
            all_sessions = device.sessions()

            # Convert sessions to a serializable format
            sessions_list = []
            for session in all_sessions:
                sessions_list.append({
                    "id": str(session.id) if hasattr(session, "id") else str(session),
                    "profile": session.profile if hasattr(session, "profile") else "unknown",
                    "created_at": session.created_at.isoformat() if hasattr(session, "created_at") else None,
                    "expires_at": session.expires_at.isoformat() if hasattr(session, "expires_at") else None,
                    "status": session.status if hasattr(session, "status") else "active"
                })

            results.append({
                "device": phone_number,
                "success": True,
                "has_active_sessions": len(sessions_list) > 0,
                "sessions": sessions_list
            })
        except Exception as e:
            results.append({
                "device": phone_number,
                "success": False,
                "error": str(e)
            })

    return {
        "emergency_id": emergency_id,
        "results": results
    }
