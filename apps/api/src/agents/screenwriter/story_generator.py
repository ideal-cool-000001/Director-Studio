from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class Character:
    name: str
    description: str
    personality: str = ""
    relationships: List[Dict] = field(default_factory=list)
    role: str = "supporting"


@dataclass
class Scene:
    scene_id: str
    location: str
    description: str
    time_of_day: str = ""
    characters: List[str] = field(default_factory=list)
    dialogue: List[Dict] = field(default_factory=list)
    actions: List[str] = field(default_factory=list)


@dataclass
class Script:
    title: str
    genre: str
    tone: str
    synopsis: str
    characters: List[Character] = field(default_factory=list)
    scenes: List[Scene] = field(default_factory=list)
    word_count: int = 0


class StoryGenerator:
    def __init__(self):
        self._story_templates = {
            "comedy": {
                "opening": "一个平凡的场景，发生一件荒诞的小事",
                "middle": "主角试图解决问题，但越弄越糟",
                "ending": "出人意料的反转，皆大欢喜",
            },
            "drama": {
                "opening": "平静表面下隐藏着矛盾",
                "middle": "冲突爆发，情感挣扎",
                "ending": "和解或悲剧，留下思考",
            },
            "fantasy": {
                "opening": "主角发现了一个秘密世界",
                "middle": "冒险旅程，发现真相",
                "ending": "成长与蜕变，新世界的开始",
            },
            "romance": {
                "opening": "不期而遇的邂逅",
                "middle": "情感升温，遭遇考验",
                "ending": "终成眷属或遗憾错过",
            },
            "thriller": {
                "opening": "一桩神秘事件发生",
                "middle": "层层深入，接近真相",
                "ending": "惊天反转，真相大白",
            },
        }

    def generate_story_skeleton(self, idea: str, genre: str, tone: str, word_limit: int = 1000) -> Dict:
        template = self._story_templates.get(genre, self._story_templates["drama"])

        return {
            "idea": idea,
            "genre": genre,
            "tone": tone,
            "structure": {
                "act_1": {"purpose": "铺垫与引入", "content": template["opening"]},
                "act_2": {"purpose": "发展与冲突", "content": template["middle"]},
                "act_3": {"purpose": "高潮与结局", "content": template["ending"]},
            },
            "word_limit": word_limit,
        }

    def generate_characters(self, story_skeleton: Dict, count: int = 3) -> List[Character]:
        roles = ["主角", "配角", "反派"] if count >= 3 else ["主角", "配角"]
        characters = []

        for i in range(min(count, 5)):
            character = Character(
                name=f"角色{i+1}",
                description=f"《{story_skeleton['idea']}》中的{roles[i] if i < len(roles) else '角色'}",
                personality=self._generate_personality(story_skeleton["genre"]),
                role="main" if i == 0 else "supporting",
            )
            characters.append(character)

        return characters

    def _generate_personality(self, genre: str) -> str:
        personalities = {
            "comedy": "幽默风趣，有点冒失",
            "drama": "内心复杂，情感丰富",
            "fantasy": "勇敢善良，充满好奇心",
            "romance": "温柔体贴，渴望真爱",
            "thriller": "机智敏锐，善于观察",
        }
        return personalities.get(genre, "性格鲜明，富有魅力")

    def generate_scenes(self, story_skeleton: Dict, characters: List[Character]) -> List[Scene]:
        scenes = []
        character_names = [c.name for c in characters]

        scenes.append(Scene(
            scene_id="scene_001",
            location="开场场景",
            description=story_skeleton["structure"]["act_1"]["content"],
            time_of_day="白天",
            characters=[character_names[0]],
            dialogue=[],
            actions=["介绍主角", "展示日常"],
        ))

        if len(character_names) > 1:
            scenes.append(Scene(
                scene_id="scene_002",
                location="主要场景",
                description=story_skeleton["structure"]["act_2"]["content"],
                time_of_day="傍晚",
                characters=character_names[:2],
                dialogue=[],
                actions=["冲突发生", "情感交流"],
            ))

        scenes.append(Scene(
            scene_id="scene_003",
            location="高潮场景",
            description=story_skeleton["structure"]["act_3"]["content"],
            time_of_day="夜晚",
            characters=character_names,
            dialogue=[],
            actions=["高潮爆发", "结局"],
        ))

        return scenes

    def compile_script(self, story_skeleton: Dict, characters: List[Character], scenes: List[Scene]) -> Script:
        script_content = f"# {story_skeleton['idea']}\n\n"
        script_content += f"**类型**: {story_skeleton['genre']}\n"
        script_content += f"**基调**: {story_skeleton['tone']}\n\n"
        script_content += "## 角色列表\n"
        for char in characters:
            script_content += f"- **{char.name}**: {char.description} ({char.personality})\n"

        script_content += "\n## 剧情梗概\n"
        script_content += f"{story_skeleton['structure']['act_1']['content']}\n"
        script_content += f"{story_skeleton['structure']['act_2']['content']}\n"
        script_content += f"{story_skeleton['structure']['act_3']['content']}\n"

        script_content += "\n## 剧本正文\n"
        for scene in scenes:
            script_content += f"\n### {scene.scene_id}: {scene.location}\n"
            script_content += f"**时间**: {scene.time_of_day}\n"
            script_content += f"**地点**: {scene.location}\n"
            script_content += f"**人物**: {', '.join(scene.characters)}\n\n"
            script_content += f"{scene.description}\n\n"
            for action in scene.actions:
                script_content += f"【{action}】\n"

        return Script(
            title=story_skeleton["idea"],
            genre=story_skeleton["genre"],
            tone=story_skeleton["tone"],
            synopsis=story_skeleton["structure"]["act_1"]["content"],
            characters=characters,
            scenes=scenes,
            word_count=len(script_content),
        )