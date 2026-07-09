from typing import Dict, Any, List

from src.agents.base_agent import BaseAgent, AgentResult


class SceneDesignerAgent(BaseAgent):
    agent_type: str = "scene_designer"
    description: str = "场景设计Agent：设计场景环境和背景"

    async def execute(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        action = context.get("action", "design")

        if action == "design":
            return await self._design_scenes(context)
        elif action == "generate_prompts":
            return await self._generate_prompts(context)
        elif action == "redline_check":
            return await self._redline_check(context)
        else:
            return AgentResult(
                success=False,
                error=f"未知操作: {action}",
            )

    async def _design_scenes(self, context: Dict[str, Any]) -> AgentResult:
        try:
            script_content = context.get("script_content", "")
            style_preset = context.get("style_preset", "anime")

            scenes = self._parse_scenes(script_content)
            designs = self._generate_scene_designs(scenes, style_preset)

            return AgentResult(
                success=True,
                data={
                    "scenes": designs,
                    "style_preset": style_preset,
                    "total_scenes": len(designs),
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    def _parse_scenes(self, script_content: str) -> List[Dict]:
        lines = script_content.split("\n")
        scenes = []
        current_scene = None

        for line in lines:
            if line.startswith("### "):
                if current_scene:
                    scenes.append(current_scene)
                parts = line[4:].split(": ")
                current_scene = {"scene_id": parts[0].strip(), "location": parts[1].strip() if len(parts) > 1 else ""}
            elif current_scene:
                if "**时间**:" in line:
                    current_scene["time_of_day"] = line.split(":")[1].strip()
                elif "**地点**:" in line:
                    current_scene["location_detail"] = line.split(":")[1].strip()
                elif "**人物**:" in line:
                    current_scene["characters"] = [c.strip() for c in line.split(":")[1].split("、")]
                elif line.strip() and not line.startswith("**"):
                    current_scene["description"] = current_scene.get("description", "") + line.strip() + " "

        if current_scene:
            scenes.append(current_scene)

        return scenes

    def _generate_scene_designs(self, scenes: List[Dict], style_preset: str) -> List[Dict]:
        environment_templates = {
            "anime": {
                "lighting": ["柔和的自然光", "温暖的夕阳光", "神秘的月光", "明亮的室内光"],
                "atmosphere": ["宁静", "浪漫", "紧张", "温馨"],
                "elements": ["樱花树", "日式房屋", "动漫风格建筑", "梦幻天空"],
            },
            "realistic": {
                "lighting": ["写实自然光", "电影级布光", "阴天柔和光", "室内暖光"],
                "atmosphere": ["真实", "紧张", "温馨", "压抑"],
                "elements": ["现代建筑", "自然景观", "城市街道", "室内场景"],
            },
            "cyberpunk": {
                "lighting": ["霓虹灯光", "全息投影光", "雨夜反光", "昏暗室内光"],
                "atmosphere": ["赛博朋克", "未来感", "阴暗", "繁华"],
                "elements": ["霓虹灯", "高楼大厦", "飞行汽车", "全息广告"],
            },
            "chinese_style": {
                "lighting": ["古风灯笼光", "柔和自然光", "烛光", "月光"],
                "atmosphere": ["古典", "宁静", "神秘", "壮丽"],
                "elements": ["古建筑", "山水风景", "竹林", "庭院"],
            },
        }

        templates = environment_templates.get(style_preset, environment_templates["anime"])
        designs = []

        for i, scene in enumerate(scenes):
            design = {
                "scene_id": scene.get("scene_id", f"scene_{i+1}"),
                "location": scene.get("location", ""),
                "location_detail": scene.get("location_detail", ""),
                "time_of_day": scene.get("time_of_day", "白天"),
                "lighting": templates["lighting"][i % len(templates["lighting"])],
                "atmosphere": templates["atmosphere"][i % len(templates["atmosphere"])],
                "environment_elements": templates["elements"][i % len(templates["elements"])],
                "style_preset": style_preset,
                "characters": scene.get("characters", []),
                "prompt": self._build_prompt(scene, style_preset),
                "negative_prompt": "人物, 角色, 人物描述",
            }
            designs.append(design)

        return designs

    def _build_prompt(self, scene: Dict, style_preset: str) -> str:
        return f"{style_preset}风格场景, {scene.get('location', '')}, {scene.get('time_of_day', '')}, {scene.get('lighting', '')}, {scene.get('atmosphere', '')}, 高质量, 精细细节, 8k分辨率"

    async def _generate_prompts(self, context: Dict[str, Any]) -> AgentResult:
        try:
            scenes = context.get("scenes", [])
            style_preset = context.get("style_preset", "anime")

            prompts = []
            for scene in scenes:
                prompt = {
                    "scene_id": scene.get("scene_id", ""),
                    "location": scene.get("location", ""),
                    "positive_prompt": self._build_prompt(scene, style_preset),
                    "negative_prompt": "人物, 角色, 人物描述",
                }
                prompts.append(prompt)

            return AgentResult(
                success=True,
                data={
                    "prompts": prompts,
                    "style_preset": style_preset,
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _redline_check(self, context: Dict[str, Any]) -> AgentResult:
        try:
            prompt = context.get("prompt", "")
            forbidden_words = ["人物", "角色", "男人", "女人", "男孩", "女孩", "穿着", "表情", "动作"]

            violations = [word for word in forbidden_words if word in prompt]

            return AgentResult(
                success=True,
                data={
                    "is_valid": len(violations) == 0,
                    "violations": violations,
                    "message": "通过红线校验" if len(violations) == 0 else f"检测到人物词汇: {', '.join(violations)}",
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
        valid_actions = ["design", "generate_prompts", "redline_check"]
        if action not in valid_actions:
            errors.append(f"无效的 action: {action}")

        if action == "design":
            if "script_content" not in data:
                errors.append("缺少 script_content")

        if action == "generate_prompts":
            if "scenes" not in data:
                errors.append("缺少 scenes")

        if action == "redline_check":
            if "prompt" not in data:
                errors.append("缺少 prompt")

        if errors:
            return {"valid": False, "errors": errors}
        return {"valid": True}