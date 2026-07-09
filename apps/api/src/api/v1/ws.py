from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from src.ws.manager import connection_manager
from src.ws.events import WSEventType, WSMessage

router = APIRouter()


@router.websocket("/ws/projects/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: str):
    await connection_manager.connect(project_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("event")
            
            if event_type == "review:action":
                await handle_review_action(project_id, data)
            elif event_type == "canvas:node_moved":
                await handle_node_moved(project_id, data)
            else:
                await websocket.send_json({"type": "echo", "data": data})
                
    except WebSocketDisconnect:
        await connection_manager.disconnect(project_id, websocket)


async def handle_review_action(project_id: str, data: dict):
    payload = data.get("payload", {})
    node_id = payload.get("node_id")
    action = payload.get("action")
    
    if node_id and action:
        await connection_manager.broadcast(
            project_id,
            WSEventType.REVIEW_COMPLETED.value,
            {
                "node_id": node_id,
                "action": action,
                "feedback": payload.get("feedback"),
            }
        )


async def handle_node_moved(project_id: str, data: dict):
    await connection_manager.broadcast(
        project_id,
        "canvas:node_moved",
        data.get("payload", {})
    )