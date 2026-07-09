from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.session import get_db
from src.db.repositories.graph_repo import GraphRepository
from src.services.publisher import publisher
from src.services.template_manager import template_manager

router = APIRouter()


@router.post("/projects/{project_id}/promotion/generate")
async def generate_promotion(project_id: str, platform: str = "all", db: AsyncSession = Depends(get_db)):
    graph_repo = GraphRepository(db)
    nodes = await graph_repo.get_nodes(project_id)

    video_nodes = [n for n in nodes if n.node_type == "video"]
    image_nodes = [n for n in nodes if n.node_type == "image"]

    platforms = ["douyin", "kuaishou", "bilibili", "xiaohongshu"]
    if platform != "all":
        if platform not in platforms:
            raise HTTPException(status_code=400, detail=f"不支持的平台: {platform}")
        platforms = [platform]

    promo_contents = []
    for plat in platforms:
        for i, video in enumerate(video_nodes[:3]):
            video_url = video.metadata_.get("asset_url", "")
            if not video_url:
                continue

            promo_contents.append({
                "platform": plat,
                "title": generate_title(video, i),
                "description": generate_description(video),
                "video_url": video_url,
                "duration": get_promo_duration(plat),
                "hashtags": generate_hashtags(video),
            })

    return {
        "project_id": project_id,
        "platforms": platforms,
        "total_count": len(promo_contents),
        "contents": promo_contents,
    }


@router.post("/projects/{project_id}/promotion/publish")
async def publish_promotion(project_id: str, platform: str, video_path: str, metadata: dict, db: AsyncSession = Depends(get_db)):
    graph_repo = GraphRepository(db)
    nodes = await graph_repo.get_nodes(project_id)

    video_nodes = [n for n in nodes if n.node_type == "video"]
    if not video_nodes:
        raise HTTPException(status_code=400, detail="项目中没有可发布的视频")

    result = await publisher.publish(platform, video_path, metadata)

    return {
        "project_id": project_id,
        "platform": platform,
        **result,
    }


@router.post("/projects/{project_id}/promotion/batch-publish")
async def batch_publish_promotion(project_id: str, video_path: str, metadata: dict, platforms: list = None, db: AsyncSession = Depends(get_db)):
    graph_repo = GraphRepository(db)
    nodes = await graph_repo.get_nodes(project_id)

    video_nodes = [n for n in nodes if n.node_type == "video"]
    if not video_nodes:
        raise HTTPException(status_code=400, detail="项目中没有可发布的视频")

    target_platforms = platforms or ["douyin", "kuaishou", "bilibili", "xiaohongshu"]

    result = await publisher.batch_publish(video_path, metadata, target_platforms)

    return {
        "project_id": project_id,
        **result,
    }


@router.post("/projects/{project_id}/promotion/batch-export")
async def batch_export_promotion(project_id: str, platform: str = "all"):
    platforms = ["douyin", "kuaishou", "bilibili", "xiaohongshu"]
    if platform != "all":
        platforms = [platform]

    return {
        "project_id": project_id,
        "platforms": platforms,
        "status": "queued",
        "message": "批量导出任务已创建，处理完成后将通过 WebSocket 推送",
    }


@router.get("/templates")
async def list_templates(category: str = "all"):
    return template_manager.get_templates_by_category(category)


@router.get("/templates/{template_id}")
async def get_template(template_id: str):
    template = template_manager.get_template_by_id(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")

    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "category": template.category,
        "nodes": template.nodes,
        "edges": template.edges,
        "config": template.config,
    }


@router.post("/templates/{template_id}/apply/{project_id}")
async def apply_template(template_id: str, project_id: str, db: AsyncSession = Depends(get_db)):
    result = template_manager.apply_template(project_id, template_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    graph_repo = GraphRepository(db)

    for node_data in result["data"]["nodes"]:
        await graph_repo.create_node({
            "project_id": project_id,
            "node_id": node_data["id"],
            "node_type": node_data["type"],
            "position_x": node_data["position"]["x"],
            "position_y": node_data["position"]["y"],
            "metadata_": {
                "label": node_data["label"],
                "node_type": node_data["type"],
                "status": "draft",
            },
        })

    for edge_data in result["data"]["edges"]:
        await graph_repo.create_edge({
            "project_id": project_id,
            "edge_id": f"{edge_data['source']}-{edge_data['target']}",
            "source_node_id": edge_data["source"],
            "target_node_id": edge_data["target"],
            "edge_type": "strong_dependency",
        })

    await db.commit()

    return {"success": True, "message": "模板已应用"}


@router.get("/templates/recommend")
async def recommend_templates(project_type: str = None, duration: int = None):
    return template_manager.recommend_templates(project_type, duration)


def generate_title(video, index: int) -> str:
    templates = [
        "🔥 精彩片段抢先看！",
        "🎬 不容错过的精彩瞬间",
        "💥 高能时刻来袭！",
        "🌟 最新剧情曝光！",
        "✨ 震撼来袭！",
    ]
    return templates[index % len(templates)]


def generate_description(video) -> str:
    return "关注我，获取更多精彩内容！点赞支持一下吧~"


def get_promo_duration(platform: str) -> int:
    durations = {
        "douyin": 15,
        "kuaishou": 15,
        "bilibili": 60,
        "xiaohongshu": 30,
        "youtube": 120,
        "tiktok": 15,
    }
    return durations.get(platform, 15)


def generate_hashtags(video) -> list[str]:
    return ["#精彩视频", "#AI创作", "#影视推荐", "#短剧", "#热门"]