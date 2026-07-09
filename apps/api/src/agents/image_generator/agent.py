import asyncio
from typing import Dict, Any, List

from src.agents.base_agent import BaseAgent, AgentResult
from src.services.ai_api import image_service


class ImageGeneratorAgent(BaseAgent):
    agent_type: str = "image_generator"
    description: str = "图像生成Agent：调用文生图API生成图像"

    async def execute(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        action = context.get("action", "generate")

        if action == "generate":
            return await self._generate_image(context)
        elif action == "batch_generate":
            return await self._batch_generate(context)
        else:
            return AgentResult(
                success=False,
                error=f"未知操作: {action}",
            )

    async def _generate_image(self, context: Dict[str, Any]) -> AgentResult:
        try:
            prompt = context.get("prompt", "")
            negative_prompt = context.get("negative_prompt", "")
            model = context.get("model", "flux2")
            resolution = context.get("resolution", {"width": 1024, "height": 1024})

            result = await image_service.generate(
                prompt=prompt,
                negative_prompt=negative_prompt,
                model=model,
                resolution=resolution,
            )

            return AgentResult(
                success=result.get("success", True),
                data=result,
                cost=result.get("estimated_cost", 0.5),
                model_used=model,
                prompt_used=prompt,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _batch_generate(self, context: Dict[str, Any]) -> AgentResult:
        try:
            prompts = context.get("prompts", [])
            model = context.get("model", "flux2")

            tasks = []
            for prompt_data in prompts:
                task = asyncio.create_task(
                    image_service.generate(
                        prompt=prompt_data.get("positive_prompt", ""),
                        negative_prompt=prompt_data.get("negative_prompt", ""),
                        model=model,
                        resolution={"width": 1024, "height": 1024},
                    )
                )
                tasks.append(task)

            completed = await asyncio.gather(*tasks, return_exceptions=True)

            results = []
            total_cost = 0.0

            for i, result in enumerate(completed):
                if isinstance(result, Exception):
                    results.append({"index": i, "success": False, "error": str(result)})
                else:
                    results.append({
                        "index": i,
                        "asset_url": result.get("asset_url", ""),
                        "thumbnail_url": result.get("thumbnail_url", ""),
                        "generation_params": result.get("generation_params", {}),
                        "estimated_cost": result.get("estimated_cost", 0.5),
                    })
                    total_cost += result.get("estimated_cost", 0.5)

            return AgentResult(
                success=True,
                data={
                    "results": results,
                    "total_count": len(results),
                    "total_cost": total_cost,
                },
                cost=total_cost,
                model_used=model,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        errors = []

        action = data.get("action")
        valid_actions = ["generate", "batch_generate"]
        if action not in valid_actions:
            errors.append(f"无效的 action: {action}")

        if action == "generate":
            if "prompt" not in data:
                errors.append("缺少 prompt")

        if action == "batch_generate":
            if "prompts" not in data:
                errors.append("缺少 prompts")

        if errors:
            return {"valid": False, "errors": errors}
        return {"valid": True}