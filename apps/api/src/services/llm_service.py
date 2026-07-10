import asyncio
import logging
from typing import Dict, Any, Optional, AsyncGenerator

import httpx

from src.config.settings import settings
from src.utils.crypto import decrypt_api_key

logger = logging.getLogger(__name__)


class LLMService:
    PROVIDERS = ["openai", "tongyi", "volcengine", "custom"]

    async def chat_completion(
        self,
        messages: list,
        model: str = "gpt-4o",
        provider: str = "openai",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs,
    ) -> Dict[str, Any]:
        if settings.use_mock_ai:
            return self._mock_chat_completion(messages, model)

        config = await self._get_provider_config("llm", provider)
        if not config:
            logger.info(f"LLM provider {provider} not configured or disabled, falling back to mock")
            return self._mock_chat_completion(messages, model)

        try:
            async with httpx.AsyncClient(base_url=config["base_url"], timeout=120) as client:
                payload = {
                    "model": config.get("model_name", model),
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    **kwargs,
                }

                response = await client.post(
                    "/v1/chat/completions",
                    headers={"Authorization": f"Bearer {config['api_key']}"},
                    json=payload,
                )

                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "content": data["choices"][0]["message"]["content"],
                        "usage": data.get("usage", {}),
                        "model": data.get("model", model),
                        "estimated_cost": self._calculate_cost(data.get("usage", {}), model),
                    }
                else:
                    logger.error(f"LLM API error: {response.status_code} - {response.text}")
                    return self._mock_chat_completion(messages, model)
        except Exception as e:
            logger.error(f"LLM request failed: {e}")
            return self._mock_chat_completion(messages, model)

    async def chat_completion_stream(
        self,
        messages: list,
        model: str = "gpt-4o",
        provider: str = "openai",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs,
    ) -> AsyncGenerator[str, None]:
        if settings.use_mock_ai:
            mock_content = self._mock_chat_completion(messages, model)["content"]
            for char in mock_content:
                await asyncio.sleep(0.02)
                yield char
            return

        config = await self._get_provider_config("llm", provider)
        if not config:
            logger.info(f"LLM provider {provider} not configured, falling back to mock")
            mock_content = self._mock_chat_completion(messages, model)["content"]
            for char in mock_content:
                await asyncio.sleep(0.02)
                yield char
            return

        try:
            async with httpx.AsyncClient(base_url=config["base_url"], timeout=120) as client:
                payload = {
                    "model": config.get("model_name", model),
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "stream": True,
                    **kwargs,
                }

                async with client.stream(
                    "POST",
                    "/v1/chat/completions",
                    headers={"Authorization": f"Bearer {config['api_key']}"},
                    json=payload,
                ) as response:
                    if response.status_code != 200:
                        logger.error(f"LLM stream error: {response.status_code}")
                        mock_content = self._mock_chat_completion(messages, model)["content"]
                        for char in mock_content:
                            await asyncio.sleep(0.02)
                            yield char
                        return

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str.strip() == "[DONE]":
                                break
                            try:
                                data = httpx.json.loads(data_str)
                                content = data["choices"][0]["delta"].get("content", "")
                                if content:
                                    yield content
                            except Exception:
                                continue
        except Exception as e:
            logger.error(f"LLM stream request failed: {e}")
            mock_content = self._mock_chat_completion(messages, model)["content"]
            for char in mock_content:
                await asyncio.sleep(0.02)
                yield char

    def _mock_chat_completion(self, messages: list, model: str) -> Dict[str, Any]:
        last_message = messages[-1]["content"] if messages else ""
        
        mock_responses = {
            "story": "好的！我来帮你创作一个精彩的故事。\n\n故事大纲：\n\n第一章：命运的相遇\n在一个普通的清晨，主角林浩踏上了追寻真相的旅程...\n\n第二章：神秘的线索\n古老的神庙中隐藏着解开谜题的关键...\n\n第三章：最终对决\n真相即将揭晓，命运的齿轮开始转动...",
            "script": "剧本生成完成！\n\n【第一幕】\n场景：山间小路 - 清晨\n[薄雾缭绕，阳光透过树叶洒落]\n林浩：（背着行囊，眺望远方）终于到了这里...\n\n【第二幕】\n场景：古老神庙 - 黄昏\n[金色的夕阳映照在古老的石柱上]\n小雪：（缓缓走出）你终于来了...",
            "character": "角色设计完成！\n\n角色：林浩\n年龄：25岁\n性格：勇敢、好奇、固执\n外貌：黑色短发，深邃的棕色眼眸，身着休闲探险装\n背景：来自偏远山村，从小向往外面的世界\n\n角色：小雪\n年龄：23岁\n性格：神秘、冷静、聪慧\n外貌：银色长发，淡蓝色眼眸，身着古风长袍\n背景：守护神庙的后裔",
            "scene": "场景设计完成！\n\n场景：古老神庙\n地点：深山之中\n时间：黄昏\n描述：宏伟的神庙矗立在夕阳之下，金色的光芒透过破损的穹顶洒入，古老的壁画诉说着千年的故事。神庙中央是一座祭坛，上面摆放着发光的水晶球。\n\n适合镜头：全景展示神庙的宏伟，中景拍摄角色互动",
        }

        content = mock_responses.get("story")
        for key in mock_responses:
            if key in last_message.lower():
                content = mock_responses[key]
                break

        return {
            "success": True,
            "content": content,
            "usage": {"prompt_tokens": len(last_message) * 2, "completion_tokens": len(content)},
            "model": model,
            "estimated_cost": 0.01,
        }

    async def _get_provider_config(self, service_type: str, provider: str) -> Optional[Dict[str, Any]]:
        try:
            from src.db.session import async_session
            from src.db.repositories.ai_service_config_repo import AIServiceConfigRepository

            async with async_session() as session:
                repo = AIServiceConfigRepository(session)
                config = await repo.get_by_provider(service_type, provider)
                if config and config.enabled:
                    return {
                        "base_url": config.base_url,
                        "model_name": config.model_name,
                        "api_key": decrypt_api_key(config.api_key_encrypted),
                        "extra_config": config.extra_config,
                    }
                return None
        except Exception as e:
            logger.error(f"Failed to get LLM provider config: {e}")
            return None

    def _calculate_cost(self, usage: Dict[str, Any], model: str) -> float:
        base_costs = {
            "gpt-4o": {"prompt": 0.005, "completion": 0.015},
            "gpt-4o-mini": {"prompt": 0.0015, "completion": 0.006},
            "qwen-turbo": {"prompt": 0.001, "completion": 0.001},
            "qwen-plus": {"prompt": 0.002, "completion": 0.002},
            "ark-turbo": {"prompt": 0.002, "completion": 0.002},
        }

        cost_config = base_costs.get(model.lower(), base_costs["gpt-4o"])
        prompt_tokens = usage.get("prompt_tokens", 0)
        completion_tokens = usage.get("completion_tokens", 0)

        return (prompt_tokens / 1000 * cost_config["prompt"]) + (
            completion_tokens / 1000 * cost_config["completion"]
        )

    async def get_available_models(self, provider: str) -> list:
        model_lists = {
            "openai": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
            "tongyi": ["qwen-turbo", "qwen-plus", "qwen-72b-chat"],
            "volcengine": ["ark-turbo", "ark-plus", "ark-7b"],
            "custom": [],
        }
        return model_lists.get(provider, [])


llm_service = LLMService()