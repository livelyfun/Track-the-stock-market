import asyncio
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            if user_id not in self.active_connections:
                self.active_connections[user_id] = set()
            self.active_connections[user_id].add(websocket)

    async def disconnect(self, user_id: int, websocket: WebSocket):
        async with self._lock:
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]

    async def send_personal_json(self, data: dict, websocket: WebSocket):
        try:
            await websocket.send_json(data)
        except Exception as e:
            logger.warning(f"Error sending message: {e}")

    async def send_user_json(self, user_id: int, data: dict):
        async with self._lock:
            sockets = list(self.active_connections.get(user_id, set()))
        for socket in sockets:
            try:
                await socket.send_json(data)
            except Exception as e:
                logger.warning(f"Failed to send to user {user_id}: {e}")

    def get_active_user_ids(self) -> Set[int]:
        return set(self.active_connections.keys())

ws_manager = ConnectionManager()
