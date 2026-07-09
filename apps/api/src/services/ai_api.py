import asyncio
import json
import logging
import base64
import hashlib
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod

import httpx

from src.config.settings import settings
from src.utils.crypto import decrypt_api_key

logger = logging.getLogger(__name__)


_config_cache: Dict[str, Dict[str, Any]] = {}
_cache_ttl = 60
_cache_timestamps: Dict[str, float] = {}


class BaseAIService(ABC):
    @abstractmethod
    async def generate(self, **kwargs) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_cost(self, **kwargs) -> float:
        pass

    async def _get_provider_config(self, service_type: str, provider: str) -> Optional[Dict[str, Any]]:
        cache_key = f"{service_type}-{provider}"
        now = asyncio.get_event_loop().time()

        if cache_key in _config_cache and (now - _cache_timestamps.get(cache_key, 0)) < _cache_ttl:
            return _config_cache[cache_key]

        try:
            from src.db.session import async_session
            from src.db.repositories.ai_service_config_repo import AIServiceConfigRepository

            async with async_session() as session:
                repo = AIServiceConfigRepository(session)
                config = await repo.get_by_provider(service_type, provider)
                if config and config.enabled:
                    result = {
                        "base_url": config.base_url,
                        "model_name": config.model_name,
                        "api_key": decrypt_api_key(config.api_key_encrypted),
                        "extra_config": config.extra_config,
                    }
                    _config_cache[cache_key] = result
                    _cache_timestamps[cache_key] = now
                    return result
                return None
        except Exception as e:
            logger.error(f"Failed to get provider config: {e}")
            return None


class ImageService(BaseAIService):
    PROVIDERS = ["flux2", "dalle3", "stable_diffusion", "midjourney"]

    async def generate(self, prompt: str, negative_prompt: str = "", model: str = "flux2",
                       resolution: Dict[str, int] = None, **kwargs) -> Dict[str, Any]:
        resolution = resolution or {"width": 1024, "height": 1024}

        if settings.use_mock_ai:
            return self._mock_generate(prompt, model, resolution)

        config = await self._get_provider_config("image", model)
        if not config:
            logger.info(f"Provider {model} not configured or disabled, falling back to mock")
            return self._mock_generate(prompt, model, resolution)

        try:
            if model == "flux2":
                return await self._generate_flux2(prompt, negative_prompt, resolution, config)
            elif model == "dalle3":
                return await self._generate_dalle3(prompt, resolution, config)
            elif model == "stable_diffusion":
                return await self._generate_sd(prompt, negative_prompt, resolution, config)
            elif model == "midjourney":
                return await self._generate_midjourney(prompt, resolution, config)
            else:
                return await self._mock_generate(prompt, model, resolution)
        except Exception as e:
            logger.error(f"Image generation failed with {model}: {e}")
            return self._mock_generate(prompt, model, resolution)

    def _mock_generate(self, prompt: str, model: str, resolution: Dict[str, int]) -> Dict[str, Any]:
        image_hash = hashlib.md5(prompt.encode()).hexdigest()[:8]
        return {
            "success": True,
            "asset_url": f"/api/assets/mock/image_{image_hash}.png",
            "thumbnail_url": f"/api/assets/mock/image_{image_hash}_thumb.png",
            "generation_params": {
                "model": model,
                "prompt": prompt,
                "resolution": resolution,
                "seed": 42,
                "steps": 30,
            },
            "estimated_cost": self.get_cost(model=model, resolution=resolution),
        }

    async def _generate_flux2(self, prompt: str, negative_prompt: str, resolution: Dict[str, int], config: Dict[str, Any]) -> Dict[str, Any]:
        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate(prompt, "flux2", resolution)

        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": resolution["width"],
            "height": resolution["height"],
            "seed": -1,
            "steps": 30,
        }

        async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
            response = await client.post(
                "/v2/image/generate",
                headers={"Authorization": f"Bearer {api_key}"},
                json=payload,
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "asset_url": data.get("url", ""),
                    "thumbnail_url": data.get("url", ""),
                    "generation_params": payload,
                    "estimated_cost": self.get_cost(model="flux2", resolution=resolution),
                }
        return self._mock_generate(prompt, "flux2", resolution)

    async def _generate_dalle3(self, prompt: str, resolution: Dict[str, int], config: Dict[str, Any]) -> Dict[str, Any]:
        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate(prompt, "dalle3", resolution)

        async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
            response = await client.post(
                "/v1/images/generations",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": config.get("model_name", "dall-e-3"),
                    "prompt": prompt,
                    "n": 1,
                    "size": f"{resolution['width']}x{resolution['height']}",
                },
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "asset_url": data["data"][0]["url"],
                    "thumbnail_url": data["data"][0]["url"],
                    "generation_params": {"model": "dall-e-3", "prompt": prompt},
                    "estimated_cost": self.get_cost(model="dalle3", resolution=resolution),
                }
        return self._mock_generate(prompt, "dalle3", resolution)

    async def _generate_sd(self, prompt: str, negative_prompt: str, resolution: Dict[str, int], config: Dict[str, Any]) -> Dict[str, Any]:
        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate(prompt, "stable_diffusion", resolution)

        async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
            response = await client.post(
                "/v2beta/stable-image/generate/core",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "prompt": prompt,
                    "negative_prompt": negative_prompt,
                    "width": resolution["width"],
                    "height": resolution["height"],
                },
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "asset_url": data.get("artifact", {}).get("url", ""),
                    "generation_params": {"model": "stable_diffusion", "prompt": prompt},
                    "estimated_cost": self.get_cost(model="stable_diffusion", resolution=resolution),
                }
        return self._mock_generate(prompt, "stable_diffusion", resolution)

    async def _generate_midjourney(self, prompt: str, resolution: Dict[str, int], config: Dict[str, Any]) -> Dict[str, Any]:
        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate(prompt, "midjourney", resolution)

        async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
            response = await client.post(
                "/api/v1/generate",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "prompt": prompt,
                    "width": resolution["width"],
                    "height": resolution["height"],
                },
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "asset_url": data.get("url", ""),
                    "generation_params": {"model": "midjourney", "prompt": prompt},
                    "estimated_cost": self.get_cost(model="midjourney", resolution=resolution),
                }
        return self._mock_generate(prompt, "midjourney", resolution)

    def get_cost(self, model: str = "flux2", resolution: Dict[str, int] = None) -> float:
        resolution = resolution or {"width": 1024, "height": 1024}
        base_costs = {
            "flux2": 0.5,
            "dalle3": 1.0,
            "stable_diffusion": 0.2,
            "midjourney": 0.8,
        }

        base_cost = base_costs.get(model, 0.5)
        resolution_factor = (resolution["width"] * resolution["height"]) / (1024 * 1024)
        return base_cost * resolution_factor


