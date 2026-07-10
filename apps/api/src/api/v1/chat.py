from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any, List

from src.db.session import get_db
from src.services.llm_service import llm_service
from src.agents.registry import AgentRegistry

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    agents: List[str] = []
    project_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ChatStreamRequest(BaseModel):
    message: str
    agents: List[str] = []
    project_id: Optional[str] = None
    model: str = "gpt-4o"
    provider: str = "openai"


@router.post("/chat")
async def chat(req: ChatRequest):
    try:
        system_prompt = "你是一个专业的 AI 创作助手，帮助用户进行剧本创作、角色设计、场景构建等影视创作工作。"

        if req.agents:
            agent_descriptions = []
            for agent_id in req.agents:
                try:
                    agent = AgentRegistry.create(agent_id)
                    agent_descriptions.append(f"{agent.agent_type}: {agent.description}")
                except ValueError:
                    pass
            if agent_descriptions:
                system_prompt += "\n\n当前激活的专家团队：\n" + "\n".join(agent_descriptions)

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": req.message},
        ]

        result = await llm_service.chat_completion(
            messages=messages,
            model="gpt-4o",
            provider="openai",
        )

        return {
            "response": result.get("content", ""),
            "usage": result.get("usage", {}),
            "cost": result.get("estimated_cost", 0),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/stream")
async def chat_stream(req: ChatStreamRequest):
    try:
        system_prompt = "你是一个专业的 AI 创作助手，帮助用户进行剧本创作、角色设计、场景构建等影视创作工作。"

        if req.agents:
            agent_descriptions = []
            for agent_id in req.agents:
                try:
                    agent = AgentRegistry.create(agent_id)
                    agent_descriptions.append(f"{agent.agent_type}: {agent.description}")
                except ValueError:
                    pass
            if agent_descriptions:
                system_prompt += "\n\n当前激活的专家团队：\n" + "\n".join(agent_descriptions)

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": req.message},
        ]

        async def stream_generator():
            async for chunk in llm_service.chat_completion_stream(
                messages=messages,
                model=req.model,
                provider=req.provider,
            ):
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/models")
async def get_available_models(provider: Optional[str] = None):
    if provider:
        return {"provider": provider, "models": await llm_service.get_available_models(provider)}
    all_models = {}
    for p in llm_service.PROVIDERS:
        all_models[p] = await llm_service.get_available_models(p)
    return all_models