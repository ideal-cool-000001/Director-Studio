from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Optional


@dataclass
class ReviewResult:
    node_id: str
    agent_type: str
    decision: str
    feedback: str = ""
    quality_score: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)


class ReviewEngine:
    def __init__(self):
        self.review_history: Dict[str, ReviewResult] = {}

    def review(self, node_id: str, agent_type: str, content_summary: str, quality_score: float) -> ReviewResult:
        if quality_score >= 0.8:
            decision = "approve"
            feedback = "质量优秀，通过审核"
        elif quality_score >= 0.5:
            decision = "modify"
            feedback = "需要修改优化，请参考建议"
        else:
            decision = "reject"
            feedback = "未达到质量要求，需要重新生成"

        result = ReviewResult(
            node_id=node_id,
            agent_type=agent_type,
            decision=decision,
            feedback=feedback,
            quality_score=quality_score,
        )

        self.review_history[node_id] = result
        return result

    def get_review_history(self, node_id: Optional[str] = None) -> Dict[str, ReviewResult]:
        if node_id:
            return {node_id: self.review_history.get(node_id)} if node_id in self.review_history else {}
        return self.review_history

    def auto_approve(self, node_id: str, agent_type: str, quality_score: float) -> bool:
        return quality_score >= 0.8

    def requires_human_review(self, quality_score: float) -> bool:
        return quality_score < 0.8

    def calculate_quality_score(self, criteria: Dict[str, float]) -> float:
        weights = {
            "creativity": 0.3,
            "technical": 0.3,
            "consistency": 0.2,
            "feasibility": 0.2,
        }

        score = 0.0
        total_weight = 0.0

        for criterion, weight in weights.items():
            if criterion in criteria:
                score += criteria[criterion] * weight
                total_weight += weight

        if total_weight == 0:
            return 0.5
        return score / total_weight