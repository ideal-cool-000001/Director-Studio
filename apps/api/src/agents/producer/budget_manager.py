from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional


BUDGET_ALLOCATION = {
    "script": 0.05,
    "character_design": 0.05,
    "scene_design": 0.05,
    "storyboard": 0.05,
    "image_generation": 0.15,
    "video_generation": 0.30,
    "audio_production": 0.10,
    "editing": 0.15,
    "promotion": 0.10,
}


@dataclass
class CostRecord:
    agent_type: str
    node_id: str
    task_id: str
    estimated_cost: float
    actual_cost: float
    model_used: str
    token_usage: Dict[str, int] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class BudgetAllocation:
    agent_type: str
    category_name: str
    percentage: float
    allocated_amount: float
    spent_amount: float = 0.0
    remaining_amount: float = 0.0


class BudgetManager:
    def __init__(self, total_budget: float):
        self.total_budget = total_budget
        self.allocations: Dict[str, BudgetAllocation] = {}
        self.cost_records: List[CostRecord] = []
        self._initialize_allocations()

    def _initialize_allocations(self):
        category_names = {
            "script": "编剧创作",
            "character_design": "角色设计",
            "scene_design": "场景设计",
            "storyboard": "分镜编排",
            "image_generation": "图像生成",
            "video_generation": "视频生成",
            "audio_production": "音频制作",
            "editing": "后期剪辑",
            "promotion": "宣发推广",
        }
        for agent_type, percentage in BUDGET_ALLOCATION.items():
            allocated = self.total_budget * percentage
            self.allocations[agent_type] = BudgetAllocation(
                agent_type=agent_type,
                category_name=category_names.get(agent_type, agent_type),
                percentage=percentage,
                allocated_amount=allocated,
                spent_amount=0.0,
                remaining_amount=allocated,
            )

    def record_cost(self, record: CostRecord) -> None:
        self.cost_records.append(record)
        if record.agent_type in self.allocations:
            allocation = self.allocations[record.agent_type]
            allocation.spent_amount += record.actual_cost
            allocation.remaining_amount -= record.actual_cost

    def get_allocation(self, agent_type: str) -> Optional[BudgetAllocation]:
        return self.allocations.get(agent_type)

    def get_total_spent(self) -> float:
        return sum(alloc.spent_amount for alloc in self.allocations.values())

    def get_total_remaining(self) -> float:
        return self.total_budget - self.get_total_spent()

    def get_spent_percentage(self) -> float:
        if self.total_budget <= 0:
            return 0.0
        return (self.get_total_spent() / self.total_budget) * 100

    def check_budget_warning(self) -> Optional[str]:
        percentage = self.get_spent_percentage()
        if percentage >= 100:
            return "budget_exceeded"
        elif percentage >= 80:
            return "budget_warning"
        return None

    def adjust_allocation(self, agent_type: str, new_percentage: float) -> bool:
        if agent_type not in self.allocations:
            return False
        if new_percentage < 0 or new_percentage > 1:
            return False

        old_allocation = self.allocations[agent_type]
        old_amount = old_allocation.allocated_amount
        new_amount = self.total_budget * new_percentage
        difference = new_amount - old_amount

        self.allocations[agent_type] = BudgetAllocation(
            agent_type=agent_type,
            category_name=old_allocation.category_name,
            percentage=new_percentage,
            allocated_amount=new_amount,
            spent_amount=old_allocation.spent_amount,
            remaining_amount=new_amount - old_allocation.spent_amount,
        )

        other_total = 1.0 - new_percentage
        other_count = len(self.allocations) - 1
        if other_count > 0 and other_total > 0:
            other_percentage = other_total / other_count
            for key, alloc in self.allocations.items():
                if key != agent_type:
                    alloc.percentage = other_percentage
                    alloc.allocated_amount = self.total_budget * other_percentage
                    alloc.remaining_amount = alloc.allocated_amount - alloc.spent_amount

        return True

    def get_summary(self) -> Dict:
        return {
            "total_budget": self.total_budget,
            "total_spent": self.get_total_spent(),
            "total_remaining": self.get_total_remaining(),
            "spent_percentage": self.get_spent_percentage(),
            "budget_status": self.check_budget_warning(),
            "allocations": [
                {
                    "agent_type": alloc.agent_type,
                    "category_name": alloc.category_name,
                    "percentage": alloc.percentage,
                    "allocated_amount": alloc.allocated_amount,
                    "spent_amount": alloc.spent_amount,
                    "remaining_amount": alloc.remaining_amount,
                }
                for alloc in self.allocations.values()
            ],
        }