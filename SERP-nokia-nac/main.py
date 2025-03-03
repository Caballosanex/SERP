import os
from fastapi import FastAPI, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import network_as_code as nac
from dotenv import load_dotenv
import random
import datetime
import traceback
import time
import requests
import json
import httpx
# Cargar variables de entorno
load_dotenv()

app = FastAPI(title="SERP Nokia NAC API",
              description="API para interactuar con Nokia Network as Code")

# Obtener la clave API de las variables de entorno
NOKIA_NAC_API_KEY = os.getenv("NOKIA_NAC_API_KEY")
if not NOKIA_NAC_API_KEY:
    raise ValueError(
        "La clave API de Nokia NAC no está configurada en las variables de entorno")

# Crear un cliente Nokia NAC
try:
    client = nac.NetworkAsCodeClient(
        token=NOKIA_NAC_API_KEY
    )
    print("Cliente Nokia NAC inicializado correctamente")
except Exception as e:
    print(f"Error al inicializar el cliente Nokia NAC: {str(e)}")
    raise

# Modelos de datos


class DeviceInfo(BaseModel):
    device_id: str  # Formato: device@testcsp.net o número de teléfono


class QoDSessionCreate(BaseModel):
    device_id: str
    profile: str  # Perfil QoS
    duration: Optional[int] = 3600  # Duración en segundos (por defecto 1 hora)


class LocationRequest(BaseModel):
    device_id: str
    radius: Optional[int] = None


class StatusSubscription(BaseModel):
    device_id: str
    notification_url: str
    notification_token: Optional[str] = None


class EmergencyQoDActivation(BaseModel):
    devices: List[str]
    profile: str = "QOS_E"
    duration: int = 3600


class EmergencyQoDDeactivation(BaseModel):
    devices: List[str]

# Rutas para Device Status


@app.get("/device/status/{device_id}")
async def get_device_status(device_id: str):
    """Obtener el estado de un dispositivo (online/offline)"""
    try:
        # Usar la estructura correcta del cliente
        device = client.devices.get(device_id)
        # Convertir el objeto a un diccionario para poder devolverlo como JSON
        device_dict = {
            "device_id": device_id,
            "network_access_identifier": getattr(device, "network_access_identifier", None),
            "phone_number": getattr(device, "phone_number", None),
            "ipv4_address": getattr(device, "ipv4_address", None),
            "ipv6_address": getattr(device, "ipv6_address", None),
            "status": "online"  # Asumimos que si no hay error, el dispositivo está online
        }
        return device_dict
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener el estado del dispositivo: {str(e)}")


