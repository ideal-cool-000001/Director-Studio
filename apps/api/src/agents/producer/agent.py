from typing import Dict, Any
from datetime import datetime

from src.agents.base_agent import BaseAgent, AgentResult
from .budget_manager import BudgetManager, CostRecord, BUDGET_ALLOCATION
from .prompts import PRODUCER_SYSTEM_PROMPT, PRODUCER_BUDGET_REVIEW_PROMPT


class ProducerAgent(BaseAgent):
    agent_type: str = "producer"
    description: str = "制片人Agent：管理项目预算、分配资源和控制成本"

    def __init__(self):
        self.budget_managers: Dict[str, BudgetManager] = {}

    async def execute(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        project_id = context.get("project_id")
        action = context.get("action", "initialize")
        total_budget = context.get("total_budget", 10000.0)

        if action == "initialize":
            return await self._initialize_project(project_id, total_budget, context)
        elif action == "record_cost":
            return await self._record_cost(project_id, context)
        elif action == "get_summary":
            return await self._get_summary(project_id)
        elif action == "review_budget":
            return await self._review_budget(project_id, context)
        elif action == "adjust_allocation":
            return await self._adjust_allocation(project_id, context)
        else:
            return AgentResult(
                success=False,
                error=f"未知操作: {action}",
            )

    async def _initialize_project(self, project_id: str, total_budget: float, context: Dict[str, Any]) -> AgentResult:
        try:
            self.budget_managers[project_id] = BudgetManager(total_budget)
            summary = self.budget_managers[project_id].get_summary()

            project_name = context.get("project_name", "未命名项目")
            target_duration = context.get("target_duration", 10)
            quality_level = context.get("quality_level", "standard")

            return AgentResult(
                success=True,
                data={
                    "message": f"制片人已创建，预算分配完成",
                    "budget_summary": summary,
                    "project_info": {
                        "project_name": project_name,
                        "total_budget": total_budget,
                        "target_duration": target_duration,
                        "quality_level": quality_level,
                    },
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _record_cost(self, project_id: str, context: Dict[str, Any]) -> AgentResult:
        try:
            if project_id not in self.budget_managers:
                return AgentResult(
                    success=False,
                    error=f"项目未初始化: {project_id}",
                )

            record = CostRecord(
                agent_type=context["agent_type"],
                node_id=context["node_id"],
                task_id=context["task_id"],
                estimated_cost=context.get("estimated_cost", 0.0),
                actual_cost=context.get("actual_cost", 0.0),
                model_used=context.get("model_used", ""),
                token_usage=context.get("token_usage", {}),
                timestamp=datetime.now(),
            )

            self.budget_managers[project_id].record_cost(record)
            summary = self.budget_managers[project_id].get_summary()
            warning = summary.get("budget_status")

            return AgentResult(
                success=True,
                data={
                    "message": "成本记录已更新",
                    "budget_summary": summary,
                    "warning": warning,
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _get_summary(self, project_id: str) -> AgentResult:
        try:
            if project_id not in self.budget_managers:
                return AgentResult(
                    success=False,
                    error=f"项目未初始化: {project_id}",
                )

            summary = self.budget_managers[project_id].get_summary()
            return AgentResult(
                success=True,
                data={"budget_summary": summary},
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _review_budget(self, project_id: str, context: Dict[str, Any]) -> AgentResult:
        try:
            if project_id not in self.budget_managers:
                return AgentResult(
                    success=False,
                    error=f"项目未初始化: {project_id}",
                )

            manager = self.budget_managers[project_id]
            summary = manager.get_summary()

            allocations_summary = "\n".join([
                f"- {alloc['category_name']}: 分配¥{alloc['allocated_amount']:.2f}, 已用¥{alloc['spent_amount']:.2f}, 剩余¥{alloc['remaining_amount']:.2f}"
                for alloc in summary["allocations"]
            ])

            prompt = PRODUCER_BUDGET_REVIEW_PROMPT.format(
                project_name=context.get("project_name", "未命名项目"),
                total_budget=summary["total_budget"],
                total_spent=summary["total_spent"],
                spent_percentage=summary["spent_percentage"],
                allocations_summary=allocations_summary,
            )

            return AgentResult(
                success=True,
                data={
                    "budget_summary": summary,
                    "review_prompt": prompt,
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _adjust_allocation(self, project_id: str, context: Dict[str, Any]) -> AgentResult:
        try:
            if project_id not in self.budget_managers:
                return AgentResult(
                    success=False,
                    error=f"项目未初始化: {project_id}",
                )

            agent_type = context.get("agent_type")
            new_percentage = context.get("new_percentage")

            if not agent_type or new_percentage is None:
                return AgentResult(
                    success=False,
                    error="缺少必要参数: agent_type 或 new_percentage",
                )

            manager = self.budget_managers[project_id]
            success = manager.adjust_allocation(agent_type, new_percentage)

            if success:
                summary = manager.get_summary()
                return AgentResult(
                    success=True,
                    data={
                        "message": f"预算分配已调整：{agent_type} -> {new_percentage*100:.0f}%",
                        "budget_summary": summary,
                    },
                    cost=0.0,
                )
            else:
                return AgentResult(
                    success=False,
                    error="预算调整失败，请检查参数",
                )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        errors = []

        if "project_id" not in data:
            errors.append("缺少 project_id")

        action = data.get("action")
        if action not in ["initialize", "record_cost", "get_summary", "review_budget", "adjust_allocation"]:
            errors.append(f"无效的 action: {action}")

        if action == "initialize":
            if "total_budget" not in data:
                errors.append("缺少 total_budget")
            elif not isinstance(data["total_budget"], (int, float)) or data["total_budget"] <= 0:
                errors.append("total_budget 必须为正数")

        elif action == "record_cost":
            required_fields = ["agent_type", "node_id", "task_id", "actual_cost"]
            for field in required_fields:
                if field not in data:
                    errors.append(f"缺少 {field}")

        elif action == "adjust_allocation":
            if "agent_type" not in data:
                errors.append("缺少 agent_type")
            if "new_percentage" not in data:
                errors.append("缺少 new_percentage")
            elif not isinstance(data["new_percentage"], (int, float)) or data["new_percentage"] < 0 or data["new_percentage"] > 1:
                errors.append("new_percentage 必须在 0-1 之间")

        if errors:
            return {"valid": False, "errors": errors}
        return {"valid": True}