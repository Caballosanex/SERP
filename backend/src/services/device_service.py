from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlmodel import select, Session
import logging

from src.models.device import Device, DeviceCreate, DeviceUpdate
from src.services import nokia_nac

logger = logging.getLogger(__name__)

async def get_device(session: Session, device_id: int) -> Optional[Device]:
    """Obtener un dispositivo por su ID"""
    statement = select(Device).where(Device.id == device_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()

async def get_devices(session: Session, skip: int = 0, limit: int = 100) -> List[Device]:
    """Obtener todos los dispositivos"""
    statement = select(Device).offset(skip).limit(limit)
    result = await session.execute(statement)
    return result.scalars().all()

async def create_device(session: Session, device: DeviceCreate) -> Device:
    """Crear un nuevo dispositivo"""
    db_device = Device.from_orm(device)
    session.add(db_device)
    await session.commit()
    await session.refresh(db_device)
    return db_device

async def update_device(session: Session, device_id: int, device_update: DeviceUpdate) -> Optional[Device]:
    """Actualizar un dispositivo existente"""
    db_device = await get_device(session, device_id)
    if not db_device:
        return None
        
    # Actualizar solo los campos que no son None
    device_data = device_update.dict(exclude_unset=True)
    for key, value in device_data.items():
        setattr(db_device, key, value)
    
    db_device.updated_at = datetime.utcnow()
    session.add(db_device)
    await session.commit()
    await session.refresh(db_device)
    return db_device

async def delete_device(session: Session, device_id: int) -> bool:
    """Eliminar un dispositivo"""
    db_device = await get_device(session, device_id)
    if not db_device:
        return False
        
    session.delete(db_device)
    await session.commit()
    return True

# Funciones para integración con Nokia NAC

async def get_device_status_from_nokia(session: Session, device_id: int) -> Dict[str, Any]:
    """Obtener el estado del dispositivo desde Nokia NAC y actualizar la base de datos"""
    db_device = await get_device(session, device_id)
    if not db_device:
        raise ValueError(f"Dispositivo con ID {device_id} no encontrado")
    
    try:
        # Consultar el estado del dispositivo usando la API de Nokia
        status_info = await nokia_nac.get_device_status(db_device.phone_number)
        
        # Actualizar el estado en la base de datos
        db_device.last_known_status = status_info.get("status")
        db_device.updated_at = datetime.utcnow()
        session.add(db_device)
        await session.commit()
        await session.refresh(db_device)
        
        return status_info
    except Exception as e:
        logger.error(f"Error al obtener el estado del dispositivo desde Nokia NAC: {str(e)}")
        raise

async def get_device_location_from_nokia(session: Session, device_id: int) -> Dict[str, Any]:
    """Obtener la ubicación del dispositivo desde Nokia NAC y actualizar la base de datos"""
    db_device = await get_device(session, device_id)
    if not db_device:
        raise ValueError(f"Dispositivo con ID {device_id} no encontrado")
    
    try:
        # Consultar la ubicación del dispositivo usando la API de Nokia
        location_info = await nokia_nac.get_device_location(db_device.phone_number)
        
        # Actualizar la ubicación en la base de datos
        if location_info and "latitude" in location_info and "longitude" in location_info:
            db_device.last_location_lat = location_info.get("latitude")
            db_device.last_location_lon = location_info.get("longitude")
            db_device.last_location_timestamp = datetime.utcnow()
            db_device.updated_at = datetime.utcnow()
            session.add(db_device)
            await session.commit()
            await session.refresh(db_device)
        
        return location_info
    except Exception as e:
        logger.error(f"Error al obtener la ubicación del dispositivo desde Nokia NAC: {str(e)}")
        raise

async def create_qod_session_for_device(
    session: Session, 
    device_id: int, 
    profile: str, 
    duration: Optional[int] = 3600
) -> Dict[str, Any]:
    """Crear una sesión QoD para un dispositivo y actualizar la base de datos"""
    db_device = await get_device(session, device_id)
    if not db_device:
        raise ValueError(f"Dispositivo con ID {device_id} no encontrado")
    
    try:
        # Crear la sesión QoD usando la API de Nokia
        session_info = await nokia_nac.create_qod_session(
            device_id=db_device.phone_number,
            profile=profile,
            duration=duration
        )
        
        # Actualizar la información de la sesión QoD en la base de datos
        if session_info and "session_id" in session_info:
            db_device.active_qod_session_id = session_info.get("session_id")
            db_device.active_qod_profile = profile
            db_device.active_qod_start_time = datetime.utcnow()
            db_device.active_qod_end_time = datetime.utcnow() + timedelta(seconds=duration)
            db_device.updated_at = datetime.utcnow()
            session.add(db_device)
            await session.commit()
            await session.refresh(db_device)
        
        return session_info
    except Exception as e:
        logger.error(f"Error al crear sesión QoD para el dispositivo: {str(e)}")
        raise

async def delete_qod_session_for_device(session: Session, device_id: int) -> Dict[str, Any]:
    """Eliminar la sesión QoD activa de un dispositivo y actualizar la base de datos"""
    db_device = await get_device(session, device_id)
    if not db_device:
        raise ValueError(f"Dispositivo con ID {device_id} no encontrado")
    
    if not db_device.active_qod_session_id:
        raise ValueError(f"El dispositivo no tiene una sesión QoD activa")
    
    try:
        # Eliminar la sesión QoD usando la API de Nokia
        result = await nokia_nac.delete_qod_session(db_device.active_qod_session_id)
        
        # Actualizar la información en la base de datos
        db_device.active_qod_session_id = None
        db_device.active_qod_profile = None
        db_device.active_qod_start_time = None
        db_device.active_qod_end_time = None
        db_device.updated_at = datetime.utcnow()
        session.add(db_device)
        await session.commit()
        await session.refresh(db_device)
        
        return result
    except Exception as e:
        logger.error(f"Error al eliminar sesión QoD para el dispositivo: {str(e)}")
        raise

async def get_qod_profiles_from_nokia() -> List[str]:
    """Obtener los perfiles QoD disponibles desde Nokia NAC"""
    try:
        profiles_info = await nokia_nac.get_qod_profiles()
        return profiles_info.get("profiles", [])
    except Exception as e:
        logger.error(f"Error al obtener perfiles QoD desde Nokia NAC: {str(e)}")
        raise 