import asyncio
import logging
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod

import httpx

logger = logging.getLogger(__name__)


class BaseConverter(ABC):
    @abstractmethod
    async def convert(self, input_path: str, output_format: str, **kwargs) -> Dict[str, Any]:
        pass


class VideoConverter(BaseConverter):
    FORMATS = ["mp4", "avi", "mkv", "webm", "mov", "flv"]

    def __init__(self):
        self.ffmpeg_path = "ffmpeg"

    async def convert(self, input_path: str, output_format: str, **kwargs) -> Dict[str, Any]:
        if output_format not in self.FORMATS:
            return {"success": False, "error": f"不支持的格式: {output_format}"}

        try:
            resolution = kwargs.get("resolution", "1080p")
            fps = kwargs.get("fps", 24)
            bitrate = kwargs.get("bitrate", "5000k")

            resolution_map = {
                "480p": "854x480",
                "720p": "1280x720",
                "1080p": "1920x1080",
                "4k": "3840x2160",
            }

            output_path = f"{input_path.rsplit('.', 1)[0]}.{output_format}"

            command = [
                self.ffmpeg_path,
                "-i", input_path,
                "-s", resolution_map.get(resolution, "1920x1080"),
                "-r", str(fps),
                "-b:v", bitrate,
                "-c:v", self._get_codec(output_format),
                "-y",
                output_path,
            ]

            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                return {
                    "success": True,
                    "output_path": output_path,
                    "format": output_format,
                    "resolution": resolution,
                    "fps": fps,
                }
            else:
                logger.error(f"FFmpeg error: {stderr.decode()}")
                return {
                    "success": False,
                    "error": f"转换失败: {stderr.decode()[:200]}",
                }

        except Exception as e:
            logger.error(f"Video conversion failed: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def _get_codec(self, format: str) -> str:
        codecs = {
            "mp4": "libx264",
            "avi": "libxvid",
            "mkv": "libx264",
            "webm": "libvpx-vp9",
            "mov": "libx264",
            "flv": "flv",
        }
        return codecs.get(format, "libx264")


class ImageConverter(BaseConverter):
    FORMATS = ["png", "jpg", "jpeg", "webp", "gif", "bmp"]

    async def convert(self, input_path: str, output_format: str, **kwargs) -> Dict[str, Any]:
        if output_format not in self.FORMATS:
            return {"success": False, "error": f"不支持的格式: {output_format}"}

        try:
            quality = kwargs.get("quality", 90)
            output_path = f"{input_path.rsplit('.', 1)[0]}.{output_format}"

            if output_format.lower() == "webp":
                command = ["cwebp", "-q", str(quality), input_path, "-o", output_path]
            else:
                command = [
                    "ffmpeg",
                    "-i", input_path,
                    "-q:v", str(quality),
                    "-y",
                    output_path,
                ]

            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                return {
                    "success": True,
                    "output_path": output_path,
                    "format": output_format,
                    "quality": quality,
                }
            else:
                return {
                    "success": False,
                    "error": f"转换失败: {stderr.decode()[:200]}",
                }

        except Exception as e:
            logger.error(f"Image conversion failed: {e}")
            return {"success": False, "error": str(e)}


class AudioConverter(BaseConverter):
    FORMATS = ["mp3", "wav", "flac", "ogg", "aac", "m4a"]

    async def convert(self, input_path: str, output_format: str, **kwargs) -> Dict[str, Any]:
        if output_format not in self.FORMATS:
            return {"success": False, "error": f"不支持的格式: {output_format}"}

        try:
            sample_rate = kwargs.get("sample_rate", 44100)
            bitrate = kwargs.get("bitrate", "128k")

            output_path = f"{input_path.rsplit('.', 1)[0]}.{output_format}"

            command = [
                "ffmpeg",
                "-i", input_path,
                "-ar", str(sample_rate),
                "-b:a", bitrate,
                "-y",
                output_path,
            ]

            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                return {
                    "success": True,
                    "output_path": output_path,
                    "format": output_format,
                    "sample_rate": sample_rate,
                }
            else:
                return {
                    "success": False,
                    "error": f"转换失败: {stderr.decode()[:200]}",
                }

        except Exception as e:
            logger.error(f"Audio conversion failed: {e}")
            return {"success": False, "error": str(e)}


video_converter = VideoConverter()
image_converter = ImageConverter()
audio_converter = AudioConverter()