from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from src.coordinator.db_orchestrator import DBWorkflowOrchestrator

router = APIRouter()
orchestrator = DBWorkflowOrchestrator()


class CreateProjectRequest(BaseModel):
    name: str
    budget: float = 1000.0
    type: str = "short_drama"
    description: str = ""
    style_preset: str = "anime"
    aspect_ratio: str = "16:9"
    target_duration: int = 3


class UpdateProjectRequest(BaseModel):
    name: Optional[str] = None
    budget: Optional[float] = None


@router.get("/")
async def list_projects():
    async with orchestrator._get_session() as session:
        from src.db.repositories.project_repo import ProjectRepository
        repo = ProjectRepository(session)
        projects = await repo.list()
        return {
            "items": [
                {
                    "project_id": p.project_id,
                    "name": p.title,
                    "total_cost": p.total_cost,
                    "budget": p.global_config.get("budget", 0),
                    "created_at": p.created_at.isoformat(),
                }
                for p in projects
            ],
            "total": len(projects),
        }


@router.post("/")
async def create_project(req: CreateProjectRequest):
    result = await orchestrator.create_project({
        "name": req.name,
        "budget": req.budget,
        "type": req.type,
        "description": req.description,
        "style_preset": req.style_preset,
        "aspect_ratio": req.aspect_ratio,
        "target_duration": req.target_duration,
    })
    return result


@router.get("/{project_id}")
async def get_project(project_id: str):
    status = await orchestrator.get_project_status(project_id)
    if "error" in status:
        raise HTTPException(status_code=404, detail=status["error"])
    return status


@router.post("/{project_id}/execute")
async def execute_project(project_id: str, canvas_data: dict):
    result = await orchestrator.execute_workflow(project_id, canvas_data)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.patch("/{project_id}")
async def update_project(project_id: str, req: UpdateProjectRequest):
    async with orchestrator._get_session() as session:
        from src.db.repositories.project_repo import ProjectRepository
        repo = ProjectRepository(session)
        project = await repo.get(project_id)

        if not project:
            raise HTTPException(status_code=404, detail="项目不存在")

        update_data = {}
        if req.name:
            update_data["title"] = req.name
        if req.budget is not None:
            config = project.global_config
            config["budget"] = req.budget
            update_data["global_config"] = config

        if update_data:
            await repo.update(project_id, update_data)
            await session.commit()

        return {"project_id": project_id, "updated": True}


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    async with orchestrator._get_session() as session:
        from src.db.repositories.project_repo import ProjectRepository
        from src.db.repositories.graph_repo import GraphRepository
        from sqlalchemy import delete
        from src.db.models import EdgeModel, VersionModel, TaskModel

        project_repo = ProjectRepository(session)
        graph_repo = GraphRepository(session)

        project = await project_repo.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="项目不存在")

        nodes = await graph_repo.get_nodes(project_id)
        for node in nodes:
            await graph_repo.delete_node(project_id, node.node_id)

        await session.execute(delete(TaskModel).where(TaskModel.project_id == project_id))
        await project_repo.delete(project_id)
        await session.commit()

        return {"project_id": project_id, "deleted": True}


@router.get("/{project_id}/status")
async def get_project_status(project_id: str):
    result = await orchestrator.get_project_status(project_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/{project_id}/graph")
async def get_project_graph(project_id: str):
    result = await orchestrator.get_project_graph(project_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result