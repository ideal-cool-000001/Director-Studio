# ═══════════════════════════════════════════
# FastAPI 入口 — AI 视频导演 Agent 平台
# ═══════════════════════════════════════════

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config.settings import settings
from src.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时：初始化数据库连接、Redis 连接池
    # await init_db()
    # await init_redis()
    yield
    # 关闭时：清理资源
    # await close_db()
    # await close_redis()


app = FastAPI(
    title="Director Workflow API",
    description="AI 视频导演 Agent 平台 — 后端 API 与 Agent 调度",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由
app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}