class VideoService(BaseAIService):
    PROVIDERS = ["kling3", "seedance", "runway", "pika"]

    async def generate(self, prompt: str, negative_prompt: str = "", model: str = "kling3",
                       duration: int = 5, **kwargs) -> Dict[str, Any]:
        if settings.use_mock_ai:
            return self._mock_generate(prompt, model, duration)

        config = await self._get_provider_config("video", model)
        if not config:
            logger.info(f"Provider {model} not configured or disabled, falling back to mock")
            return self._mock_generate(prompt, model, duration)

        try:
            if model == "kling3":
                return await self._generate_kling3(prompt, negative_prompt, duration, config)
            elif model == "seedance":
                return await self._generate_seedance(prompt, duration, config)
            elif model == "runway":
                return await self._generate_runway(prompt, duration, config)
            elif model == "pika":
                return await self._generate_pika(prompt, duration, config)
            else:
                return await self._mock_generate(prompt, model, duration)
        except Exception as e:
            logger.error(f"Video generation failed with {model}: {e}")
            return self._mock_generate(prompt, model, duration)

    def _mock_generate(self, prompt: str, model: str, duration: int) -> Dict[str, Any]:
        video_hash = hashlib.md5(prompt.encode()).hexdigest()[:8]
        return {
            "success": True,
            "asset_url": f"/api/assets/mock/video_{video_hash}.mp4",
            "thumbnail_url": f"/api/assets/mock/video_{video_hash}_thumb.png",
            "generation_params": {
                "model": model,
                "prompt": prompt,
                "duration": duration,
                "fps": 24,
            },
            "estimated_cost": self.get_cost(model=model, duration=duration),
        }

    async def _generate_kling3(self, prompt: str, negative_prompt: str, duration: int, config: Dict[str, Any]) -> Dict[str, Any]:
        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate(prompt, "kling3", duration)

        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "duration": duration,
            "fps": 24,
            "ratio": "16:9",
        }

        async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
            response = await client.post(
                "/v1/video/generate",
                headers={"Authorization": f"Bearer {api_key}"},
                json=payload,
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "asset_url": data.get("video_url", ""),
                    "thumbnail_url": data.get("thumbnail_url", ""),
                    "generation_params": payload,
                    "estimated_cost": self.get_cost(model="kling3", duration=duration),
                }
        return self._mock_generate(prompt, "kling3", duration)

    async def _generate_seedance(self, prompt: str, duration: int, config: Dict[str, Any]) -> Dict[str, Any]:
        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate(prompt, "seedance", duration)

        async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
            response = await client.post(
                "/api/v1/generate",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"prompt": prompt, "duration": duration},
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "asset_url": data.get("result", {}).get("url", ""),
                    "generation_params": {"model": "seedance", "prompt": prompt},
                    "estimated_cost": self.get_cost(model="seedance", duration=duration),
                }
        return self._mock_generate(prompt, "seedance", duration)

    async def _generate_runway(self, prompt: str, duration: int, config: Dict[str, Any]) -> Dict[str, Any]:
        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate(prompt, "runway", duration)

        async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
            response = await client.post(
                "/v2/video/generate",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"prompt": prompt, "duration": duration},
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "asset_url": data.get("url", ""),
                    "generation_params": {"model": "runway", "prompt": prompt},
                    "estimated_cost": self.get_cost(model="runway", duration=duration),
                }
        return self._mock_generate(prompt, "runway", duration)

    async def _generate_pika(self, prompt: str, duration: int, config: Dict[str, Any]) -> Dict[str, Any]:
        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate(prompt, "pika", duration)

        async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
            response = await client.post(
                "/api/generate",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"prompt": prompt, "duration": duration},
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "asset_url": data.get("video_url", ""),
                    "generation_params": {"model": "pika", "prompt": prompt},
                    "estimated_cost": self.get_cost(model="pika", duration=duration),
                }
        return self._mock_generate(prompt, "pika", duration)

    def get_cost(self, model: str = "kling3", duration: int = 5) -> float:
        base_costs = {
            "kling3": 2.0,
            "seedance": 1.5,
            "runway": 3.0,
            "pika": 2.5,
        }
        return base_costs.get(model, 2.0) * duration


