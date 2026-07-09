from typing import Dict, Any, List
import json

from src.agents.base_agent import BaseAgent, AgentResult
from .story_generator import StoryGenerator, Script, Character, Scene
from .prompts import (
    SCREENWRITER_SYSTEM_PROMPT,
    SCREENWRITER_STORY_SKELETON_PROMPT,
    SCREENWRITER_SCRIPT_PROMPT,
)


class ScreenwriterAgent(BaseAgent):
    agent_type: str = "screenwriter"
    description: str = "编剧Agent：自动写作剧本或创作小说"

    def __init__(self):
        self.story_generator = StoryGenerator()

    async def execute(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        action = context.get("action", "generate")

        if action == "generate_story_skeleton":
            return await self._generate_story_skeleton(context)
        elif action == "generate_characters":
            return await self._generate_characters(context)
        elif action == "generate_scenes":
            return await self._generate_scenes(context)
        elif action == "compile_script":
            return await self._compile_script(context)
        elif action == "generate_full_script":
            return await self._generate_full_script(context)
        else:
            return AgentResult(
                success=False,
                error=f"未知操作: {action}",
            )

    async def _generate_story_skeleton(self, context: Dict[str, Any]) -> AgentResult:
        try:
            idea = context.get("idea", "一个有趣的故事")
            genre = context.get("genre", "drama")
            tone = context.get("tone", "serious")
            word_limit = context.get("word_limit", 1000)

            skeleton = self.story_generator.generate_story_skeleton(idea, genre, tone, word_limit)

            prompt = SCREENWRITER_STORY_SKELETON_PROMPT.format(
                idea=idea,
                genre=genre,
                tone=tone,
                word_limit=word_limit,
            )

            return AgentResult(
                success=True,
                data={
                    "story_skeleton": skeleton,
                    "prompt": prompt,
                    "suggestion": "可以继续调用 generate_characters 生成角色",
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _generate_characters(self, context: Dict[str, Any]) -> AgentResult:
        try:
            story_skeleton = context.get("story_skeleton")
            if not story_skeleton:
                return AgentResult(
                    success=False,
                    error="缺少 story_skeleton",
                )

            character_count = context.get("character_count", 3)
            characters = self.story_generator.generate_characters(story_skeleton, character_count)

            characters_data = [
                {
                    "name": char.name,
                    "description": char.description,
                    "personality": char.personality,
                    "relationships": char.relationships,
                    "role": char.role,
                }
                for char in characters
            ]

            return AgentResult(
                success=True,
                data={
                    "characters": characters_data,
                    "suggestion": "可以继续调用 generate_scenes 生成场景",
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _generate_scenes(self, context: Dict[str, Any]) -> AgentResult:
        try:
            story_skeleton = context.get("story_skeleton")
            characters = context.get("characters")

            if not story_skeleton:
                return AgentResult(
                    success=False,
                    error="缺少 story_skeleton",
                )
            if not characters:
                return AgentResult(
                    success=False,
                    error="缺少 characters",
                )

            character_objects = [
                Character(
                    name=c.get("name", ""),
                    description=c.get("description", ""),
                    personality=c.get("personality", ""),
                    relationships=c.get("relationships", []),
                    role=c.get("role", "supporting"),
                )
                for c in characters
            ]

            scenes = self.story_generator.generate_scenes(story_skeleton, character_objects)

            scenes_data = [
                {
                    "scene_id": scene.scene_id,
                    "location": scene.location,
                    "description": scene.description,
                    "time_of_day": scene.time_of_day,
                    "characters": scene.characters,
                    "dialogue": scene.dialogue,
                    "actions": scene.actions,
                }
                for scene in scenes
            ]

            return AgentResult(
                success=True,
                data={
                    "scenes": scenes_data,
                    "suggestion": "可以继续调用 compile_script 编译完整剧本",
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _compile_script(self, context: Dict[str, Any]) -> AgentResult:
        try:
            story_skeleton = context.get("story_skeleton")
            characters = context.get("characters")
            scenes = context.get("scenes")

            if not story_skeleton:
                return AgentResult(
                    success=False,
                    error="缺少 story_skeleton",
                )
            if not characters:
                return AgentResult(
                    success=False,
                    error="缺少 characters",
                )
            if not scenes:
                return AgentResult(
                    success=False,
                    error="缺少 scenes",
                )

            character_objects = [
                Character(
                    name=c.get("name", ""),
                    description=c.get("description", ""),
                    personality=c.get("personality", ""),
                    relationships=c.get("relationships", []),
                    role=c.get("role", "supporting"),
                )
                for c in characters
            ]

            scene_objects = [
                Scene(
                    scene_id=s.get("scene_id", ""),
                    location=s.get("location", ""),
                    description=s.get("description", ""),
                    time_of_day=s.get("time_of_day", ""),
                    characters=s.get("characters", []),
                    dialogue=s.get("dialogue", []),
                    actions=s.get("actions", []),
                )
                for s in scenes
            ]

            script = self.story_generator.compile_script(story_skeleton, character_objects, scene_objects)

            return AgentResult(
                success=True,
                data={
                    "script": {
                        "title": script.title,
                        "genre": script.genre,
                        "tone": script.tone,
                        "synopsis": script.synopsis,
                        "word_count": script.word_count,
                        "content": script.__dict__,
                    },
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _generate_full_script(self, context: Dict[str, Any]) -> AgentResult:
        try:
            idea = context.get("idea", "一个有趣的故事")
            genre = context.get("genre", "drama")
            tone = context.get("tone", "serious")
            word_limit = context.get("word_limit", 1000)
            character_count = context.get("character_count", 3)

            skeleton = self.story_generator.generate_story_skeleton(idea, genre, tone, word_limit)
            characters = self.story_generator.generate_characters(skeleton, character_count)
            scenes = self.story_generator.generate_scenes(skeleton, characters)
            script = self.story_generator.compile_script(skeleton, characters, scenes)

            return AgentResult(
                success=True,
                data={
                    "script": {
                        "title": script.title,
                        "genre": script.genre,
                        "tone": script.tone,
                        "synopsis": script.synopsis,
                        "word_count": script.word_count,
                        "characters": [c.__dict__ for c in characters],
                        "scenes": [s.__dict__ for s in scenes],
                    },
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
        valid_actions = ["generate_story_skeleton", "generate_characters", "generate_scenes", "compile_script", "generate_full_script"]
        if action not in valid_actions:
            errors.append(f"无效的 action: {action}")

        if action in ["generate_story_skeleton", "generate_full_script"]:
            if "idea" not in data:
                errors.append("缺少 idea")

        if action == "generate_characters":
            if "story_skeleton" not in data:
                errors.append("缺少 story_skeleton")

        if action == "generate_scenes":
            if "story_skeleton" not in data:
                errors.append("缺少 story_skeleton")
            if "characters" not in data:
                errors.append("缺少 characters")

        if action == "compile_script":
            if "story_skeleton" not in data:
                errors.append("缺少 story_skeleton")
            if "characters" not in data:
                errors.append("缺少 characters")
            if "scenes" not in data:
                errors.append("缺少 scenes")

        if errors:
            return {"valid": False, "errors": errors}
        return {"valid": True}