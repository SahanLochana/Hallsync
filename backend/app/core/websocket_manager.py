from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # Maps user_email to their active WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_email: str):
        await websocket.accept()
        self.active_connections[user_email] = websocket

    def disconnect(self, user_email: str):
        if user_email in self.active_connections:
            del self.active_connections[user_email]

    async def send_personal_message(self, message: dict, user_email: str):
        if user_email in self.active_connections:
            try:
                import json
                from datetime import datetime
                
                def json_serial(obj):
                    if isinstance(obj, datetime):
                        return obj.isoformat()
                    raise TypeError(f"Type {type(obj)} not serializable")
                    
                json_str = json.dumps(message, default=json_serial)
                await self.active_connections[user_email].send_text(json_str)
            except Exception as e:
                print(f"Error sending ws message to {user_email}: {e}")
                self.disconnect(user_email)

manager = ConnectionManager()
