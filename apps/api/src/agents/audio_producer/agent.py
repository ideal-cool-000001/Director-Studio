from typing import Dict, Any, List

from src.agents.base_agent import BaseAgent, AgentResult
from src.services.ai_api import audio_service


class AudioProducerAgent(BaseAgent):
    agent_type: str = "audio_producer"
    description: str = "音频制作Agent：生成语音、BGM和音效"

    VOICES = {
        "zh": ["zh_female", "zh_male", "zh_child", "zh_emotional"],
        "en": ["en_female", "en_male", "en_child", "en_robot"],
        "ja": ["ja_female", "ja_male"],
        "ko": ["ko_female", "ko_male"],
    }

    async def execute(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        action = context.get("action", "generate_tts")

        if action == "generate_tts":
            return await self._generate_tts(context)
        elif action == "generate_bgm":
            return await self._generate_bgm(context)
        elif action == "generate_sfx":
            return await self._generate_sfx(context)
        elif action == "mix_audio":
            return await self._mix_audio(context)
        else:
            return AgentResult(
                success=False,
                error=f"未知操作: {action}",
            )

    async def _generate_tts(self, context: Dict[str, Any]) -> AgentResult:
        try:
            text = context.get("text", "")
            character_id = context.get("character_id", "")
            voice = context.get("voice", "zh_female")
            emotion = context.get("emotion", "neutral")
            speed = context.get("speed", 1.0)

            result = await audio_service.generate_tts(
                text=text,
                voice=voice,
                emotion=emotion,
                speed=speed,
            )

            return AgentResult(
                success=result.get("success", True),
                data={
                    "asset_url": result.get("asset_url", ""),
                    "duration": result.get("duration", len(text) / 3 * speed),
                    "audio_type": "tts_dialogue",
                    "character_id": character_id,
                    "generation_params": {
                        **result.get("generation_params", {}),
                        "text": text,
                        "voice": voice,
                        "emotion": emotion,
                        "speed": speed,
                    },
                    "estimated_cost": result.get("estimated_cost", len(text) * 0.001),
                },
                cost=result.get("estimated_cost", len(text) * 0.001),
                model_used=voice,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _generate_bgm(self, context: Dict[str, Any]) -> AgentResult:
        try:
            mood = context.get("mood", "neutral")
            duration = context.get("duration", 60)
            genre = context.get("genre", "ambient")

            result = await audio_service.generate_bgm(
                mood=mood,
                duration=duration,
                genre=genre,
            )

            return AgentResult(
                success=result.get("success", True),
                data={
                    "asset_url": result.get("asset_url", ""),
                    "duration": result.get("duration", duration),
                    "audio_type": "bgm",
                    "generation_params": {
                        **result.get("generation_params", {}),
                        "mood": mood,
                        "duration": duration,
                        "genre": genre,
                    },
                    "estimated_cost": result.get("estimated_cost", duration * 0.1),
                },
                cost=result.get("estimated_cost", duration * 0.1),
                model_used="stable_audio",
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _generate_sfx(self, context: Dict[str, Any]) -> AgentResult:
        try:
            type = context.get("type", "ambient")
            duration = context.get("duration", 5)

            result = {
                "asset_url": f"/api/assets/{node_id}/sfx.wav",
                "duration": duration,
                "audio_type": "sfx",
                "generation_params": {
                    "type": type,
                    "duration": duration,
                },
                "estimated_cost": 0.5,
            }

            return AgentResult(
                success=True,
                data=result,
                cost=0.5,
                model_used="sfx_engine",
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _mix_audio(self, context: Dict[str, Any]) -> AgentResult:
        try:
            tracks = context.get("tracks", [])
            output_format = context.get("format", "mp3")

            result = {
                "asset_url": f"/api/assets/{node_id}/mixed.{output_format}",
                "duration": max(t.get("duration", 0) for t in tracks) if tracks else 60,
                "audio_type": "mixed",
                "tracks": tracks,
                "estimated_cost": 0.1,
            }

            return AgentResult(
                success=True,
                data=result,
                cost=0.1,
                model_used="ffmpeg_mixer",
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        errors = []

        action = data.get("action")
        valid_actions = ["generate_tts", "generate_bgm", "generate_sfx", "mix_audio"]
        if action not in valid_actions:
            errors.append(f"无效的 action: {action}")

        if action == "generate_tts":
            if "text" not in data:
                errors.append("缺少 text")

        if action == "generate_bgm":
            if "mood" not in data:
                errors.append("缺少 mood")

        if action == "generate_sfx":
            if "type" not in data:
                errors.append("缺少 type")

        if action == "mix_audio":
            if "tracks" not in data:
                errors.append("缺少 tracks")

        if errors:
            return {"valid": False, "errors": errors}
        return {"valid": True}