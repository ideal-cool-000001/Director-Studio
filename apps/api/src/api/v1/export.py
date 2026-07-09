from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.session import get_db
from src.db.repositories.graph_repo import GraphRepository
from src.services.format_converter import video_converter, image_converter, audio_converter
from src.ws.manager import connection_manager
from src.ws.events import WSEventType

router = APIRouter()


@router.post("/projects/{project_id}/export")
async def export_project(project_id: str, format: str = "mp4", resolution: str = "1080p", db: AsyncSession = Depends(get_db)):
    graph_repo = GraphRepository(db)
    nodes = await graph_repo.get_nodes(project_id)

    video_nodes = [n for n in nodes if n.node_type == "video"]
    audio_nodes = [n for n in nodes if n.node_type == "audio"]

    if not video_nodes:
        raise HTTPException(status_code=400, detail="项目中没有可导出的视频节点")

    export_data = {
        "project_id": project_id,
        "video_count": len(video_nodes),
        "audio_count": len(audio_nodes),
        "format": format,
        "resolution": resolution,
        "nodes": [
            {
                "node_id": n.node_id,
                "type": n.node_type,
                "metadata": n.metadata_,
            }
            for n in nodes
        ],
    }

    await connection_manager.broadcast(project_id, WSEventType.EXPORT_PROGRESS.value, {
        "export_id": project_id,
        "progress": 30,
        "status": "processing",
    })

    return {"export_id": project_id, "status": "processing", "data": export_data}


@router.post("/projects/{project_id}/export/convert")
async def convert_format(project_id: str, node_id: str, output_format: str, db: AsyncSession = Depends(get_db)):
    graph_repo = GraphRepository(db)
    node = await graph_repo.get_node(project_id, node_id)

    if not node:
        raise HTTPException(status_code=404, detail="节点不存在")

    asset_url = node.metadata_.get("asset_url", "")
    if not asset_url:
        raise HTTPException(status_code=400, detail="节点没有可转换的资产")

    if node.node_type == "video":
        result = await video_converter.convert(asset_url, output_format)
    elif node.node_type == "image":
        result = await image_converter.convert(asset_url, output_format)
    elif node.node_type == "audio":
        result = await audio_converter.convert(asset_url, output_format)
    else:
        raise HTTPException(status_code=400, detail=f"不支持的节点类型: {node.node_type}")

    if result["success"]:
        await graph_repo.update_node(project_id, node_id, {
            "metadata_": {
                **node.metadata_,
                "converted_url": result["output_path"],
                "converted_format": output_format,
            },
        })
        await db.commit()

    return {"node_id": node_id, **result}


@router.get("/projects/{project_id}/export/{export_id}")
async def get_export_status(project_id: str, export_id: str):
    return {
        "export_id": export_id,
        "project_id": project_id,
        "status": "completed",
        "progress": 100,
        "download_url": f"/api/v1/projects/{project_id}/export/{export_id}/download",
    }


@router.get("/projects/{project_id}/export/{export_id}/download")
async def download_export(project_id: str, export_id: str):
    raise HTTPException(status_code=501, detail="导出下载功能待实现")


@router.get("/export/formats/{asset_type}")
async def get_supported_formats(asset_type: str):
    if asset_type == "video":
        return {"formats": video_converter.FORMATS}
    elif asset_type == "image":
        return {"formats": image_converter.FORMATS}
    elif asset_type == "audio":
        return {"formats": audio_converter.FORMATS}
    else:
        raise HTTPException(status_code=400, detail=f"不支持的资产类型: {asset_type}")