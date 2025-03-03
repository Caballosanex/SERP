from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import logging
from sqlmodel import Session

from src.models.device import DeviceCreate, DeviceRead, DeviceUpdate
from src.services import device_service
from src.configs.DBSessionManager import get_db_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/devices", tags=["Devices"])

# Rutas CRUD básicas para dispositivos
@router.post("", response_model=DeviceRead, status_code=status.HTTP_201_CREATED)
async def create_device(device: DeviceCreate, session: Session = Depends(get_db_session)):
    """Crear un nuevo dispositivo"""
    return await device_service.create_device(session, device)

@router.get("", response_model=List[DeviceRead])
async def read_devices(skip: int = 0, limit: int = 100, session: Session = Depends(get_db_session)):
    """Obtener todos los dispositivos"""
    return await device_service.get_devices(session, skip, limit)

@router.get("/{device_id}", response_model=DeviceRead)
async def read_device(device_id: int, session: Session = Depends(get_db_session)):
    """Obtener un dispositivo por ID"""
    device = await device_service.get_device(session, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
    return device

@router.patch("/{device_id}", response_model=DeviceRead)
async def update_device(device_id: int, device_update: DeviceUpdate, session: Session = Depends(get_db_session)):
    """Actualizar un dispositivo"""
    device = await device_service.update_device(session, device_id, device_update)
    if device is None:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
    return device

@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(device_id: int, session: Session = Depends(get_db_session)):
    """Eliminar un dispositivo"""
    deleted = await device_service.delete_device(session, device_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
    return {"ok": True}

# Rutas para integración con Nokia NAC

@router.get("/{device_id}/status")
async def get_device_status(device_id: int, session: Session = Depends(get_db_session)):
    """Obtener el estado actual del dispositivo desde Nokia NAC"""
    try:
        return await device_service.get_device_status_from_nokia(session, device_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error al obtener el estado del dispositivo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener el estado del dispositivo: {str(e)}")

@router.get("/{device_id}/location")
async def get_device_location(device_id: int, session: Session = Depends(get_db_session)):
    """Obtener la ubicación actual del dispositivo desde Nokia NAC"""
    try:
        return await device_service.get_device_location_from_nokia(session, device_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error al obtener la ubicación del dispositivo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener la ubicación del dispositivo: {str(e)}")

@router.post("/{device_id}/qod")
async def create_qod_session(
    device_id: int, 
    profile: str, 
    duration: Optional[int] = 3600,
    session: Session = Depends(get_db_session)
):
    """Crear una sesión QoD para el dispositivo"""
    try:
        return await device_service.create_qod_session_for_device(
            session, 
            device_id, 
            profile, 
            duration
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error al crear sesión QoD: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al crear sesión QoD: {str(e)}")

@router.delete("/{device_id}/qod")
async def delete_qod_session(device_id: int, session: Session = Depends(get_db_session)):
    """Eliminar la sesión QoD activa del dispositivo"""
    try:
        return await device_service.delete_qod_session_for_device(session, device_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error al eliminar sesión QoD: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al eliminar sesión QoD: {str(e)}")

@router.get("/qod/profiles")
async def get_qod_profiles():
    """Obtener los perfiles QoD disponibles"""
    try:
        return {"profiles": await device_service.get_qod_profiles_from_nokia()}
    except Exception as e:
        logger.error(f"Error al obtener perfiles QoD: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener perfiles QoD: {str(e)}") 