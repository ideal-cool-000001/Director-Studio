from typing import Optional, List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._connections: dict[str, List[WebSocket]] = {}

    async def connect(self, project_id: str, websocket: WebSocket):
        if project_id not in self._connections:
            self._connections[project_id] = []
        self._connections[project_id].append(websocket)
        await websocket.accept()

    async def disconnect(self, project_id: str, websocket: WebSocket):
        if project_id in self._connections:
            try:
                self._connections[project_id].remove(websocket)
            except ValueError:
                pass
            if not self._connections[project_id]:
                del self._connections[project_id]

    async def broadcast(self, project_id: str, event: str, payload: dict):
        connections = self._connections.get(project_id, [])
        message = {"event": event, "project_id": project_id, "payload": payload}
        disconnected_ws: List[WebSocket] = []

        for ws in connections:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected_ws.append(ws)

        for ws in disconnected_ws:
            await self.disconnect(project_id, ws)


connection_manager = ConnectionManager()