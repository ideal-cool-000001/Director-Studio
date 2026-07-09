from typing import Dict, List, Optional, Any, Callable
from uuid import uuid4
from enum import Enum
from dataclasses import dataclass, field


class SkillCategory(str, Enum):
    WRITING = "writing"
    DESIGN = "design"
    GENERATION = "generation"
    EDITING = "editing"
    ANALYSIS = "analysis"
    COORDINATION = "coordination"
    QUALITY = "quality"
    PUBLISHING = "publishing"


class SkillLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


@dataclass
class Skill:
    id: str
    name: str
    description: str
    category: SkillCategory
    level: SkillLevel = SkillLevel.INTERMEDIATE
    parameters: Dict[str, Any] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)
    enabled: bool = True


class SkillRegistry:
    def __init__(self):
        self._skills: Dict[str, Skill] = {}
        self._agent_skills: Dict[str, List[str]] = {}
        self._category_index: Dict[str, List[str]] = {}
        self._default_skills: Dict[str, List[str]] = {}

    def register_skill(self, skill: Skill) -> str:
        self._skills[skill.id] = skill

        if skill.category.value not in self._category_index:
            self._category_index[skill.category.value] = []
        self._category_index[skill.category.value].append(skill.id)

        return skill.id

    def get_skill(self, skill_id: str) -> Optional[Skill]:
        return self._skills.get(skill_id)

    def list_skills(self, category: Optional[str] = None, level: Optional[str] = None) -> List[Skill]:
        skills = list(self._skills.values())

        if category:
            skills = [s for s in skills if s.category.value == category]

        if level:
            skills = [s for s in skills if s.level.value == level]

        return skills

    def assign_skill_to_agent(self, agent_id: str, skill_id: str) -> bool:
        skill = self._skills.get(skill_id)
        if not skill:
            return False

        if agent_id not in self._agent_skills:
            self._agent_skills[agent_id] = []

        if skill_id not in self._agent_skills[agent_id]:
            self._agent_skills[agent_id].append(skill_id)
            return True

        return False

    def remove_skill_from_agent(self, agent_id: str, skill_id: str) -> bool:
        if agent_id not in self._agent_skills:
            return False

        if skill_id in self._agent_skills[agent_id]:
            self._agent_skills[agent_id].remove(skill_id)
            return True

        return False

    def get_agent_skills(self, agent_id: str) -> List[Skill]:
        skill_ids = self._agent_skills.get(agent_id, [])
        return [self._skills.get(id) for id in skill_ids if self._skills.get(id)]

    def set_default_skills(self, agent_id: str, skill_ids: List[str]) -> None:
        self._default_skills[agent_id] = skill_ids

    def get_default_skills(self, agent_id: str) -> List[str]:
        return self._default_skills.get(agent_id, [])

    def enable_skill(self, skill_id: str) -> bool:
        skill = self._skills.get(skill_id)
        if not skill:
            return False
        skill.enabled = True
        return True

    def disable_skill(self, skill_id: str) -> bool:
        skill = self._skills.get(skill_id)
        if not skill:
            return False
        skill.enabled = False
        return True

    def get_skills_by_category(self, category: str) -> List[Skill]:
        skill_ids = self._category_index.get(category, [])
        return [self._skills.get(id) for id in skill_ids if self._skills.get(id)]

    def get_agent_skill_summary(self, agent_id: str) -> Dict[str, Any]:
        skills = self.get_agent_skills(agent_id)
        return {
            "agent_id": agent_id,
            "total_skills": len(skills),
            "categories": {
                category: len([s for s in skills if s.category.value == category])
                for category in self._category_index.keys()
            },
            "skills": [skill.to_dict() for skill in skills],
        }

    def export_configuration(self) -> Dict[str, Any]:
        return {
            "skills": {id: skill.to_dict() for id, skill in self._skills.items()},
            "agent_skills": self._agent_skills,
            "default_skills": self._default_skills,
        }

    def import_configuration(self, config: Dict[str, Any]) -> None:
        for skill_data in config.get("skills", {}).values():
            skill = Skill(
                id=skill_data["id"],
                name=skill_data["name"],
                description=skill_data["description"],
                category=SkillCategory(skill_data["category"]),
                level=SkillLevel(skill_data.get("level", "intermediate")),
                parameters=skill_data.get("parameters", {}),
                dependencies=skill_data.get("dependencies", []),
                enabled=skill_data.get("enabled", True),
            )
            self.register_skill(skill)

        self._agent_skills = config.get("agent_skills", {})
        self._default_skills = config.get("default_skills", {})


