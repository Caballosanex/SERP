from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import logging

router = APIRouter(prefix="/qosod", tags=["QoS on Demand"])

@router.get("")
async def get_qosod_sessions():
    """Obtener todas las sesiones QoS on Demand"""
    return {"message": "Lista de sesiones QoS on Demand"}

@router.get("/{session_id}")
async def get_qosod_session(session_id: str):
    """Obtener detalles de una sesión QoS on Demand por ID"""
    return {"message": f"Detalles de la sesión QoS on Demand {session_id}"}

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_qosod_session(session_data: dict):
    """Crear una nueva sesión QoS on Demand"""
    return {"message": "Sesión QoS on Demand creada", "data": session_data}

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_qosod_session(session_id: str):
    """Eliminar una sesión QoS on Demand"""
    return {"message": f"Sesión QoS on Demand {session_id} eliminada"}

@router.get("/profiles")
async def get_qosod_profiles():
    """Obtener los perfiles disponibles para QoS on Demand"""
    return {
        "profiles": [
            "DOWNLINK_S_UPLINK_S",
            "DOWNLINK_M_UPLINK_S",
            "DOWNLINK_L_UPLINK_M",
            "DOWNLINK_XL_UPLINK_L"
        ]
    } 