class AudioService(BaseAIService):
    PROVIDERS = ["volcengine", "aliyun", "baidu", "openai", "stable_audio"]

    async def generate_tts(self, text: str, voice: str = "default", emotion: str = "neutral",
                           speed: float = 1.0, **kwargs) -> Dict[str, Any]:
        if settings.use_mock_ai:
            return self._mock_generate_tts(text, voice, emotion, speed)

        provider = "openai"
        if voice.startswith("volc") or "volcengine" in voice.lower():
            provider = "volcengine"
        elif voice.startswith("ali") or "aliyun" in voice.lower():
            provider = "aliyun"
        elif voice.startswith("baidu"):
            provider = "baidu"

        config = await self._get_provider_config("audio", provider)
        if not config:
            logger.info(f"Provider {provider} not configured or disabled, falling back to mock")
            return self._mock_generate_tts(text, voice, emotion, speed)

        try:
            if provider == "volcengine":
                return await self._generate_volc_tts(text, voice, emotion, speed, config)
            elif provider == "aliyun":
                return await self._generate_ali_tts(text, voice, emotion, speed, config)
            elif provider == "baidu":
                return await self._generate_baidu_tts(text, voice, emotion, speed, config)
            else:
                return await self._generate_openai_tts(text, voice, emotion, speed, config)
        except Exception as e:
            logger.error(f"TTS generation failed: {e}")
            return self._mock_generate_tts(text, voice, emotion, speed)

    def _mock_generate_tts(self, text: str, voice: str, emotion: str, speed: float) -> Dict[str, Any]:
        audio_hash = hashlib.md5(text.encode()).hexdigest()[:8]
        return {
            "success": True,
            "asset_url": f"/api/assets/mock/tts_{audio_hash}.wav",
            "duration": len(text) / 3 * speed,
            "audio_type": "tts_dialogue",
            "generation_params": {
                "text": text,
                "voice": voice,
                "emotion": emotion,
                "speed": speed,
            },
            "estimated_cost": self.get_cost(text_length=len(text)),
        }

    async def _generate_volc_tts(self, text: str, voice: str, emotion: str, speed: float, config: Dict[str, Any]) -> Dict[str, Any]:
        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate_tts(text, voice, emotion, speed)

        async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
            response = await client.post(
                "/api/text/speech",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "Text": text,
                    "VoiceType": voice,
                    "Emotion": emotion,
                    "SpeechRate": speed,
                },
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "asset_url": data.get("Audio", ""),
                    "generation_params": {"text": text, "voice": voice},
                    "estimated_cost": self.get_cost(text_length=len(text)),
                }
        return self._mock_generate_tts(text, voice, emotion, speed)

    async def _generate_ali_tts(self, text: str, voice: str, emotion: str, speed: float, config: Dict[str, Any]) -> Dict[str, Any]:
        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate_tts(text, voice, emotion, speed)

        async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
            response = await client.post(
                "/stream/v1/tts",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"text": text, "voice": voice, "rate": speed},
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "asset_url": data.get("audio", ""),
                    "generation_params": {"text": text, "voice": voice},
                    "estimated_cost": self.get_cost(text_length=len(text)),
                }
        return self._mock_generate_tts(text, voice, emotion, speed)

    async def _generate_baidu_tts(self, text: str, voice: str, emotion: str, speed: float, config: Dict[str, Any]) -> Dict[str, Any]:
        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate_tts(text, voice, emotion, speed)

        async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
            response = await client.post(
                "/api/text2audio",
                headers={"Content-Type": "application/json"},
                json={"text": text, "per": voice, "spd": speed},
            )

            if response.status_code == 200:
                audio_base64 = base64.b64encode(response.content).decode()
                return {
                    "success": True,
                    "asset_url": f"data:audio/wav;base64,{audio_base64}",
                    "generation_params": {"text": text, "voice": voice},
                    "estimated_cost": self.get_cost(text_length=len(text)),
                }
        return self._mock_generate_tts(text, voice, emotion, speed)

    async def _generate_openai_tts(self, text: str, voice: str, emotion: str, speed: float, config: Dict[str, Any]) -> Dict[str, Any]:
        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate_tts(text, voice, emotion, speed)

        async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
            response = await client.post(
                "/v1/audio/speech",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": config.get("model_name", "tts-1"),
                    "input": text,
                    "voice": voice if voice in ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] else "alloy",
                },
            )

            if response.status_code == 200:
                audio_base64 = base64.b64encode(response.content).decode()
                return {
                    "success": True,
                    "asset_url": f"data:audio/mp3;base64,{audio_base64}",
                    "generation_params": {"text": text, "voice": voice},
                    "estimated_cost": self.get_cost(text_length=len(text)),
                }
        return self._mock_generate_tts(text, voice, emotion, speed)

    async def generate_bgm(self, mood: str = "neutral", duration: int = 60, genre: str = "ambient") -> Dict[str, Any]:
        if settings.use_mock_ai:
            return self._mock_generate_bgm(mood, duration, genre)

        config = await self._get_provider_config("bgm", "stable_audio")
        if not config:
            logger.info("BGM provider not configured or disabled, falling back to mock")
            return self._mock_generate_bgm(mood, duration, genre)

        api_key = config.get("api_key")
        if not api_key:
            return self._mock_generate_bgm(mood, duration, genre)

        try:
            async with httpx.AsyncClient(base_url=config["base_url"], timeout=60) as client:
                response = await client.post(
                    "/v2beta/audio/generate",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={"prompt": f"{mood} {genre} music", "duration": duration},
                )

                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "asset_url": data.get("url", ""),
                        "generation_params": {"mood": mood, "duration": duration},
                        "estimated_cost": duration * 0.1,
                    }
        except Exception as e:
            logger.error(f"BGM generation failed: {e}")

        return self._mock_generate_bgm(mood, duration, genre)

    def _mock_generate_bgm(self, mood: str, duration: int, genre: str) -> Dict[str, Any]:
        bgm_hash = hashlib.md5(f"{mood}{genre}".encode()).hexdigest()[:8]
        return {
            "success": True,
            "asset_url": f"/api/assets/mock/bgm_{bgm_hash}.wav",
            "duration": duration,
            "audio_type": "bgm",
            "generation_params": {"mood": mood, "duration": duration, "genre": genre},
            "estimated_cost": duration * 0.1,
        }

    def get_cost(self, text_length: int = 0, duration: int = 0) -> float:
        tts_cost = text_length * 0.001
        bgm_cost = duration * 0.1
        return tts_cost + bgm_cost


image_service = ImageService()
video_service = VideoService()
audio_service = AudioService()