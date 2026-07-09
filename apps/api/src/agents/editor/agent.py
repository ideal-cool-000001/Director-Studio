from typing import Dict, Any, List

from src.agents.base_agent import BaseAgent, AgentResult


class EditorAgent(BaseAgent):
    agent_type: str = "editor"
    description: str = "剪辑Agent：视频剪辑、调色和特效"

    async def execute(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        action = context.get("action", "edit")

        if action == "edit":
            return await self._edit_video(context)
        elif action == "color_correction":
            return await self._color_correction(context)
        elif action == "style_transfer":
            return await self._style_transfer(context)
        elif action == "export":
            return await self._export_video(context)
        else:
            return AgentResult(
                success=False,
                error=f"未知操作: {action}",
            )

    async def _edit_video(self, context: Dict[str, Any]) -> AgentResult:
        try:
            video_tracks = context.get("video_tracks", [])
            audio_tracks = context.get("audio_tracks", [])
            timeline = context.get("timeline", {})

            result = {
                "asset_url": f"/api/assets/{node_id}/edited.mp4",
                "duration": timeline.get("duration", 60),
                "timeline": timeline,
                "estimated_cost": 1.0,
            }

            return AgentResult(
                success=True,
                data=result,
                cost=1.0,
                model_used="ffmpeg",
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _color_correction(self, context: Dict[str, Any]) -> AgentResult:
        try:
            video_url = context.get("video_url", "")
            color_params = context.get("color_params", {})

            result = {
                "asset_url": f"/api/assets/{node_id}/color_corrected.mp4",
                "color_params": color_params,
                "estimated_cost": 0.5,
            }

            return AgentResult(
                success=True,
                data=result,
                cost=0.5,
                model_used="ffmpeg_color",
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _style_transfer(self, context: Dict[str, Any]) -> AgentResult:
        try:
            video_url = context.get("video_url", "")
            style_preset = context.get("style_preset", "cinematic")
            strength = context.get("strength", 0.5)

            result = {
                "asset_url": f"/api/assets/{node_id}/styled.mp4",
                "style_preset": style_preset,
                "strength": strength,
                "estimated_cost": 2.0,
            }

            return AgentResult(
                success=True,
                data=result,
                cost=2.0,
                model_used="style_transfer",
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _export_video(self, context: Dict[str, Any]) -> AgentResult:
        try:
            video_url = context.get("video_url", "")
            format = context.get("format", "mp4")
            resolution = context.get("resolution", {"width": 1920, "height": 1080})

            result = {
                "asset_url": f"/api/assets/{node_id}/export.{format}",
                "format": format,
                "resolution": resolution,
                "estimated_cost": 0.5,
            }

            return AgentResult(
                success=True,
                data=result,
                cost=0.5,
                model_used="ffmpeg_export",
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        errors = []

        action = data.get("action")
        valid_actions = ["edit", "color_correction", "style_transfer", "export"]
        if action not in valid_actions:
            errors.append(f"无效的 action: {action}")

        if action in ["color_correction", "style_transfer", "export"]:
            if "video_url" not in data:
                errors.append("缺少 video_url")

        if errors:
            return {"valid": False, "errors": errors}
        return {"valid": True}