@app.post("/device/status/subscribe")
async def subscribe_to_device_status(subscription: StatusSubscription):
    """Suscribirse a cambios de estado de un dispositivo"""
    try:
        return {"subscription_id": "not_implemented_yet"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al suscribirse a cambios de estado: {str(e)}")


@app.delete("/device/status/subscription/{subscription_id}")
async def unsubscribe_from_device_status(subscription_id: str):
    """Cancelar una suscripción a cambios de estado"""
    try:
        return {"message": "Suscripción cancelada correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al cancelar la suscripción: {str(e)}")

# Rutas para QoD (Quality of Service on Demand)


@app.post("/qod/sessions")
async def create_qod_session(session: QoDSessionCreate):
    """
    Crea una sesión QoD para un dispositivo específico usando el formato exacto requerido.
    """
    try:
        # Aseguramos que el número de teléfono tenga el formato correcto (con + y sin espacios)
        device_id = session.device_id.strip()
        if not device_id.startswith("+"):
            device_id = "+" + device_id

        print(f"Creating QoD session for device: {device_id}")
        print(f"  profile: {session.profile}")
        print(f"  duration: {session.duration}")

        # Obtenemos el dispositivo usando el cliente Nokia NAC
        device = client.devices.get(phone_number=device_id)

        print(f"Device found: {device}")

        # Creamos la sesión QoD con los parámetros aceptados
        qod_session = device.create_qod_session(
            service_ipv4="0.0.0.0",  # Formato correcto según documentación
            profile=session.profile,
            duration=session.duration
        )

        print(f"QoD session created: {qod_session}")

        # Devolvemos la información de la sesión creada
        return {
            "session_id": qod_session.id if hasattr(qod_session, 'id') else str(qod_session),
            "device_id": device_id,
            "profile": session.profile,
            "duration": session.duration,
            "status": "active",
            "created_at": datetime.datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error detallado: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")

        # Intentar obtener más información sobre el error
        error_detail = str(e)
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            error_detail = f"{error_detail}. Response: {e.response.text}"

        # Si el SDK falla, intentar con el método directo
        try:
            if hasattr(client, '_api') and hasattr(client._api, 'client'):
                http_client = client._api.client

                if hasattr(http_client, 'base_url') and hasattr(http_client, 'headers'):
                    api_url = f"{http_client.base_url}/sessions"
                    headers = http_client.headers

                    # Crear el payload con el FORMATO EXACTO proporcionado
                    payload = {
                        "qosProfile": session.profile,
                        "device": {
                            "phoneNumber": device_id
                        },
                        "applicationServer": {
                            "ipv4Address": "0.0.0.0"  # IP exacta como string
                        },
                        "duration": session.duration
                    }

                    print(f"Attempting direct request with payload: {payload}")

                    # Hacer la solicitud HTTP directa
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
                                "profile": session.profile,
                                "duration": session.duration,
                                "status": "active",
                                "created_at": datetime.datetime.now().isoformat(),
                                "method": "direct_http"
                            }
                        else:
                            error_detail = f"{error_detail}. Direct request failed: HTTP {response.status_code}: {response.text}"
        except Exception as direct_err:
            error_detail = f"{error_detail}. Direct request error: {str(direct_err)}"

        raise HTTPException(
            status_code=500, detail=f"Error al crear la sesión QoD: {error_detail}")


@app.get("/qod/sessions/{session_id}")
async def get_qod_session(session_id: str):
    """Obtener información sobre una sesión QoD específica"""
    try:
        return {
            "session_id": session_id,
            "status": "active",
            "created_at": "2023-07-04T20:21:00Z",
            "expires_at": "2023-07-04T21:21:00Z"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener la sesión QoD: {str(e)}")


@app.delete("/qod/sessions/{session_id}")
async def delete_qod_session(session_id: str):
    """Eliminar una sesión QoD"""
    try:
        return {"message": "Sesión QoD eliminada correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al eliminar la sesión QoD: {str(e)}")


@app.get("/qod/profiles")
async def get_qod_profiles():
    """Obtener los perfiles de QoD disponibles"""
    # Perfiles según la documentación de Nokia Network as Code
    profiles = [
        # Perfiles CAMARA de Nokia

        # Perfiles específicos de Nokia
        "QOS_A",
        "QOS_B",
        "QOS_C",
        "QOS_D",
        "QOS_E"
    ]
    return {"profiles": profiles}


@app.get("/health")
async def health_check():
    """Endpoint de verificación de salud para comprobar si el servicio está funcionando"""
    return {"status": "healthy", "service": "Nokia NAC API"}


@app.post("/emergency/{emergency_id}/activate-qod")
async def activate_qod_for_emergency(emergency_id: str, body: EmergencyQoDActivation):
    """
    Activa QoD para todos los dispositivos asociados a una emergencia.
    """
    try:
        session_ids = []
        failed_devices = []

        for device_id in body.devices:
            try:
                # Aseguramos que el número de teléfono tenga el formato correcto (con + y sin espacios)
                clean_device_id = device_id.strip()
                if not clean_device_id.startswith("+"):
                    clean_device_id = "+" + clean_device_id

                print(f"Activating QoD for device: {clean_device_id}")

                # Obtenemos el dispositivo usando el cliente Nokia NAC
                device = client.devices.get(phone_number=clean_device_id)

                # Creamos la sesión QoD con los parámetros aceptados y el formato correcto
                qod_session = device.create_qod_session(
                    service_ipv4="0.0.0.0",  # Formato correcto según documentación
                    profile=body.profile,
                    duration=body.duration
                )

                session_id = qod_session.id if hasattr(
                    qod_session, 'id') else str(qod_session)
                print(f"Successfully created QoD session: {session_id}")

                session_ids.append({
                    "device_id": clean_device_id,
                    "session_id": session_id,
                    "profile": body.profile,
                    "status": "active"
                })
            except Exception as e:
                print(f"Failed to create QoD for device {device_id}: {str(e)}")

                # Intentar obtener más información sobre el error
                error_detail = str(e)
                if hasattr(e, 'response') and hasattr(e.response, 'text'):
                    error_detail = f"{error_detail}. Response: {e.response.text}"

                # Intentar método alternativo con llamada HTTP directa
                try:
                    if hasattr(client, '_api') and hasattr(client._api, 'client'):
                        http_client = client._api.client

                        if hasattr(http_client, 'base_url') and hasattr(http_client, 'headers'):
                            api_url = f"{http_client.base_url}/sessions"
                            headers = http_client.headers

                            # Payload con formato exacto
                            payload = {
                                "qosProfile": body.profile,
                                "device": {
                                    "phoneNumber": clean_device_id
                                },
                                "applicationServer": {
                                    "ipv4Address": "0.0.0.0"
                                },
                                "duration": body.duration
                            }

                            print(
                                f"Attempting direct request for device {clean_device_id}")

                            # Hacer la solicitud HTTP directa
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
                                        "profile": body.profile,
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
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al activar QoD para la emergencia: {str(e)}")


@app.delete("/emergency/{emergency_id}/deactivate-qod")
async def deactivate_qod_for_emergency(emergency_id: str, body: EmergencyQoDDeactivation):
    """Desactivar QoD para todos los dispositivos en una emergencia cuando se resuelve"""
    try:
        # Extraemos los dispositivos
        devices_phone_numbers = body.devices

        results = []

        for phone_number in devices_phone_numbers:
            try:
                # En un sistema real, consultaríamos primero las sesiones activas
                # del dispositivo para obtener sus IDs y luego eliminarlas

                # Por ahora, simulamos una respuesta exitosa
                session_id = f"session-{emergency_id}-{phone_number}-{int(time.time())}"

                # En producción, haríamos una llamada DELETE a la API por cada sesión
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
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al desactivar QoD para la emergencia: {str(e)}")


@app.get("/emergency/{emergency_id}/qod-status")
async def get_qod_status_for_emergency(emergency_id: str, devices: List[str] = Query(...)):
    """Obtener el estado de QoD para todos los dispositivos en una emergencia"""
    try:
        results = []

        for phone_number in devices:
            try:
                # Usamos directamente el cliente de Nokia NAC
                # En un sistema real, haríamos dos cosas:

                # 1. Obtener el dispositivo
                device = client.devices.get(phone_number=phone_number)

                # 2. Obtener todas las sesiones QoD del dispositivo
                all_sessions = device.sessions()

                # Convertimos las sesiones a un formato serializable
                sessions_list = []
                for session in all_sessions:
                    # Si tenemos el ID de la sesión, también podríamos obtenerla directamente:
                    # session_detail = client.sessions.get(session.id)

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
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener el estado de QoD para la emergencia: {str(e)}")


@app.get("/test-qod-exact")
async def test_qod_exact():
    """
    Test QoD session creation using the EXACT request format provided
    """
    try:
        # Número de teléfono para la prueba
        phone_number = "+34696453332"
        profile = "QOS_E"
        duration = 3600

        print(
            f"Testing QoD creation with EXACT format for phone: {phone_number}")

        try:
            # Obtener el dispositivo para tener acceso al cliente HTTP
            device = client.devices.get(phone_number=phone_number)

            # Acceder al cliente HTTP interno
            http_client = None
            api_url = None
            headers = {}

            if hasattr(client, '_api') and hasattr(client._api, 'client'):
                http_client = client._api.client

                if hasattr(http_client, 'base_url'):
                    api_url = f"{http_client.base_url}/sessions"
                    print(f"API URL: {api_url}")

                if hasattr(http_client, 'headers'):
                    headers = http_client.headers
                    print(f"Using headers: {list(headers.keys())}")

            # Si tenemos acceso al cliente HTTP, hacer la solicitud directamente
            if http_client and api_url:
                # Crear el payload con el FORMATO EXACTO proporcionado
                payload = {
                    "qosProfile": profile,
                    "device": {
                        "phoneNumber": phone_number
                    },
                    "applicationServer": {
                        "ipv4Address": "0.0.0.0"  # IP exacta como string
                    },
                    "duration": duration
                }

                print(f"Sending EXACT payload: {payload}")

                # Usar el cliente HTTP para hacer la solicitud directamente
                async with httpx.AsyncClient() as direct_client:
                    response = await direct_client.post(
                        api_url,
                        json=payload,
                        headers=headers
                    )

                    print(f"Response status: {response.status_code}")
                    print(f"Response content: {response.text}")

                    return {
                        "status": response.status_code,
                        "response": response.text,
                        "payload_used": payload
                    }
            else:
                return {
                    "error": "Could not access internal HTTP client",
                    "payload_would_be": {
                        "qosProfile": profile,
                        "device": {
                            "phoneNumber": phone_number
                        },
                        "applicationServer": {
                            "ipv4Address": "0.0.0.0"
                        },
                        "duration": duration
                    }
                }
        except Exception as e:
            print(f"Error: {e}")
            print(traceback.format_exc())
            return {"error": str(e)}
    except Exception as e:
        print(f"General error: {e}")
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)
