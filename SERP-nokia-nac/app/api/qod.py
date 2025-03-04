"""
API router for Quality of Service on Demand (QoD) operations.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import QoDSessionCreate
from app.services import qod

router = APIRouter(prefix="/qod", tags=["Quality of Service on Demand"])


@router.post("/sessions")
async def create_qod_session(session: QoDSessionCreate):
    """
    Crea una sesión QoD para un dispositivo específico usando el formato exacto requerido.
    """
    try:
        return await qod.create_qod_session(
            device_id=session.device_id,
            profile=session.profile,
            duration=session.duration
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al crear la sesión QoD: {str(e)}")


@router.get("/sessions/{session_id}")
async def get_qod_session(session_id: str):
    """Obtener información sobre una sesión QoD específica"""
    try:
        return await qod.get_qod_session(session_id)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener la sesión QoD: {str(e)}")


@router.delete("/sessions/{session_id}")
async def delete_qod_session(session_id: str):
    """Eliminar una sesión QoD"""
    try:
        return await qod.delete_qod_session(session_id)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al eliminar la sesión QoD: {str(e)}")


@router.get("/profiles")
async def get_qod_profiles():
    """Obtener los perfiles de QoD disponibles"""
    try:
        return await qod.get_qod_profiles()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener los perfiles QoD: {str(e)}")


@router.get("/test-qod-exact")
async def test_qod_exact():
    """
    Test QoD session creation using the EXACT request format provided.
    For development and testing purposes only.
    """
    try:
        # Test creating a QoD session with the exact format
        result = await qod.create_qod_session(
            device_id="+34696453332",
            profile="QOS_E",
            duration=3600
        )
        return {
            "status": "success",
            "result": result
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
