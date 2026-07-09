from typing import Dict, Any, List


class WorkflowTemplate:
    def __init__(self, id: str, name: str, description: str, category: str,
                 nodes: List[Dict], edges: List[Dict], config: Dict = None):
        self.id = id
        self.name = name
        self.description = description
        self.category = category
        self.nodes = nodes
        self.edges = edges
        self.config = config or {}


class TemplateManager:
    TEMPLATES: List[WorkflowTemplate] = [
        WorkflowTemplate(
            id="short_drama_basic",
            name="短剧基础模板",
            description="适合制作5-15分钟的短视频剧情片，包含完整的剧本创作、角色设计、场景设计、视频生成和剪辑流程",
            category="short_drama",
            nodes=[
                {"id": "script", "type": "screenwriter", "label": "剧本创作", "position": {"x": 100, "y": 200}},
                {"id": "characters", "type": "character_designer", "label": "角色设计", "position": {"x": 400, "y": 100}},
                {"id": "scenes", "type": "scene_designer", "label": "场景设计", "position": {"x": 400, "y": 300}},
                {"id": "images", "type": "image_generator", "label": "图像生成", "position": {"x": 700, "y": 200}},
                {"id": "video", "type": "video_generator", "label": "视频生成", "position": {"x": 1000, "y": 200}},
                {"id": "audio", "type": "audio_producer", "label": "音频制作", "position": {"x": 1000, "y": 400}},
                {"id": "edit", "type": "editor", "label": "剪辑合成", "position": {"x": 1300, "y": 300}},
            ],
            edges=[
                {"source": "script", "target": "characters"},
                {"source": "script", "target": "scenes"},
                {"source": "characters", "target": "images"},
                {"source": "scenes", "target": "images"},
                {"source": "images", "target": "video"},
                {"source": "video", "target": "edit"},
                {"source": "audio", "target": "edit"},
            ],
            config={"style_preset": "anime", "aspect_ratio": "16:9", "target_duration": 5},
        ),
        WorkflowTemplate(
            id="promotion_video",
            name="宣发视频模板",
            description="快速制作产品宣传、活动推广等短视频，流程简洁高效",
            category="promotion",
            nodes=[
                {"id": "concept", "type": "screenwriter", "label": "创意文案", "position": {"x": 100, "y": 200}},
                {"id": "images", "type": "image_generator", "label": "素材生成", "position": {"x": 400, "y": 200}},
                {"id": "video", "type": "video_generator", "label": "视频生成", "position": {"x": 700, "y": 200}},
                {"id": "audio", "type": "audio_producer", "label": "背景音乐", "position": {"x": 700, "y": 400}},
                {"id": "edit", "type": "editor", "label": "剪辑包装", "position": {"x": 1000, "y": 300}},
                {"id": "promo", "type": "promotion", "label": "宣发生成", "position": {"x": 1300, "y": 300}},
            ],
            edges=[
                {"source": "concept", "target": "images"},
                {"source": "images", "target": "video"},
                {"source": "video", "target": "edit"},
                {"source": "audio", "target": "edit"},
                {"source": "edit", "target": "promo"},
            ],
            config={"style_preset": "realistic", "aspect_ratio": "9:16", "target_duration": 15},
        ),
        WorkflowTemplate(
            id="documentary",
            name="纪录片模板",
            description="制作纪实风格的纪录片，注重真实感和叙事节奏",
            category="documentary",
            nodes=[
                {"id": "outline", "type": "screenwriter", "label": "大纲策划", "position": {"x": 100, "y": 200}},
                {"id": "scenes", "type": "scene_designer", "label": "场景设计", "position": {"x": 400, "y": 200}},
                {"id": "video", "type": "video_generator", "label": "素材拍摄", "position": {"x": 700, "y": 200}},
                {"id": "narrator", "type": "audio_producer", "label": "旁白配音", "position": {"x": 700, "y": 400}},
                {"id": "bgm", "type": "audio_producer", "label": "背景音乐", "position": {"x": 700, "y": 500}},
                {"id": "edit", "type": "editor", "label": "后期剪辑", "position": {"x": 1000, "y": 350}},
            ],
            edges=[
                {"source": "outline", "target": "scenes"},
                {"source": "scenes", "target": "video"},
                {"source": "video", "target": "edit"},
                {"source": "narrator", "target": "edit"},
                {"source": "bgm", "target": "edit"},
            ],
            config={"style_preset": "realistic", "aspect_ratio": "16:9", "target_duration": 30},
        ),
        WorkflowTemplate(
            id="animation_series",
            name="动画剧集模板",
            description="制作系列动画剧集，支持多集连续创作",
            category="animation",
            nodes=[
                {"id": "script", "type": "screenwriter", "label": "剧本创作", "position": {"x": 100, "y": 200}},
                {"id": "characters", "type": "character_designer", "label": "角色设计", "position": {"x": 400, "y": 100}},
                {"id": "scenes", "type": "scene_designer", "label": "场景设计", "position": {"x": 400, "y": 300}},
                {"id": "storyboard", "type": "storyboard", "label": "分镜设计", "position": {"x": 700, "y": 200}},
                {"id": "images", "type": "image_generator", "label": "帧生成", "position": {"x": 1000, "y": 100}},
                {"id": "video", "type": "video_generator", "label": "动画合成", "position": {"x": 1000, "y": 300}},
                {"id": "audio", "type": "audio_producer", "label": "配音配乐", "position": {"x": 1300, "y": 200}},
                {"id": "edit", "type": "editor", "label": "剪辑成片", "position": {"x": 1600, "y": 200}},
            ],
            edges=[
                {"source": "script", "target": "characters"},
                {"source": "script", "target": "scenes"},
                {"source": "script", "target": "storyboard"},
                {"source": "characters", "target": "images"},
                {"source": "scenes", "target": "images"},
                {"source": "storyboard", "target": "video"},
                {"source": "images", "target": "video"},
                {"source": "video", "target": "edit"},
                {"source": "audio", "target": "edit"},
            ],
            config={"style_preset": "anime", "aspect_ratio": "16:9", "target_duration": 20},
        ),
        WorkflowTemplate(
            id="commercial_ad",
            name="商业广告模板",
            description="制作产品广告、品牌宣传片等商业视频",
            category="commercial",
            nodes=[
                {"id": "brief", "type": "screenwriter", "label": "创意简报", "position": {"x": 100, "y": 200}},
                {"id": "concept", "type": "screenwriter", "label": "脚本创作", "position": {"x": 300, "y": 200}},
                {"id": "characters", "type": "character_designer", "label": "人物设计", "position": {"x": 500, "y": 100}},
                {"id": "scenes", "type": "scene_designer", "label": "场景设计", "position": {"x": 500, "y": 300}},
                {"id": "images", "type": "image_generator", "label": "视觉素材", "position": {"x": 800, "y": 200}},
                {"id": "video", "type": "video_generator", "label": "视频制作", "position": {"x": 1100, "y": 200}},
                {"id": "audio", "type": "audio_producer", "label": "音效配乐", "position": {"x": 1100, "y": 400}},
                {"id": "edit", "type": "editor", "label": "后期精剪", "position": {"x": 1400, "y": 300}},
                {"id": "promo", "type": "promotion", "label": "多平台分发", "position": {"x": 1700, "y": 300}},
            ],
            edges=[
                {"source": "brief", "target": "concept"},
                {"source": "concept", "target": "characters"},
                {"source": "concept", "target": "scenes"},
                {"source": "characters", "target": "images"},
                {"source": "scenes", "target": "images"},
                {"source": "images", "target": "video"},
                {"source": "video", "target": "edit"},
                {"source": "audio", "target": "edit"},
                {"source": "edit", "target": "promo"},
            ],
            config={"style_preset": "realistic", "aspect_ratio": "16:9", "target_duration": 30},
        ),
    ]

    @classmethod
    def get_all_templates(cls) -> List[Dict[str, Any]]:
        return [
            {
                "id": t.id,
                "name": t.name,
                "description": t.description,
                "category": t.category,
                "node_count": len(t.nodes),
                "edge_count": len(t.edges),
                "config": t.config,
            }
            for t in cls.TEMPLATES
        ]

    @classmethod
    def get_template_by_id(cls, template_id: str) -> WorkflowTemplate | None:
        return next((t for t in cls.TEMPLATES if t.id == template_id), None)

    @classmethod
    def get_templates_by_category(cls, category: str) -> List[Dict[str, Any]]:
        return cls.get_all_templates() if category == "all" else [
            t for t in cls.get_all_templates() if t["category"] == category
        ]

    @classmethod
    def recommend_templates(cls, project_type: str = None, duration: int = None) -> List[Dict[str, Any]]:
        templates = cls.get_all_templates()

        if project_type:
            templates = [t for t in templates if t["category"] == project_type]

        if duration:
            def match_duration(t):
                target = t["config"].get("target_duration", 5)
                return abs(duration - target) <= 10

            templates = [t for t in templates if match_duration(t)]

        return templates

    @classmethod
    def apply_template(cls, project_id: str, template_id: str) -> Dict[str, Any]:
        template = cls.get_template_by_id(template_id)
        if not template:
            return {"success": False, "error": f"模板不存在: {template_id}"}

        canvas_data = {
            "project_id": project_id,
            "template_id": template_id,
            "nodes": template.nodes,
            "edges": template.edges,
            "config": template.config,
        }

        return {"success": True, "data": canvas_data}


template_manager = TemplateManager()