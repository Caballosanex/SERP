"""
Servicio de integración con Nokia Network as Code
"""
import os
import httpx
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

# URL del microservicio Nokia NAC
NOKIA_NAC_SERVICE_URL = os.getenv("NOKIA_NAC_SERVICE_URL", "http://nokia-nac:5002")

async def get_device_status(device_id: str) -> Dict[str, Any]:
    """
    Obtiene el estado de un dispositivo (online/offline)
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{NOKIA_NAC_SERVICE_URL}/device/status/{device_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Error al obtener el estado del dispositivo: {str(e)}")
            raise Exception(f"Error al comunicarse con el servicio Nokia NAC: {str(e)}")

async def subscribe_to_device_status(device_id: str, notification_url: str, notification_token: Optional[str] = None) -> Dict[str, Any]:
    """
    Suscribe a cambios de estado de un dispositivo
    """
    data = {
        "device_id": device_id,
        "notification_url": notification_url
    }
    if notification_token:
        data["notification_token"] = notification_token
        
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{NOKIA_NAC_SERVICE_URL}/device/status/subscribe", json=data)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Error al suscribirse a cambios de estado: {str(e)}")
            raise Exception(f"Error al comunicarse con el servicio Nokia NAC: {str(e)}")

async def unsubscribe_from_device_status(subscription_id: str) -> Dict[str, Any]:
    """
    Cancela una suscripción a cambios de estado
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(f"{NOKIA_NAC_SERVICE_URL}/device/status/subscription/{subscription_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Error al cancelar la suscripción: {str(e)}")
            raise Exception(f"Error al comunicarse con el servicio Nokia NAC: {str(e)}")

async def get_device_location(device_id: str) -> Dict[str, Any]:
    """
    Obtiene la ubicación de un dispositivo
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{NOKIA_NAC_SERVICE_URL}/device/location/{device_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Error al obtener la ubicación del dispositivo: {str(e)}")
            raise Exception(f"Error al comunicarse con el servicio Nokia NAC: {str(e)}")

async def verify_device_location(device_id: str, radius: Optional[int] = None) -> Dict[str, Any]:
    """
    Verifica la ubicación de un dispositivo con un radio opcional
    """
    data = {
        "device_id": device_id
    }
    if radius:
        data["radius"] = radius
        
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{NOKIA_NAC_SERVICE_URL}/device/location/verify", json=data)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Error al verificar la ubicación: {str(e)}")
            raise Exception(f"Error al comunicarse con el servicio Nokia NAC: {str(e)}")

async def create_qod_session(device_id: str, profile: str, duration: Optional[int] = 3600) -> Dict[str, Any]:
    """
    Crea una sesión de Quality of Service on Demand (QoD)
    """
    data = {
        "device_id": device_id,
        "profile": profile,
        "duration": duration
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{NOKIA_NAC_SERVICE_URL}/qod/sessions", json=data)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Error al crear sesión QoD: {str(e)}")
            raise Exception(f"Error al comunicarse con el servicio Nokia NAC: {str(e)}")

async def get_qod_session(session_id: str) -> Dict[str, Any]:
    """
    Obtiene información sobre una sesión QoD específica
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{NOKIA_NAC_SERVICE_URL}/qod/sessions/{session_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Error al obtener la sesión QoD: {str(e)}")
            raise Exception(f"Error al comunicarse con el servicio Nokia NAC: {str(e)}")

async def delete_qod_session(session_id: str) -> Dict[str, Any]:
    """
    Elimina una sesión QoD
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(f"{NOKIA_NAC_SERVICE_URL}/qod/sessions/{session_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Error al eliminar la sesión QoD: {str(e)}")
            raise Exception(f"Error al comunicarse con el servicio Nokia NAC: {str(e)}")

async def get_qod_profiles() -> Dict[str, List[str]]:
    """
    Obtiene los perfiles de QoD disponibles
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{NOKIA_NAC_SERVICE_URL}/qod/profiles")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Error al obtener los perfiles QoD: {str(e)}")
            raise Exception(f"Error al comunicarse con el servicio Nokia NAC: {str(e)}")

async def check_nokia_nac_health() -> bool:
    """
    Verifica si el servicio Nokia NAC está funcionando
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{NOKIA_NAC_SERVICE_URL}/health")
            response.raise_for_status()
            return response.json()["status"] == "healthy"
        except httpx.HTTPError as e:
            logger.error(f"Error al verificar el estado del servicio Nokia NAC: {str(e)}")
            return False 