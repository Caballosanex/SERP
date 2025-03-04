"""
API router for Quality of Service on Demand (QoD) operations.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import QoDSessionCreate, QoDSession, QoDSessionList, EmergencyQoDRequest
from app.services import qod_service
from app.core.config import settings

router = APIRouter(prefix="/qod", tags=["Quality of Service"])


@router.post("/sessions", response_model=QoDSession)
async def create_qod_session(session: QoDSessionCreate):
    """Create a new QoD session for a device"""
    try:
        return await qod_service.create_session(session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions", response_model=QoDSessionList)
async def list_qod_sessions(
    device_id: Optional[str] = Query(None, description="Filter sessions by device ID")
):
    """List all active QoD sessions"""
    try:
        sessions = await qod_service.list_sessions(device_id)
        return QoDSessionList(sessions=sessions, total=len(sessions))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/{session_id}", response_model=QoDSession)
async def get_qod_session(session_id: str):
    """Get details of a specific QoD session"""
    try:
        session = await qod_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/sessions/{session_id}")
async def delete_qod_session(session_id: str):
    """Delete a specific QoD session"""
    try:
        if await qod_service.delete_session(session_id):
            return {"message": "Session deleted successfully"}
        raise HTTPException(status_code=404, detail="Session not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/emergency", response_model=List[QoDSession])
async def create_emergency_qod(emergency: EmergencyQoDRequest):
    """Create QoD sessions for multiple devices in emergency situation"""
    try:
        sessions = []
        for device_id in emergency.devices:
            session_data = QoDSessionCreate(
                device_id=device_id,
                profile=emergency.profile,
                duration=emergency.duration,
                service_ipv4=settings.DEFAULT_IPV4
            )
            session = await qod_service.create_session(session_data)
            sessions.append(session)
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
