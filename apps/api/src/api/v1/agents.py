from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any

from src.agents.registry import AgentRegistry
from src.coordinator.db_orchestrator import DBWorkflowOrchestrator
from src.db.session import get_db

router = APIRouter()
orchestrator = DBWorkflowOrchestrator()


class GenerateRequest(BaseModel):
    quality_level: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class RegenerateRequest(BaseModel):
    modified_node_id: str
    quality_level: Optional[str] = None
    auto_confirm: bool = False


class ReviewRequest(BaseModel):
    action: str
    feedback: Optional[str] = None


@router.get("/list")
async def list_agents():
    return {"agents": AgentRegistry.list_agents()}


@router.post("/{agent_type}/execute")
async def execute_agent(agent_type: str, node_id: str, context: Dict[str, Any]):
    try:
        agent = AgentRegistry.create(agent_type)
        result = await agent.execute(node_id, context)
        return {
            "success": result.success,
            "data": result.data,
            "error": result.error,
            "cost": result.cost,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate")
async def trigger_full_generation(project_id: str, req: GenerateRequest):
    graph = await orchestrator.get_project_graph(project_id)
    if "error" in graph:
        raise HTTPException(status_code=404, detail=graph["error"])

    canvas_data = {
        "nodes": {n["id"]: n for n in graph["nodes"]},
        "edges": graph["edges"],
    }

    result = await orchestrator.execute_workflow(project_id, canvas_data)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/nodes/{node_id}/generate")
async def trigger_node_generation(project_id: str, node_id: str, req: GenerateRequest, db: AsyncSession = Depends(get_db)):
    graph = await orchestrator.get_project_graph(project_id)
    if "error" in graph:
        raise HTTPException(status_code=404, detail=graph["error"])

    node = next((n for n in graph["nodes"] if n["id"] == node_id), None)
    if not node:
        raise HTTPException(status_code=404, detail="节点不存在")

    context = req.context or {}
    context["project_id"] = project_id

    agent_type = node.get("data", {}).get("agent_type")
    if not agent_type:
        raise HTTPException(status_code=400, detail="节点缺少 agent_type")

    try:
        agent = AgentRegistry.create(agent_type)
        result = await agent.execute(node_id, context)

        from src.db.repositories.graph_repo import GraphRepository
        graph_repo = GraphRepository(db)
        await graph_repo.update_node(project_id, node_id, {
            "status": "ready" if result.success else "failed",
            "cost": result.cost,
        })
        await db.commit()

        return {
            "success": result.success,
            "data": result.data,
            "cost": result.cost,
            "error": result.error,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/regenerate")
async def trigger_regeneration(project_id: str, req: RegenerateRequest):
    result = await orchestrator.regenerate_node(project_id, req.modified_node_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/tasks/{task_id}")
async def get_task_status(project_id: str, task_id: str):
    async with orchestrator._get_session() as session:
        from sqlalchemy import select
        from src.db.models import TaskModel
        stmt = select(TaskModel).where(TaskModel.task_id == task_id)
        result = await session.execute(stmt)
        task = result.scalar_one_or_none()

        if not task:
            return {"task_id": task_id, "status": "pending", "progress": 0}

        return {
            "task_id": task.task_id,
            "project_id": task.project_id,
            "node_id": task.node_id,
            "status": task.status,
            "progress": task.progress,
            "result": task.result,
            "error": task.error,
            "estimated_cost": task.estimated_cost,
            "actual_cost": task.actual_cost,
            "created_at": task.created_at.isoformat(),
        }


@router.post("/tasks/{task_id}/cancel")
async def cancel_task(project_id: str, task_id: str):
    async with orchestrator._get_session() as session:
        from sqlalchemy import update
        from src.db.models import TaskModel
        stmt = update(TaskModel).where(TaskModel.task_id == task_id).values(status="cancelled")
        await session.execute(stmt)
        await session.commit()

    return {"task_id": task_id, "status": "cancelled"}


@router.post("/nodes/{node_id}/approve")
async def approve_node(project_id: str, node_id: str):
    result = await orchestrator.human_review(project_id, node_id, "approved")
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/nodes/{node_id}/reject")
async def reject_node(project_id: str, node_id: str, req: ReviewRequest):
    result = await orchestrator.human_review(project_id, node_id, "rejected", req.feedback)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/nodes/{node_id}/feedback")
async def submit_feedback(project_id: str, node_id: str, req: ReviewRequest):
    result = await orchestrator.human_review(project_id, node_id, "pending", req.feedback)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/{project_id}/nodes")
async def create_node(project_id: str, node_data: dict):
    result = await orchestrator.create_node(project_id, node_data)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.patch("/{project_id}/nodes/{node_id}")
async def update_node(project_id: str, node_id: str, node_data: dict):
    result = await orchestrator.update_node(project_id, node_id, node_data)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.delete("/{project_id}/nodes/{node_id}")
async def delete_node(project_id: str, node_id: str):
    result = await orchestrator.delete_node(project_id, node_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail="节点不存在")
    return result


@router.post("/{project_id}/edges")
async def create_edge(project_id: str, edge_data: dict):
    result = await orchestrator.create_edge(project_id, edge_data)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result