import asyncio
import logging
from typing import Dict, Any, Optional

import httpx

from src.config.settings import settings

logger = logging.getLogger(__name__)


class PlatformPublisher:
    PLATFORMS = ["douyin", "kuaishou", "bilibili", "xiaohongshu", "youtube", "tiktok"]

    def __init__(self):
        self.clients = {
            "douyin": httpx.AsyncClient(base_url="https://open.douyin.com"),
            "kuaishou": httpx.AsyncClient(base_url="https://open.kuaishou.com"),
            "bilibili": httpx.AsyncClient(base_url="https://api.bilibili.com"),
            "xiaohongshu": httpx.AsyncClient(base_url="https://api.xiaohongshu.com"),
            "youtube": httpx.AsyncClient(base_url="https://www.googleapis.com"),
            "tiktok": httpx.AsyncClient(base_url="https://open-api.tiktok.com"),
        }

    async def publish(self, platform: str, video_path: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        if platform not in self.PLATFORMS:
            return {"success": False, "error": f"不支持的平台: {platform}"}

        try:
            if settings.use_mock_ai:
                return self._mock_publish(platform, video_path, metadata)

            if platform == "douyin":
                return await self._publish_douyin(video_path, metadata)
            elif platform == "kuaishou":
                return await self._publish_kuaishou(video_path, metadata)
            elif platform == "bilibili":
                return await self._publish_bilibili(video_path, metadata)
            elif platform == "xiaohongshu":
                return await self._publish_xiaohongshu(video_path, metadata)
            elif platform == "youtube":
                return await self._publish_youtube(video_path, metadata)
            elif platform == "tiktok":
                return await self._publish_tiktok(video_path, metadata)
            else:
                return self._mock_publish(platform, video_path, metadata)

        except Exception as e:
            logger.error(f"Publish failed for {platform}: {e}")
            return {"success": False, "error": str(e)}

    def _mock_publish(self, platform: str, video_path: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        import hashlib
        video_hash = hashlib.md5(f"{platform}{video_path}".encode()).hexdigest()[:8]
        return {
            "success": True,
            "platform": platform,
            "video_id": f"{platform}-{video_hash}",
            "url": f"https://www.{platform}.com/video/{video_hash}",
            "title": metadata.get("title", ""),
            "description": metadata.get("description", ""),
            "tags": metadata.get("tags", []),
            "status": "published",
        }

    async def _publish_douyin(self, video_path: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        api_key = settings.douyin_api_key
        if not api_key:
            return self._mock_publish("douyin", video_path, metadata)

        response = await self.clients["douyin"].post(
            "/api/v2/video/upload/",
            headers={"Access-Token": api_key},
            data={
                "title": metadata.get("title", ""),
                "description": metadata.get("description", ""),
                "tags": metadata.get("tags", []),
            },
            files={"video": open(video_path, "rb")},
        )

        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "platform": "douyin",
                "video_id": data.get("video_id", ""),
                "url": f"https://www.douyin.com/video/{data.get('video_id', '')}",
            }
        return self._mock_publish("douyin", video_path, metadata)

    async def _publish_kuaishou(self, video_path: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        api_key = settings.kuaishou_api_key
        if not api_key:
            return self._mock_publish("kuaishou", video_path, metadata)

        response = await self.clients["kuaishou"].post(
            "/openapi/v1/video/upload",
            headers={"Authorization": f"Bearer {api_key}"},
            data={"title": metadata.get("title", ""), "description": metadata.get("description", "")},
            files={"video": open(video_path, "rb")},
        )

        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "platform": "kuaishou",
                "video_id": data.get("video_id", ""),
            }
        return self._mock_publish("kuaishou", video_path, metadata)

    async def _publish_bilibili(self, video_path: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        api_key = settings.bilibili_api_key
        if not api_key:
            return self._mock_publish("bilibili", video_path, metadata)

        response = await self.clients["bilibili"].post(
            "/x/web-interface/upload/video",
            headers={"Authorization": f"Bearer {api_key}"},
            data={"title": metadata.get("title", ""), "desc": metadata.get("description", "")},
            files={"file": open(video_path, "rb")},
        )

        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "platform": "bilibili",
                "video_id": data.get("data", {}).get("aid", ""),
            }
        return self._mock_publish("bilibili", video_path, metadata)

    async def _publish_xiaohongshu(self, video_path: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        api_key = settings.xiaohongshu_api_key
        if not api_key:
            return self._mock_publish("xiaohongshu", video_path, metadata)

        response = await self.clients["xiaohongshu"].post(
            "/api/v1/note/create",
            headers={"Authorization": f"Bearer {api_key}"},
            data={"title": metadata.get("title", ""), "content": metadata.get("description", "")},
            files={"video": open(video_path, "rb")},
        )

        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "platform": "xiaohongshu",
                "note_id": data.get("note_id", ""),
            }
        return self._mock_publish("xiaohongshu", video_path, metadata)

    async def _publish_youtube(self, video_path: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        api_key = settings.youtube_api_key
        if not api_key:
            return self._mock_publish("youtube", video_path, metadata)

        response = await self.clients["youtube"].post(
            "/youtube/v3/videos/insert",
            headers={"Authorization": f"Bearer {api_key}"},
            data={"snippet": {"title": metadata.get("title", ""), "description": metadata.get("description", "")}},
            files={"media": open(video_path, "rb")},
        )

        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "platform": "youtube",
                "video_id": data.get("id", ""),
            }
        return self._mock_publish("youtube", video_path, metadata)

    async def _publish_tiktok(self, video_path: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        api_key = settings.tiktok_api_key
        if not api_key:
            return self._mock_publish("tiktok", video_path, metadata)

        response = await self.clients["tiktok"].post(
            "/v2/video/upload",
            headers={"Authorization": f"Bearer {api_key}"},
            data={"title": metadata.get("title", ""), "description": metadata.get("description", "")},
            files={"video": open(video_path, "rb")},
        )

        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "platform": "tiktok",
                "video_id": data.get("video_id", ""),
            }
        return self._mock_publish("tiktok", video_path, metadata)

    async def batch_publish(self, video_path: str, metadata: Dict[str, Any], platforms: list) -> Dict[str, Any]:
        tasks = []
        for platform in platforms:
            if platform in self.PLATFORMS:
                task = asyncio.create_task(self.publish(platform, video_path, metadata))
                tasks.append(task)

        completed = await asyncio.gather(*tasks, return_exceptions=True)

        results = {}
        success_count = 0
        for platform, result in zip(platforms, completed):
            if isinstance(result, Exception):
                results[platform] = {"success": False, "error": str(result)}
            else:
                results[platform] = result
                if result.get("success", False):
                    success_count += 1

        return {
            "total": len(platforms),
            "success": success_count,
            "failed": len(platforms) - success_count,
            "results": results,
        }


publisher = PlatformPublisher()