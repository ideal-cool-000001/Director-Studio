from typing import Dict, Any, List
import json

from src.agents.base_agent import BaseAgent, AgentResult
from src.services.llm_service import llm_service
from .story_generator import StoryGenerator, Script, Character, Scene
from .prompts import (
    SCREENWRITER_SYSTEM_PROMPT,
    SCREENWRITER_STORY_SKELETON_PROMPT,
    SCREENWRITER_SCRIPT_PROMPT,
    SCREENWRITER_REFINEMENT_PROMPT,
    SCREENWRITER_CHARACTER_PROMPT,
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
        elif action == "continue":
            return await self._continue_script(context)
        elif action == "polish":
            return await self._polish_script(context)
        elif action == "generate_scene":
            return await self._generate_single_scene(context)
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

            messages = [
                {"role": "system", "content": SCREENWRITER_SYSTEM_PROMPT},
                {"role": "user", "content": SCREENWRITER_STORY_SKELETON_PROMPT.format(
                    idea=idea,
                    genre=genre,
                    tone=tone,
                    word_limit=word_limit,
                )},
            ]

            result = await llm_service.chat_completion(
                messages=messages,
                model="gpt-4o",
                provider="openai",
            )

            skeleton = self.story_generator.generate_story_skeleton(idea, genre, tone, word_limit)
            skeleton["llm_content"] = result.get("content", "")

            return AgentResult(
                success=True,
                data={
                    "story_skeleton": skeleton,
                    "llm_content": result.get("content", ""),
                    "prompt": SCREENWRITER_STORY_SKELETON_PROMPT.format(
                        idea=idea,
                        genre=genre,
                        tone=tone,
                        word_limit=word_limit,
                    ),
                    "suggestion": "可以继续调用 generate_characters 生成角色",
                },
                cost=result.get("estimated_cost", 0.0),
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

            script_content = json.dumps(story_skeleton, ensure_ascii=False)
            messages = [
                {"role": "system", "content": SCREENWRITER_SYSTEM_PROMPT},
                {"role": "user", "content": SCREENWRITER_CHARACTER_PROMPT.format(
                    script_content=script_content,
                )},
            ]

            result = await llm_service.chat_completion(
                messages=messages,
                model="gpt-4o",
                provider="openai",
            )

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
                    "llm_content": result.get("content", ""),
                    "suggestion": "可以继续调用 generate_scenes 生成场景",
                },
                cost=result.get("estimated_cost", 0.0),
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

            messages = [
                {"role": "system", "content": SCREENWRITER_SYSTEM_PROMPT},
                {"role": "user", "content": f"""请创作一个完整的{genre}类型剧本，要求如下：

创意：{idea}
类型：{genre}
基调：{tone}
目标字数：{word_limit}字
角色数量：{character_count}个

请输出完整的剧本内容，包含：
1. 故事大纲（三幕式结构）
2. 角色设定（姓名、年龄、性格、外貌）
3. 场景列表
4. 完整剧本正文（标准剧本格式）"""},
            ]

            result = await llm_service.chat_completion(
                messages=messages,
                model="gpt-4o",
                provider="openai",
                max_tokens=word_limit * 2,
            )

            skeleton = self.story_generator.generate_story_skeleton(idea, genre, tone, word_limit)
            characters = self.story_generator.generate_characters(skeleton, character_count)
            scenes = self.story_generator.generate_scenes(skeleton, characters)

            return AgentResult(
                success=True,
                data={
                    "script": {
                        "title": idea,
                        "genre": genre,
                        "tone": tone,
                        "synopsis": skeleton.get("structure", {}).get("act_1", {}).get("content", ""),
                        "word_count": len(result.get("content", "")),
                        "characters": [c.__dict__ for c in characters],
                        "scenes": [s.__dict__ for s in scenes],
                        "llm_content": result.get("content", ""),
                    },
                },
                cost=result.get("estimated_cost", 0.0),
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _continue_script(self, context: Dict[str, Any]) -> AgentResult:
        try:
            current_content = context.get("content", "")
            continuation = context.get("continuation", "")
            genre = context.get("genre", "drama")
            tone = context.get("tone", "serious")

            messages = [
                {"role": "system", "content": SCREENWRITER_SYSTEM_PROMPT},
                {"role": "user", "content": f"""请续写以下剧本内容：

当前剧本：
{current_content}

续写要求：
{continuation}

类型：{genre}
基调：{tone}

请继续编写后续剧情，保持风格一致。"""},
            ]

            result = await llm_service.chat_completion(
                messages=messages,
                model="gpt-4o",
                provider="openai",
                max_tokens=2000,
            )

            return AgentResult(
                success=True,
                data={
                    "content": current_content + "\n\n" + result.get("content", ""),
                    "llm_content": result.get("content", ""),
                },
                cost=result.get("estimated_cost", 0.0),
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _polish_script(self, context: Dict[str, Any]) -> AgentResult:
        try:
            original_script = context.get("content", "")
            instructions = context.get("instructions", "请优化剧本的语言表达，使对话更加生动自然")

            messages = [
                {"role": "system", "content": SCREENWRITER_SYSTEM_PROMPT},
                {"role": "user", "content": SCREENWRITER_REFINEMENT_PROMPT.format(
                    original_script=original_script,
                    instructions=instructions,
                )},
            ]

            result = await llm_service.chat_completion(
                messages=messages,
                model="gpt-4o",
                provider="openai",
                max_tokens=2000,
            )

            return AgentResult(
                success=True,
                data={
                    "content": result.get("content", ""),
                    "llm_content": result.get("content", ""),
                },
                cost=result.get("estimated_cost", 0.0),
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _generate_single_scene(self, context: Dict[str, Any]) -> AgentResult:
        try:
            scene_title = context.get("title", "新场景")
            location = context.get("location", "")
            characters = context.get("characters", [])
            description = context.get("description", "")
            genre = context.get("genre", "drama")
            tone = context.get("tone", "serious")

            messages = [
                {"role": "system", "content": SCREENWRITER_SYSTEM_PROMPT},
                {"role": "user", "content": f"""请创作一个剧本场景：

场景标题：{scene_title}
地点：{location}
出场人物：{', '.join(characters)}
描述：{description}

类型：{genre}
基调：{tone}

请输出完整的场景剧本，包含动作描述和对话。"""},
            ]

            result = await llm_service.chat_completion(
                messages=messages,
                model="gpt-4o",
                provider="openai",
                max_tokens=1500,
            )

            return AgentResult(
                success=True,
                data={
                    "scene": {
                        "title": scene_title,
                        "location": location,
                        "characters": characters,
                        "content": result.get("content", ""),
                    },
                    "llm_content": result.get("content", ""),
                },
                cost=result.get("estimated_cost", 0.0),
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        errors = []

        action = data.get("action")
        valid_actions = ["generate_story_skeleton", "generate_characters", "generate_scenes", 
                         "compile_script", "generate_full_script", "continue", "polish", "generate_scene"]
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

        if action == "continue":
            if "content" not in data:
                errors.append("缺少 content")

        if action == "polish":
            if "content" not in data:
                errors.append("缺少 content")

        if errors:
            return {"valid": False, "errors": errors}
        return {"valid": True}