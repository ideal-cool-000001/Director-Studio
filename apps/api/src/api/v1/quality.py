from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.session import get_db
from src.db.repositories.graph_repo import GraphRepository
from src.ws.manager import connection_manager
from src.ws.events import WSEventType

router = APIRouter()


@router.post("/projects/{project_id}/nodes/{node_id}/quality-check")
async def check_node_quality(project_id: str, node_id: str, db: AsyncSession = Depends(get_db)):
    graph_repo = GraphRepository(db)
    node = await graph_repo.get_node(project_id, node_id)

    if not node:
        return {"error": "节点不存在"}

    quality_score = calculate_quality(node)

    await graph_repo.update_node(project_id, node_id, {"quality_score": quality_score})

    await connection_manager.broadcast(project_id, WSEventType.NODE_QUALITY_SCORE.value, {
        "node_id": node_id,
        "score": quality_score,
        "details": get_quality_details(node, quality_score),
    })

    return {"node_id": node_id, "quality_score": quality_score}


@router.post("/projects/{project_id}/quality-check")
async def check_project_quality(project_id: str, db: AsyncSession = Depends(get_db)):
    graph_repo = GraphRepository(db)
    nodes = await graph_repo.get_nodes(project_id)

    results = []
    for node in nodes:
        score = calculate_quality(node)
        await graph_repo.update_node(project_id, node.node_id, {"quality_score": score})
        results.append({
            "node_id": node.node_id,
            "node_type": node.node_type,
            "quality_score": score,
        })

    avg_score = sum(r["quality_score"] for r in results) / len(results) if results else 0

    return {
        "project_id": project_id,
        "average_score": avg_score,
        "node_results": results,
    }


def calculate_quality(node) -> float:
    score = 0.7

    if node.node_type == "character":
        metadata = node.metadata_
        if metadata.get("description"):
            score += 0.1
        if metadata.get("personality"):
            score += 0.05
        if metadata.get("reference_images"):
            score += 0.05

    elif node.node_type == "scene":
        metadata = node.metadata_
        if metadata.get("location"):
            score += 0.1
        if metadata.get("atmosphere"):
            score += 0.1

    elif node.node_type == "storyboard":
        metadata = node.metadata_
        shots = metadata.get("shots", [])
        if len(shots) >= 3:
            score += 0.15
        elif len(shots) >= 1:
            score += 0.05

    elif node.node_type in ["image", "video"]:
        metadata = node.metadata_
        if metadata.get("asset_url"):
            score += 0.2

    return min(score, 1.0)


def get_quality_details(node, score: float) -> dict:
    details = {
        "overall": score,
        "factors": [],
    }

    if score >= 0.9:
        details["level"] = "excellent"
    elif score >= 0.7:
        details["level"] = "good"
    elif score >= 0.5:
        details["level"] = "fair"
    else:
        details["level"] = "poor"

    return details