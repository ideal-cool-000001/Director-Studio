from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

from .project import ProjectModel
from .asset_node import AssetNodeModel
from .edge import EdgeModel
from .task import TaskModel
from .version import VersionModel
from .user import UserModel
from .prompt_version import PromptVersionModel
from .ai_service_config import AIServiceConfigModel

__all__ = [
    "Base",
    "ProjectModel",
    "AssetNodeModel",
    "EdgeModel",
    "TaskModel",
    "VersionModel",
    "UserModel",
    "PromptVersionModel",
    "AIServiceConfigModel",
]