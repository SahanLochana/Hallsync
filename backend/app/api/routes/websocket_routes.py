from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket_manager import manager

router = APIRouter(prefix="/ws", tags=["WebSockets"])

@router.websocket("/notifications/{user_email}")
async def websocket_endpoint(websocket: WebSocket, user_email: str):
    await manager.connect(websocket, user_email)
    try:
        while True:
            # We don't expect messages from client for now, just keep connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_email)
