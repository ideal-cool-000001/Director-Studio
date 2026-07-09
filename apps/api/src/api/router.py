# ═══════════════════════════════════════════
# 全局路由注册
# ═══════════════════════════════════════════

from fastapi import APIRouter

from src.api.v1 import projects, graph, agents, ws, export, quality, promotion, settings

api_router = APIRouter()

# V1 路由
v1 = APIRouter(prefix="/v1")
v1.include_router(projects.router, prefix="/projects", tags=["projects"])
v1.include_router(graph.router, prefix="/projects/{project_id}", tags=["graph"])
v1.include_router(agents.router, prefix="/projects/{project_id}", tags=["agents"])
v1.include_router(export.router, prefix="/projects/{project_id}", tags=["export"])
v1.include_router(quality.router, prefix="/projects/{project_id}", tags=["quality"])
v1.include_router(promotion.router, prefix="", tags=["promotion"])
v1.include_router(settings.router, prefix="/settings", tags=["settings"])
v1.include_router(ws.router, tags=["websocket"])

api_router.include_router(v1)
