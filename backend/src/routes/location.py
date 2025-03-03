from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import logging

router = APIRouter(prefix="/location", tags=["Location"])

@router.get("")
async def get_locations():
    """Obtener todas las ubicaciones"""
    return {"message": "Lista de ubicaciones"}

@router.get("/{location_id}")
async def get_location(location_id: int):
    """Obtener detalles de una ubicación por ID"""
    return {"message": f"Detalles de la ubicación {location_id}"}

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_location(location_data: dict):
    """Crear una nueva ubicación"""
    return {"message": "Ubicación creada", "data": location_data}

@router.put("/{location_id}")
async def update_location(location_id: int, location_data: dict):
    """Actualizar una ubicación existente"""
    return {"message": f"Ubicación {location_id} actualizada", "data": location_data}

@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(location_id: int):
    """Eliminar una ubicación"""
    return {"message": f"Ubicación {location_id} eliminada"} 