from typing import Dict, Any, List

from src.agents.base_agent import BaseAgent, AgentResult
from .clip_extractor import ClipExtractor, HighlightSegment, PromoContent
from .prompts import (
    PROMOTION_HIGHLIGHT_EXTRACTION_PROMPT,
    PROMOTION_SCRIPT_GENERATION_PROMPT,
    PROMOTION_BATCH_GENERATION_PROMPT,
)


class PromotionAgent(BaseAgent):
    agent_type: str = "promotion"
    description: str = "宣发Agent：制作宣传短视频和文案"

    def __init__(self):
        self.clip_extractor = ClipExtractor()

    async def execute(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        action = context.get("action", "extract_highlights")

        if action == "extract_highlights":
            return await self._extract_highlights(context)
        elif action == "generate_promo_content":
            return await self._generate_promo_content(context)
        elif action == "batch_generate":
            return await self._batch_generate(context)
        else:
            return AgentResult(
                success=False,
                error=f"未知操作: {action}",
            )

    async def _extract_highlights(self, context: Dict[str, Any]) -> AgentResult:
        try:
            video_title = context.get("video_title", "未命名视频")
            duration = context.get("duration", 60)
            synopsis = context.get("synopsis", "")
            key_scenes = context.get("key_scenes", [])

            highlights = self.clip_extractor.extract_highlights(video_title, synopsis, key_scenes)

            highlights_data = [
                {
                    "segment_id": h.segment_id,
                    "start_time": h.start_time,
                    "end_time": h.end_time,
                    "duration": h.duration,
                    "description": h.description,
                    "platform": h.platform,
                    "priority": h.priority,
                }
                for h in highlights
            ]

            prompt = PROMOTION_HIGHLIGHT_EXTRACTION_PROMPT.format(
                video_title=video_title,
                duration=duration,
                synopsis=synopsis,
                key_scenes=key_scenes,
            )

            return AgentResult(
                success=True,
                data={
                    "highlights": highlights_data,
                    "extraction_prompt": prompt,
                    "suggestion": "可以继续调用 generate_promo_content 生成宣发文案",
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _generate_promo_content(self, context: Dict[str, Any]) -> AgentResult:
        try:
            video_title = context.get("video_title", "未命名视频")
            highlight_description = context.get("highlight_description", "")
            platform = context.get("platform", "douyin")
            duration = context.get("duration", 30)

            highlight = HighlightSegment(
                segment_id="promo_segment",
                start_time=0,
                end_time=duration,
                duration=duration,
                description=highlight_description,
                platform=platform,
            )

            promo = self.clip_extractor.generate_promo_content(video_title, highlight)

            promo_data = {
                "platform": promo.platform,
                "title": promo.title,
                "copy": promo.copy,
                "hashtags": promo.hashtags,
                "duration": promo.duration,
                "highlight_segment": {
                    "segment_id": promo.highlight_segment.segment_id,
                    "start_time": promo.highlight_segment.start_time,
                    "end_time": promo.highlight_segment.end_time,
                    "duration": promo.highlight_segment.duration,
                    "description": promo.highlight_segment.description,
                },
            }

            prompt = PROMOTION_SCRIPT_GENERATION_PROMPT.format(
                video_title=video_title,
                highlight_description=highlight_description,
                platform=platform,
                duration=duration,
            )

            return AgentResult(
                success=True,
                data={
                    "promo_content": promo_data,
                    "generation_prompt": prompt,
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _batch_generate(self, context: Dict[str, Any]) -> AgentResult:
        try:
            video_title = context.get("video_title", "未命名视频")
            synopsis = context.get("synopsis", "")
            key_scenes = context.get("key_scenes", [])

            promo_contents = self.clip_extractor.batch_generate(video_title, synopsis, key_scenes)

            promo_data_list = [
                {
                    "platform": pc.platform,
                    "title": pc.title,
                    "copy": pc.copy,
                    "hashtags": pc.hashtags,
                    "duration": pc.duration,
                    "highlight_segment": {
                        "segment_id": pc.highlight_segment.segment_id,
                        "start_time": pc.highlight_segment.start_time,
                        "end_time": pc.highlight_segment.end_time,
                        "duration": pc.highlight_segment.duration,
                        "description": pc.highlight_segment.description,
                    },
                }
                for pc in promo_contents
            ]

            prompt = PROMOTION_BATCH_GENERATION_PROMPT.format(
                video_title=video_title,
                synopsis=synopsis,
                key_scenes=key_scenes,
            )

            return AgentResult(
                success=True,
                data={
                    "promo_contents": promo_data_list,
                    "batch_prompt": prompt,
                    "total_count": len(promo_data_list),
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        errors = []

        action = data.get("action")
        valid_actions = ["extract_highlights", "generate_promo_content", "batch_generate"]
        if action not in valid_actions:
            errors.append(f"无效的 action: {action}")

        if action == "extract_highlights":
            if "video_title" not in data:
                errors.append("缺少 video_title")
            if "key_scenes" not in data:
                errors.append("缺少 key_scenes")

        if action == "generate_promo_content":
            if "video_title" not in data:
                errors.append("缺少 video_title")
            if "highlight_description" not in data:
                errors.append("缺少 highlight_description")

        if action == "batch_generate":
            if "video_title" not in data:
                errors.append("缺少 video_title")
            if "synopsis" not in data:
                errors.append("缺少 synopsis")
            if "key_scenes" not in data:
                errors.append("缺少 key_scenes")

        if errors:
            return {"valid": False, "errors": errors}
        return {"valid": True}