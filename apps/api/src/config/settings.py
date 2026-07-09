# ═══════════════════════════════════════════
# Pydantic Settings — 环境变量配置
# ═══════════════════════════════════════════

from pydantic import SecretStr
from pydantic_settings import BaseSettings


def get_secret_value(value):
    if hasattr(value, 'get_secret_value'):
        return value.get_secret_value()
    return str(value)


class Settings(BaseSettings):
    """应用配置（从环境变量或 .env 文件加载）"""

    # 应用
    app_env: str = "development"
    app_port: int = 8000
    app_host: str = "0.0.0.0"
    cors_origins: str = "http://localhost:5173"

    # 数据库
    database_url: str = "postgresql+asyncpg://director:director_pass@localhost:5432/director_db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # S3 对象存储
    s3_endpoint: str = ""
    s3_bucket: str = "director-assets"
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_region: str = "ap-southeast-1"

    # LLM
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    openai_mini_model: str = "gpt-4o-mini"
    qwen_api_key: str = ""
    qwen_model: str = "qwen-2.5-72b"

    # 图像生成
    comfyui_url: str = "http://localhost:8188"
    flux2_api_key: str = ""
    dalle3_api_key: str = ""
    sd_api_key: str = ""
    midjourney_api_key: str = ""

    # AI Mock 模式
    use_mock_ai: bool = True

    # 视频生成
    kling_api_key: str = ""
    kling_api_secret: str = ""
    seedance_api_key: str = ""
    runway_api_key: str = ""
    pika_api_key: str = ""

    # TTS
    cosyvoice_url: str = "http://localhost:9880"
    elevenlabs_api_key: str = ""
    volcengine_api_key: str = ""
    aliyun_api_key: str = ""
    baidu_api_key: str = ""

    # BGM / SFX
    stable_audio_api_key: str = ""

    # 发布平台
    douyin_api_key: str = ""
    kuaishou_api_key: str = ""
    bilibili_api_key: str = ""
    xiaohongshu_api_key: str = ""
    youtube_api_key: str = ""
    tiktok_api_key: str = ""

    # 内容安全
    nsfw_threshold: float = 0.8
    content_filter_enabled: bool = True

    # 监控
    langsmith_api_key: str = ""
    langsmith_project: str = "director-workflow"

    # 认证
    jwt_secret: SecretStr = SecretStr("change-me-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 24

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
