from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class HighlightSegment:
    segment_id: str
    start_time: float
    end_time: float
    duration: float
    description: str
    platform: str
    priority: int = 1


@dataclass
class PromoContent:
    platform: str
    title: str
    copy: str
    hashtags: List[str]
    duration: float
    highlight_segment: HighlightSegment


class ClipExtractor:
    def __init__(self):
        self.platform_configs = {
            "douyin": {"min_duration": 15, "max_duration": 60, "style": "fast_paced"},
            "kuaishou": {"min_duration": 15, "max_duration": 60, "style": "fast_paced"},
            "bilibili": {"min_duration": 60, "max_duration": 300, "style": "detailed"},
            "xiaohongshu": {"min_duration": 30, "max_duration": 90, "style": "elegant"},
            "weibo": {"min_duration": 15, "max_duration": 30, "style": "viral"},
        }

    def extract_highlights(self, video_title: str, synopsis: str, key_scenes: List[Dict], count: int = 3) -> List[HighlightSegment]:
        highlights = []

        for i, scene in enumerate(key_scenes[:count]):
            platform = self._select_platform(i)
            duration = self._calculate_duration(platform, scene.get("importance", 5))

            segment = HighlightSegment(
                segment_id=f"highlight_{i+1}",
                start_time=scene.get("start_time", i * 60),
                end_time=scene.get("end_time", (i + 1) * 60),
                duration=duration,
                description=scene.get("description", ""),
                platform=platform,
                priority=scene.get("importance", 5),
            )
            highlights.append(segment)

        highlights.sort(key=lambda x: x.priority, reverse=True)
        return highlights

    def _select_platform(self, index: int) -> str:
        platforms = ["douyin", "bilibili", "xiaohongshu", "weibo", "kuaishou"]
        return platforms[index % len(platforms)]

    def _calculate_duration(self, platform: str, importance: int) -> float:
        config = self.platform_configs.get(platform, self.platform_configs["douyin"])
        base_duration = (config["min_duration"] + config["max_duration"]) / 2
        return base_duration * (0.8 + importance * 0.04)

    def generate_promo_content(self, video_title: str, highlight: HighlightSegment) -> PromoContent:
        config = self.platform_configs.get(highlight.platform, self.platform_configs["douyin"])

        title = self._generate_title(video_title, highlight.description, highlight.platform)
        copy = self._generate_copy(highlight.description, config["style"])
        hashtags = self._generate_hashtags(video_title, highlight.description)

        return PromoContent(
            platform=highlight.platform,
            title=title,
            copy=copy,
            hashtags=hashtags,
            duration=highlight.duration,
            highlight_segment=highlight,
        )

    def _generate_title(self, video_title: str, description: str, platform: str) -> str:
        title_patterns = {
            "douyin": f"{video_title[:10]}... #高能片段",
            "bilibili": f"【深度解析】{video_title} - {description[:20]}",
            "xiaohongshu": f"{video_title} | {description[:15]}",
            "weibo": f"震惊！{video_title[:15]}",
            "kuaishou": f"{video_title[:10]} #精彩片段",
        }
        return title_patterns.get(platform, video_title)

    def _generate_copy(self, description: str, style: str) -> str:
        style_patterns = {
            "fast_paced": f"🔥 {description}！精彩不容错过！#影视推荐",
            "detailed": f"深入解析：{description}\n更多精彩内容请观看正片！",
            "elegant": f"✨ {description}\n感受影视之美 💕",
            "viral": f"OMG！{description}！速看！",
        }
        return style_patterns.get(style, description)

    def _generate_hashtags(self, video_title: str, description: str) -> List[str]:
        hashtags = []
        keywords = ["影视", "推荐", "精彩", "高能", "剪辑"]
        hashtags.extend([f"#{kw}" for kw in keywords[:3]])

        for kw in ["电影", "剧集", "短剧", "动画"]:
            if kw in video_title or kw in description:
                hashtags.append(f"#{kw}")
                break

        return hashtags[:5]

    def batch_generate(self, video_title: str, synopsis: str, key_scenes: List[Dict]) -> List[PromoContent]:
        results = []
        highlights = self.extract_highlights(video_title, synopsis, key_scenes, count=5)

        for highlight in highlights:
            promo = self.generate_promo_content(video_title, highlight)
            results.append(promo)

        return results