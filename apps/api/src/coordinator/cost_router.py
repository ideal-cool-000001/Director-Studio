# ═══════════════════════════════════════════
# 成本感知路由器
# 三档模型路由 + 预算阈值 + 自动降级
# ═══════════════════════════════════════════

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ModelOption:
    """模型选项"""
    name: str
    cost_per_call: float  # ¥ 每次调用
    quality: str  # draft / standard / premium
    latency_seconds: float  # 预计耗时


# 模型路由表
MODEL_ROUTING_TABLE: dict[str, list[ModelOption]] = {
    "llm": [
        ModelOption("gpt-4o-mini", 0.01, "draft", 2),
        ModelOption("qwen-2.5-72b", 0.05, "standard", 3),
        ModelOption("gpt-4o", 0.15, "premium", 5),
    ],
    "image": [
        ModelOption("wan-2.6-draft", 1.0, "draft", 10),
        ModelOption("flux-2", 3.0, "standard", 20),
        ModelOption("flux-2-hq", 8.0, "premium", 30),
    ],
    "video": [
        ModelOption("kling-fast", 5.0, "draft", 60),
        ModelOption("kling-pro", 15.0, "standard", 120),
        ModelOption("seedance-2.0", 50.0, "premium", 180),
    ],
    "tts": [
        ModelOption("cosyvoice", 0.5, "draft", 5),
        ModelOption("fish-audio", 1.5, "standard", 8),
        ModelOption("elevenlabs", 5.0, "premium", 10),
    ],
    "bgm": [
        ModelOption("musicgen", 0.5, "draft", 15),
        ModelOption("stable-audio", 2.0, "standard", 30),
        ModelOption("stable-audio-pro", 5.0, "premium", 45),
    ],
}


class CostTracker:
    """成本追踪器"""

    def __init__(self, budget_limit: float):
        self.budget_limit = budget_limit
        self.current_cost = 0.0
        self._cost_log: list[dict] = []

    def add_cost(self, amount: float, category: str, node_id: str) -> None:
        """记录一笔成本"""
        self.current_cost += amount
        self._cost_log.append({
            "amount": amount,
            "category": category,
            "node_id": node_id,
            "running_total": self.current_cost,
        })

    def check_budget_threshold(self) -> Optional[str]:
        """检查预算阈值"""
        if self.budget_limit <= 0:
            return None
        usage = self.current_cost / self.budget_limit
        if usage >= 1.0:
            return "critical"
        elif usage >= 0.8:
            return "warning"
        return None

    @property
    def usage_ratio(self) -> float:
        if self.budget_limit <= 0:
            return 0.0
        return self.current_cost / self.budget_limit


class CostAwareRouter:
    """成本感知路由器 — 根据预算和质量档位选择最优模型"""

    def __init__(self, cost_tracker: CostTracker):
        self.tracker = cost_tracker

    def select_model(
        self,
        task_type: str,
        quality_level: str = "standard",
    ) -> ModelOption:
        """选择模型"""
        options = MODEL_ROUTING_TABLE.get(task_type, [])
        if not options:
            raise ValueError(f"未知的任务类型: {task_type}")

        # 检查预算阈值，自动降级
        threshold = self.tracker.check_budget_threshold()
        if threshold == "critical":
            # 预算耗尽，选最便宜的
            return min(options, key=lambda o: o.cost_per_call)
        elif threshold == "warning":
            # 预算警告，最高选 standard
            quality_level = min(quality_level, "standard", key=lambda q: ["draft", "standard", "premium"].index(q))

        # 匹配质量档位
        for option in options:
            if option.quality == quality_level:
                return option

        # 回退到第一个
        return options[0]

    def estimate_cost(self, task_type: str, quality_level: str = "standard") -> float:
        """估算单次调用成本"""
        model = self.select_model(task_type, quality_level)
        return model.cost_per_call
