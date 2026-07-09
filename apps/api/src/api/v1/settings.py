from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any

from src.db.session import get_db
from src.db.repositories.ai_service_config_repo import AIServiceConfigRepository
from src.utils.crypto import encrypt_api_key, decrypt_api_key

router = APIRouter()


class AIServiceConfigRequest(BaseModel):
    service_type: str
    provider: str
    base_url: str
    model_name: Optional[str] = None
    api_key: Optional[str] = None
    enabled: bool = False
    extra_config: Optional[Dict[str, Any]] = None


class AIServiceConfigResponse(BaseModel):
    id: str
    service_type: str
    provider: str
    base_url: str
    model_name: Optional[str] = None
    api_key_set: bool = False
    enabled: bool
    extra_config: Dict[str, Any]
    created_at: str
    updated_at: str


class TestConnectionRequest(BaseModel):
    service_type: str
    provider: str


@router.get("/ai-services", response_model=List[AIServiceConfigResponse])
async def list_ai_service_configs(service_type: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    repo = AIServiceConfigRepository(db)
    if service_type:
        configs = await repo.list_by_service_type(service_type)
    else:
        configs = await repo.list_all()

    return [
        AIServiceConfigResponse(
            id=c.id,
            service_type=c.service_type,
            provider=c.provider,
            base_url=c.base_url,
            model_name=c.model_name,
            api_key_set=bool(c.api_key_encrypted),
            enabled=c.enabled,
            extra_config=c.extra_config,
            created_at=c.created_at.isoformat(),
            updated_at=c.updated_at.isoformat(),
        )
        for c in configs
    ]


@router.get("/ai-services/{config_id}", response_model=AIServiceConfigResponse)
async def get_ai_service_config(config_id: str, db: AsyncSession = Depends(get_db)):
    repo = AIServiceConfigRepository(db)
    config = await repo.get(config_id)
    if not config:
        raise HTTPException(status_code=404, detail="配置不存在")

    return AIServiceConfigResponse(
        id=config.id,
        service_type=config.service_type,
        provider=config.provider,
        base_url=config.base_url,
        model_name=config.model_name,
        api_key_set=bool(config.api_key_encrypted),
        enabled=config.enabled,
        extra_config=config.extra_config,
        created_at=config.created_at.isoformat(),
        updated_at=config.updated_at.isoformat(),
    )


@router.post("/ai-services", response_model=AIServiceConfigResponse)
async def create_ai_service_config(req: AIServiceConfigRequest, db: AsyncSession = Depends(get_db)):
    repo = AIServiceConfigRepository(db)

    existing = await repo.get_by_provider(req.service_type, req.provider)
    if existing:
        raise HTTPException(status_code=400, detail=f"{req.provider} 配置已存在")

    data = req.dict()
    if req.api_key:
        data["api_key_encrypted"] = encrypt_api_key(req.api_key)
    else:
        data["api_key_encrypted"] = None
    data.pop("api_key", None)
    if not data.get("extra_config"):
        data["extra_config"] = {}

    config = await repo.create(data)
    await db.commit()

    return AIServiceConfigResponse(
        id=config.id,
        service_type=config.service_type,
        provider=config.provider,
        base_url=config.base_url,
        model_name=config.model_name,
        api_key_set=bool(config.api_key_encrypted),
        enabled=config.enabled,
        extra_config=config.extra_config,
        created_at=config.created_at.isoformat(),
        updated_at=config.updated_at.isoformat(),
    )


@router.put("/ai-services/{config_id}", response_model=AIServiceConfigResponse)
async def update_ai_service_config(config_id: str, req: AIServiceConfigRequest, db: AsyncSession = Depends(get_db)):
    repo = AIServiceConfigRepository(db)

    data = req.dict(exclude_unset=True)
    if "api_key" in data:
        if data["api_key"]:
            data["api_key_encrypted"] = encrypt_api_key(data["api_key"])
        else:
            data["api_key_encrypted"] = None
        data.pop("api_key")

    config = await repo.update(config_id, data)
    if not config:
        raise HTTPException(status_code=404, detail="配置不存在")

    await db.commit()

    return AIServiceConfigResponse(
        id=config.id,
        service_type=config.service_type,
        provider=config.provider,
        base_url=config.base_url,
        model_name=config.model_name,
        api_key_set=bool(config.api_key_encrypted),
        enabled=config.enabled,
        extra_config=config.extra_config,
        created_at=config.created_at.isoformat(),
        updated_at=config.updated_at.isoformat(),
    )


@router.delete("/ai-services/{config_id}")
async def delete_ai_service_config(config_id: str, db: AsyncSession = Depends(get_db)):
    repo = AIServiceConfigRepository(db)
    success = await repo.delete(config_id)
    if not success:
        raise HTTPException(status_code=404, detail="配置不存在")

    await db.commit()
    return {"message": "删除成功"}


@router.post("/ai-services/{config_id}/toggle")
async def toggle_ai_service(config_id: str, enabled: bool, db: AsyncSession = Depends(get_db)):
    repo = AIServiceConfigRepository(db)
    config = await repo.toggle_enabled(config_id, enabled)
    if not config:
        raise HTTPException(status_code=404, detail="配置不存在")

    await db.commit()
    return {"message": f"已{'启用' if enabled else '禁用'}", "enabled": enabled}


@router.post("/ai-services/test-connection")
async def test_connection(req: TestConnectionRequest, db: AsyncSession = Depends(get_db)):
    repo = AIServiceConfigRepository(db)
    config = await repo.get_by_provider(req.service_type, req.provider)

    if not config:
        raise HTTPException(status_code=404, detail="配置不存在")

    if not config.enabled:
        return {"success": False, "message": "服务未启用"}

    if not config.api_key_encrypted:
        return {"success": False, "message": "未配置 API 密钥"}

    try:
        import httpx

        api_key = decrypt_api_key(config.api_key_encrypted)
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.head(config.base_url, headers={"Authorization": f"Bearer {api_key}"})
            if response.status_code in (200, 401):
                return {"success": True, "message": "连接成功"}
            else:
                return {"success": False, "message": f"连接失败: {response.status_code}"}
    except Exception as e:
        return {"success": False, "message": f"连接异常: {str(e)}"}