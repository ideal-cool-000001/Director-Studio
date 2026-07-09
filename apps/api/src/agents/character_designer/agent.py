from typing import Dict, Any, List

from src.agents.base_agent import BaseAgent, AgentResult


class CharacterDesignerAgent(BaseAgent):
    agent_type: str = "character_designer"
    description: str = "形象设计Agent：拆解剧本来设计角色形象"

    ROLE_LEVELS = {
        "主角": {"priority": 1, "detail_level": "high", "design_weight": 1.0},
        "配角": {"priority": 2, "detail_level": "medium", "design_weight": 0.7},
        "龙套": {"priority": 3, "detail_level": "low", "design_weight": 0.3},
    }

    async def execute(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        action = context.get("action", "design")

        if action == "design":
            return await self._design_characters(context)
        elif action == "generate_prompts":
            return await self._generate_prompts(context)
        elif action == "check_consistency":
            return await self._check_consistency(context)
        elif action == "classify_characters":
            return await self._classify_characters(context)
        else:
            return AgentResult(
                success=False,
                error=f"未知操作: {action}",
            )

    async def _design_characters(self, context: Dict[str, Any]) -> AgentResult:
        try:
            script_content = context.get("script_content", "")
            style_preset = context.get("style_preset", "anime")
            character_list = context.get("characters", [])

            if script_content:
                characters = self._parse_characters(script_content)
            elif character_list:
                characters = character_list
            else:
                return AgentResult(
                    success=False,
                    error="缺少 script_content 或 characters",
                )

            if not context.get("skip_classification", False):
                classified = self._classify_characters_internal(characters)
            else:
                classified = characters

            designs = self._generate_designs(classified, style_preset)

            return AgentResult(
                success=True,
                data={
                    "characters": designs,
                    "style_preset": style_preset,
                    "total_characters": len(designs),
                    "main_characters": [c for c in designs if c.get("role_level") == "主角"],
                    "supporting_characters": [c for c in designs if c.get("role_level") == "配角"],
                    "extra_characters": [c for c in designs if c.get("role_level") == "龙套"],
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    def _parse_characters(self, script_content: str) -> List[Dict]:
        lines = script_content.split("\n")
        characters = []
        current_char = None

        for line in lines:
            if line.startswith("- ") and ":" in line:
                parts = line[2:].split(":", 1)
                if len(parts) == 2:
                    name = parts[0].strip()
                    description = parts[1].strip()
                    current_char = {"name": name, "description": description, "details": {}}
                    characters.append(current_char)
            elif current_char and line.strip():
                if ":" in line:
                    key, value = line.strip().split(":", 1)
                    current_char["details"][key.strip()] = value.strip()
                else:
                    current_char["details"][line.strip()] = ""

        return characters

    def _classify_characters_internal(self, characters: List[Dict]) -> List[Dict]:
        dialogue_counts = {}

        for char in characters:
            name = char.get("name", "")
            dialogue_counts[name] = char.get("details", {}).get("dialogue_count", 0)

        sorted_names = sorted(dialogue_counts.keys(), key=lambda x: dialogue_counts[x], reverse=True)

        total_chars = len(characters)
        main_count = max(1, min(2, total_chars // 3))
        supporting_count = max(2, min(4, total_chars // 2))

        classified = []
        for i, char in enumerate(characters):
            name = char.get("name", "")
            if name in sorted_names[:main_count]:
                char["role_level"] = "主角"
                char["role_priority"] = 1
            elif name in sorted_names[main_count:main_count + supporting_count]:
                char["role_level"] = "配角"
                char["role_priority"] = 2
            else:
                char["role_level"] = "龙套"
                char["role_priority"] = 3

            classified.append(char)

        return classified

    async def _classify_characters(self, context: Dict[str, Any]) -> AgentResult:
        try:
            characters = context.get("characters", [])
            script_content = context.get("script_content", "")

            if script_content:
                characters = self._parse_characters(script_content)

            classified = self._classify_characters_internal(characters)

            return AgentResult(
                success=True,
                data={
                    "characters": classified,
                    "main_count": sum(1 for c in classified if c.get("role_level") == "主角"),
                    "supporting_count": sum(1 for c in classified if c.get("role_level") == "配角"),
                    "extra_count": sum(1 for c in classified if c.get("role_level") == "龙套"),
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    def _generate_designs(self, characters: List[Dict], style_preset: str) -> List[Dict]:
        style_templates = {
            "anime": {
                "hair_styles": ["黑色长发", "蓝色短发", "金色波浪", "粉色双马尾", "紫色长发", "绿色短发"],
                "hair_colors": ["黑色", "蓝色", "金色", "粉色", "棕色", "紫色", "银色", "绿色"],
                "eye_colors": ["蓝色", "绿色", "紫色", "红色", "棕色", "金色"],
                "clothing_main": ["华丽校服", "精致和服", "魔法少女装", "时尚休闲装", "骑士铠甲", "古风华服"],
                "clothing_supporting": ["校服", "和服", "休闲装", "运动服", "日常装"],
                "clothing_extra": ["简单便装", "普通制服", "基础服装"],
                "props_main": ["魔法道具", "武器", "饰品", "背包"],
                "props_supporting": ["书籍", "配饰", "小型道具"],
                "props_extra": [],
            },
            "realistic": {
                "hair_styles": ["利落短发", "中长发", "卷发", "光头", "波浪发", "直发"],
                "hair_colors": ["黑色", "棕色", "金色", "灰色", "深棕色", "浅棕色"],
                "eye_colors": ["棕色", "蓝色", "绿色", "灰色", "褐色"],
                "clothing_main": ["高级西装", "定制礼服", "职业套装", "时尚休闲"],
                "clothing_supporting": ["西装", "休闲服", "运动服", "职业装"],
                "clothing_extra": ["普通服装", "基础便装"],
                "props_main": ["公文包", "手表", "首饰", "手提袋"],
                "props_supporting": ["手机", "钱包", "钥匙"],
                "props_extra": [],
            },
            "cyberpunk": {
                "hair_styles": ["荧光色短发", "莫霍克", "机械义体", "光头", "长直发", "渐变发色"],
                "hair_colors": ["荧光绿", "荧光粉", "荧光蓝", "银色", "黑色", "紫色"],
                "eye_colors": ["红色", "黄色", "蓝色", "紫色", "白色", "绿色"],
                "clothing_main": ["定制皮质风衣", "高级机械装甲", "霓虹战斗服", "全息投影衣"],
                "clothing_supporting": ["皮质风衣", "机械装甲", "霓虹服饰", "街头风格"],
                "clothing_extra": ["基础街头装", "普通工装"],
                "props_main": ["机械义肢", "能量武器", "神经接口", "全息眼镜"],
                "props_supporting": ["智能手表", "通讯器", "武器配件"],
                "props_extra": [],
            },
            "chinese_style": {
                "hair_styles": ["长发束起", "发髻", "古装发饰", "辫子", "盘发", "半披发"],
                "hair_colors": ["黑色", "深棕色", "棕色", "白色", "银色"],
                "eye_colors": ["黑色", "棕色", "蓝色", "紫色", "深褐色"],
                "clothing_main": ["华丽汉服", "精致唐装", "高级武侠装", "宫廷华服"],
                "clothing_supporting": ["汉服", "唐装", "武侠装", "古风裙"],
                "clothing_extra": ["普通古装", "基础布衣"],
                "props_main": ["宝剑", "古琴", "折扇", "玉佩", "灯笼"],
                "props_supporting": ["笛子", "书卷", "茶杯"],
                "props_extra": [],
            },
        }

        templates = style_templates.get(style_preset, style_templates["anime"])
        designs = []

        for i, char in enumerate(characters):
            role_level = char.get("role_level", "配角")
            role_info = self.ROLE_LEVELS.get(role_level, self.ROLE_LEVELS["配角"])

            if role_level == "主角":
                clothing_options = templates.get("clothing_main", templates["clothing"])
                prop_options = templates.get("props_main", [])
            elif role_level == "配角":
                clothing_options = templates.get("clothing_supporting", templates["clothing"])
                prop_options = templates.get("props_supporting", [])
            else:
                clothing_options = templates.get("clothing_extra", templates["clothing"])
                prop_options = templates.get("props_extra", [])

            design = {
                "name": char.get("name", f"角色{i+1}"),
                "description": char.get("description", ""),
                "role_level": role_level,
                "role_priority": role_info["priority"],
                "style_preset": style_preset,
                "appearance": {
                    "hair_style": templates["hair_styles"][i % len(templates["hair_styles"])],
                    "hair_color": templates["hair_colors"][i % len(templates["hair_colors"])],
                    "eye_color": templates["eye_colors"][i % len(templates["eye_colors"])],
                    "height": f"{160 + i * 5}cm",
                    "body_type": ["苗条", "健壮", "中等", "丰满"][i % 4],
                    "face_shape": ["瓜子脸", "圆脸", "方脸", "长脸"][i % 4],
                    "skin_tone": ["白皙", "健康", "小麦色", "黝黑"][i % 4],
                },
                "clothing": {
                    "style": clothing_options[i % len(clothing_options)],
                    "colors": ["黑色", "白色", "红色", "蓝色", "紫色", "绿色"][i % 6],
                    "details": self._generate_clothing_details(role_level),
                },
                "props": prop_options[:2] if role_info["priority"] <= 2 else [],
                "prompt": self._build_prompt(char, style_preset, role_level),
                "negative_prompt": self._build_negative_prompt(role_level),
                "detail_level": role_info["detail_level"],
                "design_weight": role_info["design_weight"],
            }
            designs.append(design)

        return designs

    def _generate_clothing_details(self, role_level: str) -> str:
        if role_level == "主角":
            return "精致细节, 华丽装饰, 高品质面料, 独特设计"
        elif role_level == "配角":
            return "适中细节, 得体设计, 符合角色身份"
        else:
            return "简单设计, 基础款式"

    def _build_prompt(self, character: Dict, style_preset: str, role_level: str) -> str:
        role_info = self.ROLE_LEVELS.get(role_level, self.ROLE_LEVELS["配角"])

        base_prompt = f"{style_preset}风格角色, {character.get('name', '')}, {character.get('description', '')}"

        if role_level == "主角":
            base_prompt += ", 主角级精细刻画, 面部特写级细节, 8k超高清, 电影级质感"
        elif role_level == "配角":
            base_prompt += ", 中等细节, 高清画质, 专业级渲染"
        else:
            base_prompt += ", 基础细节, 清晰画质"

        base_prompt += ", 高质量, 精细细节"
        return base_prompt

    def _build_negative_prompt(self, role_level: str) -> str:
        if role_level == "主角":
            return "低质量, 模糊, 变形, 不完整, 粗糙, 像素化, 面部扭曲"
        else:
            return "低质量, 模糊, 变形, 不完整"

    async def _generate_prompts(self, context: Dict[str, Any]) -> AgentResult:
        try:
            characters = context.get("characters", [])
            style_preset = context.get("style_preset", "anime")

            prompts = []
            for char in characters:
                role_level = char.get("role_level", "配角")
                prompt = {
                    "character_name": char.get("name", ""),
                    "role_level": role_level,
                    "positive_prompt": self._build_prompt(char, style_preset, role_level),
                    "negative_prompt": self._build_negative_prompt(role_level),
                }
                prompts.append(prompt)

            return AgentResult(
                success=True,
                data={
                    "prompts": prompts,
                    "style_preset": style_preset,
                    "main_count": sum(1 for p in prompts if p["role_level"] == "主角"),
                    "supporting_count": sum(1 for p in prompts if p["role_level"] == "配角"),
                    "extra_count": sum(1 for p in prompts if p["role_level"] == "龙套"),
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _check_consistency(self, context: Dict[str, Any]) -> AgentResult:
        try:
            characters = context.get("characters", [])
            style_preset = context.get("style_preset", "anime")

            if not characters:
                return AgentResult(
                    success=True,
                    data={"consistency_report": {"style_preset": style_preset, "total_characters": 0, "consistent_characters": 0, "issues": []}},
                    cost=0.0,
                )

            style_keywords = {
                "anime": ["动漫", "二次元", "卡通", "日式", "萌", "Q版"],
                "realistic": ["写实", "真实", "逼真", "高清", "照片级", "真人"],
                "cyberpunk": ["赛博", "朋克", "未来", "霓虹灯", "机械", "科技"],
                "chinese_style": ["国风", "水墨", "古风", "汉服", "古典", "武侠"],
            }

            keywords = style_keywords.get(style_preset, [])
            issues = []
            consistent_count = 0

            for char in characters:
                prompt = char.get("prompt", "")
                matches = sum(1 for kw in keywords if kw in prompt)
                if matches >= 2:
                    consistent_count += 1
                elif matches == 1:
                    issues.append({
                        "character_name": char.get("name", ""),
                        "issue": "风格关键词不足",
                        "suggestion": f"建议在提示词中添加更多{style_preset}风格关键词",
                    })
                else:
                    issues.append({
                        "character_name": char.get("name", ""),
                        "issue": "未检测到风格关键词",
                        "suggestion": f"请添加{', '.join(keywords[:3])}等{style_preset}风格关键词",
                    })

            consistency_report = {
                "style_preset": style_preset,
                "total_characters": len(characters),
                "consistent_characters": consistent_count,
                "consistency_score": min(consistent_count / len(characters), 1.0),
                "is_consistent": consistent_count == len(characters),
                "issues": issues,
            }

            return AgentResult(
                success=True,
                data={"consistency_report": consistency_report},
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
        valid_actions = ["design", "generate_prompts", "check_consistency", "classify_characters"]
        if action not in valid_actions:
            errors.append(f"无效的 action: {action}")

        if action == "design":
            if "script_content" not in data and "characters" not in data:
                errors.append("缺少 script_content 或 characters")

        if action == "generate_prompts":
            if "characters" not in data:
                errors.append("缺少 characters")

        if action == "check_consistency":
            if "characters" not in data:
                errors.append("缺少 characters")

        if action == "classify_characters":
            if "script_content" not in data and "characters" not in data:
                errors.append("缺少 script_content 或 characters")

        if errors:
            return {"valid": False, "errors": errors}
        return {"valid": True}