skill_registry = SkillRegistry()


DEFAULT_SKILLS = [
    Skill(
        id="script_writing",
        name="剧本创作",
        description="创作高质量的剧本内容，包括对话、情节和人物塑造",
        category=SkillCategory.WRITING,
        level=SkillLevel.EXPERT,
    ),
    Skill(
        id="character_design",
        name="人物设计",
        description="设计角色外观、性格和背景故事",
        category=SkillCategory.DESIGN,
        level=SkillLevel.ADVANCED,
    ),
    Skill(
        id="scene_design",
        name="场景设计",
        description="设计场景布局、道具和视觉风格",
        category=SkillCategory.DESIGN,
        level=SkillLevel.ADVANCED,
    ),
    Skill(
        id="storyboard_creation",
        name="分镜创作",
        description="创建分镜图和镜头规划",
        category=SkillCategory.DESIGN,
        level=SkillLevel.INTERMEDIATE,
    ),
    Skill(
        id="image_generation",
        name="图像生成",
        description="使用AI模型生成高质量图像",
        category=SkillCategory.GENERATION,
        level=SkillLevel.ADVANCED,
    ),
    Skill(
        id="video_generation",
        name="视频生成",
        description="使用AI模型生成视频内容",
        category=SkillCategory.GENERATION,
        level=SkillLevel.ADVANCED,
    ),
    Skill(
        id="audio_synthesis",
        name="语音合成",
        description="生成语音和音频内容",
        category=SkillCategory.GENERATION,
        level=SkillLevel.INTERMEDIATE,
    ),
    Skill(
        id="video_editing",
        name="视频剪辑",
        description="剪辑和编辑视频素材",
        category=SkillCategory.EDITING,
        level=SkillLevel.ADVANCED,
    ),
    Skill(
        id="color_grading",
        name="色彩校正",
        description="调整视频色彩和视觉效果",
        category=SkillCategory.EDITING,
        level=SkillLevel.INTERMEDIATE,
    ),
    Skill(
        id="quality_inspection",
        name="质量检查",
        description="检查内容质量和风格一致性",
        category=SkillCategory.QUALITY,
        level=SkillLevel.INTERMEDIATE,
    ),
    Skill(
        id="budget_management",
        name="预算管理",
        description="管理项目预算和成本控制",
        category=SkillCategory.COORDINATION,
        level=SkillLevel.ADVANCED,
    ),
    Skill(
        id="project_coordination",
        name="项目协调",
        description="协调各环节工作流程",
        category=SkillCategory.COORDINATION,
        level=SkillLevel.EXPERT,
    ),
    Skill(
        id="multi_platform_publishing",
        name="多平台发布",
        description="发布内容到多个平台",
        category=SkillCategory.PUBLISHING,
        level=SkillLevel.INTERMEDIATE,
    ),
    Skill(
        id="promotion_video",
        name="宣传视频制作",
        description="制作宣传和推广视频",
        category=SkillCategory.PUBLISHING,
        level=SkillLevel.INTERMEDIATE,
    ),
]

for skill in DEFAULT_SKILLS:
    skill_registry.register_skill(skill)

AGENT_DEFAULT_SKILLS = {
    "producer": ["budget_management", "project_coordination"],
    "director": ["project_coordination", "quality_inspection"],
    "screenwriter": ["script_writing"],
    "character_designer": ["character_design"],
    "scene_designer": ["scene_design"],
    "storyboard_arranger": ["storyboard_creation"],
    "video_generator": ["video_generation"],
    "audio_producer": ["audio_synthesis"],
    "editor": ["video_editing", "color_grading"],
    "promotion": ["promotion_video", "multi_platform_publishing"],
    "quality_inspector": ["quality_inspection"],
}

for agent_id, skill_ids in AGENT_DEFAULT_SKILLS.items():
    skill_registry.set_default_skills(agent_id, skill_ids)
    for skill_id in skill_ids:
        skill_registry.assign_skill_to_agent(agent_id, skill_id)