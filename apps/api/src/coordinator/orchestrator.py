import asyncio
import logging
from typing import Dict, Any, List, Optional
from uuid import uuid4

from src.agents.registry import AgentRegistry
from src.agents.base_agent import BaseAgent, AgentResult
from src.coordinator.cost_router import CostAwareRouter, CostTracker
from src.coordinator.dependency_engine import DependencyEngine, CircularDependencyError

logger = logging.getLogger(__name__)


class WorkflowOrchestrator:
    """工作流编排器 — 协调所有Agent的执行流程"""

    def __init__(self):
        self.agent_registry = AgentRegistry()
        self.active_projects: Dict[str, ProjectState] = {}

    async def create_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建项目并初始化制片人Agent"""
        project_id = str(uuid4())
        total_budget = project_data.get("budget", 1000.0)

        cost_tracker = CostTracker(total_budget)
        cost_router = CostAwareRouter(cost_tracker)

        project_state = ProjectState(
            project_id=project_id,
            name=project_data.get("name", "Untitled Project"),
            cost_tracker=cost_tracker,
            cost_router=cost_router,
        )

        producer_agent = self.agent_registry.create("producer")
        producer_result = await producer_agent.execute(
            node_id=f"producer_{project_id}",
            context={
                "action": "initialize",
                "project_name": project_data.get("name", "Untitled Project"),
                "total_budget": total_budget,
                "project_type": project_data.get("type", "short_drama"),
                "description": project_data.get("description", ""),
            },
        )

        if producer_result.success:
            project_state.producer_data = producer_result.data
            project_state.budget_allocations = producer_result.data.get("allocations", {})
        else:
            logger.error(f"Producer initialization failed: {producer_result.error}")

        self.active_projects[project_id] = project_state

        return {
            "project_id": project_id,
            "name": project_state.name,
            "producer_initialized": producer_result.success,
            "budget": total_budget,
            "allocations": project_state.budget_allocations,
        }

    async def execute_workflow(self, project_id: str, canvas_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行完整工作流"""
        if project_id not in self.active_projects:
            return {"error": f"项目不存在: {project_id}"}

        project_state = self.active_projects[project_id]

        try:
            dependency_engine = DependencyEngine()
            dependency_engine.build_from_edges(canvas_data.get("edges", []))

            if dependency_engine.detect_cycle():
                return {"error": "检测到循环依赖，请检查画布连接线"}

            parallel_groups = dependency_engine.get_parallel_groups()
            logger.info(f"执行顺序: {parallel_groups}")

            results: Dict[str, Any] = {}
            execution_log: List[Dict[str, Any]] = []

            for group_idx, group in enumerate(parallel_groups):
                logger.info(f"执行并行组 {group_idx + 1}: {group}")
                group_results = await self._execute_parallel_group(
                    project_state, group, canvas_data, results
                )
                results.update(group_results)

                for node_id, result in group_results.items():
                    execution_log.append({
                        "node_id": node_id,
                        "group": group_idx + 1,
                        "success": result.get("success", False),
                        "cost": result.get("cost", 0.0),
                    })

            return {
                "success": True,
                "project_id": project_id,
                "total_cost": project_state.cost_tracker.current_cost,
                "remaining_budget": project_state.cost_tracker.budget_limit - project_state.cost_tracker.current_cost,
                "execution_log": execution_log,
                "results": results,
            }

        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            return {"error": str(e)}

    async def _execute_parallel_group(
        self,
        project_state: "ProjectState",
        node_ids: List[str],
        canvas_data: Dict[str, Any],
        previous_results: Dict[str, Any],
    ) -> Dict[str, Any]:
        """执行并行节点组"""
        tasks = []

        for node_id in node_ids:
            node_data = canvas_data.get("nodes", {}).get(node_id)
            if not node_data:
                continue

            task = asyncio.create_task(
                self._execute_node(
                    project_state, node_id, node_data, previous_results
                )
            )
            tasks.append(task)

        completed = await asyncio.gather(*tasks, return_exceptions=True)

        results = {}
        for node_id, result in zip(node_ids, completed):
            if isinstance(result, Exception):
                results[node_id] = {"success": False, "error": str(result)}
            else:
                results[node_id] = result

        return results

    async def _execute_node(
        self,
        project_state: "ProjectState",
        node_id: str,
        node_data: Dict[str, Any],
        previous_results: Dict[str, Any],
    ) -> Dict[str, Any]:
        """执行单个节点"""
        agent_type = node_data.get("agent_type")
        if not agent_type:
            return {"success": False, "error": "缺少 agent_type"}

        try:
            agent = self.agent_registry.create(agent_type)

            context = node_data.get("context", {}).copy()

            for upstream_node_id in node_data.get("upstream_nodes", []):
                if upstream_node_id in previous_results:
                    context[upstream_node_id] = previous_results[upstream_node_id]

            quality_level = node_data.get("quality_level", "standard")
            context["quality_level"] = quality_level

            if agent_type == "producer":
                context["budget_allocations"] = project_state.budget_allocations

            result = await agent.execute(node_id, context)

            if result.success and result.cost > 0:
                project_state.cost_tracker.add_cost(result.cost, agent_type, node_id)

            return {
                "success": result.success,
                "data": result.data,
                "cost": result.cost,
                "error": result.error,
            }

        except Exception as e:
            logger.error(f"Node execution failed ({node_id}, {agent_type}): {e}")
            return {"success": False, "error": str(e)}

    async def get_project_status(self, project_id: str) -> Dict[str, Any]:
        """获取项目状态"""
        if project_id not in self.active_projects:
            return {"error": f"项目不存在: {project_id}"}

        project_state = self.active_projects[project_id]

        return {
            "project_id": project_id,
            "name": project_state.name,
            "total_budget": project_state.cost_tracker.budget_limit,
            "current_cost": project_state.cost_tracker.current_cost,
            "remaining_budget": project_state.cost_tracker.budget_limit - project_state.cost_tracker.current_cost,
            "budget_status": project_state.cost_tracker.check_budget_threshold(),
            "usage_ratio": project_state.cost_tracker.usage_ratio,
            "allocations": project_state.budget_allocations,
        }

    async def human_review(self, project_id: str, node_id: str, decision: str, feedback: str = "") -> Dict[str, Any]:
        """人类审核节点结果"""
        if project_id not in self.active_projects:
            return {"error": f"项目不存在: {project_id}"}

        project_state = self.active_projects[project_id]

        if node_id not in project_state.node_results:
            return {"error": f"节点不存在: {node_id}"}

        project_state.node_results[node_id]["review_status"] = decision
        project_state.node_results[node_id]["review_feedback"] = feedback
        project_state.node_results[node_id]["reviewed_at"] = "now"

        return {
            "success": True,
            "project_id": project_id,
            "node_id": node_id,
            "review_status": decision,
            "feedback": feedback,
        }

    async def regenerate_node(self, project_id: str, node_id: str, context_updates: Dict[str, Any] = {}) -> Dict[str, Any]:
        """重新生成节点"""
        if project_id not in self.active_projects:
            return {"error": f"项目不存在: {project_id}"}

        project_state = self.active_projects[project_id]

        if node_id not in project_state.node_results:
            return {"error": f"节点不存在: {node_id}"}

        original_context = project_state.node_results[node_id].get("context", {})
        original_context.update(context_updates)

        agent_type = project_state.node_results[node_id].get("agent_type")
        if not agent_type:
            return {"error": "缺少 agent_type"}

        try:
            agent = self.agent_registry.create(agent_type)
            result = await agent.execute(node_id, original_context)

            project_state.node_results[node_id] = {
                **project_state.node_results[node_id],
                "success": result.success,
                "data": result.data,
                "cost": result.cost,
                "error": result.error,
            }

            if result.success and result.cost > 0:
                project_state.cost_tracker.add_cost(result.cost, agent_type, node_id)

            return {
                "success": result.success,
                "data": result.data,
                "cost": result.cost,
            }

        except Exception as e:
            return {"success": False, "error": str(e)}


class ProjectState:
    """项目状态管理"""

    def __init__(
        self,
        project_id: str,
        name: str,
        cost_tracker: CostTracker,
        cost_router: CostAwareRouter,
    ):
        self.project_id = project_id
        self.name = name
        self.cost_tracker = cost_tracker
        self.cost_router = cost_router
        self.producer_data: Optional[Dict[str, Any]] = None
        self.budget_allocations: Dict[str, Any] = {}
        self.node_results: Dict[str, Dict[str, Any]] = {}
        self.status: str = "active"