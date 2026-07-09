import asyncio
import logging
from typing import Dict, Any, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from src.agents.registry import AgentRegistry
from src.agents.base_agent import BaseAgent, AgentResult
from src.coordinator.cost_router import CostAwareRouter, CostTracker
from src.coordinator.dependency_engine import DependencyEngine, CircularDependencyError
from src.db.session import async_session
from src.db.repositories.project_repo import ProjectRepository
from src.db.repositories.graph_repo import GraphRepository
from src.db.models import ProjectModel, AssetNodeModel, TaskModel

logger = logging.getLogger(__name__)


class DBWorkflowOrchestrator:
    def __init__(self):
        self.agent_registry = AgentRegistry()

    async def _get_session(self) -> AsyncSession:
        return async_session()

    async def create_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._get_session() as session:
            project_repo = ProjectRepository(session)

            total_budget = project_data.get("budget", 1000.0)

            project_model = await project_repo.create({
                "title": project_data.get("name", "Untitled Project"),
                "global_config": {
                    "project_type": project_data.get("type", "short_drama"),
                    "description": project_data.get("description", ""),
                    "style_preset": project_data.get("style_preset", "anime"),
                    "aspect_ratio": project_data.get("aspect_ratio", "16:9"),
                    "target_duration": project_data.get("target_duration", 3),
                    "budget": total_budget,
                },
                "total_cost": 0.0,
            })

            producer_agent = self.agent_registry.create("producer")
            producer_result = await producer_agent.execute(
                node_id=f"producer_{project_model.project_id}",
                context={
                    "project_id": project_model.project_id,
                    "action": "initialize",
                    "project_name": project_data.get("name", "Untitled Project"),
                    "total_budget": total_budget,
                    "project_type": project_data.get("type", "short_drama"),
                    "description": project_data.get("description", ""),
                },
            )

            budget_allocations = producer_result.data.get("allocations", {})

            project_model.global_config["allocations"] = budget_allocations
            await project_repo.update(project_model.project_id, {
                "global_config": project_model.global_config,
            })

            await session.commit()

            return {
                "project_id": project_model.project_id,
                "name": project_model.title,
                "producer_initialized": producer_result.success,
                "budget": total_budget,
                "allocations": budget_allocations,
            }

    async def get_project_status(self, project_id: str) -> Dict[str, Any]:
        async with self._get_session() as session:
            project_repo = ProjectRepository(session)
            project = await project_repo.get(project_id)

            if not project:
                return {"error": f"项目不存在: {project_id}"}

            config = project.global_config
            total_budget = config.get("budget", 0.0)
            remaining_budget = max(0, total_budget - project.total_cost)

            return {
                "project_id": project_id,
                "name": project.title,
                "total_budget": total_budget,
                "current_cost": project.total_cost,
                "remaining_budget": remaining_budget,
                "budget_status": "normal" if project.total_cost < total_budget * 0.8 else "warning" if project.total_cost < total_budget else "exceeded",
                "usage_ratio": project.total_cost / total_budget if total_budget > 0 else 0,
                "allocations": config.get("allocations", {}),
                "created_at": project.created_at.isoformat(),
                "updated_at": project.updated_at.isoformat(),
            }

    async def execute_workflow(self, project_id: str, canvas_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._get_session() as session:
            project_repo = ProjectRepository(session)
            graph_repo = GraphRepository(session)

            project = await project_repo.get(project_id)
            if not project:
                return {"error": f"项目不存在: {project_id}"}

            try:
                dependency_engine = DependencyEngine()
                dependency_engine.build_from_edges(canvas_data.get("edges", []))

                if dependency_engine.detect_cycle():
                    return {"error": "检测到循环依赖，请检查画布连接线"}

                parallel_groups = dependency_engine.get_parallel_groups()
                logger.info(f"执行顺序: {parallel_groups}")

                cost_tracker = CostTracker(project.global_config.get("budget", 1000.0))

                results: Dict[str, Any] = {}
                execution_log: List[Dict[str, Any]] = []

                for group_idx, group in enumerate(parallel_groups):
                    logger.info(f"执行并行组 {group_idx + 1}: {group}")
                    group_results = await self._execute_parallel_group(
                        project_id, group, canvas_data, results, cost_tracker, session
                    )
                    results.update(group_results)

                    for node_id, result in group_results.items():
                        execution_log.append({
                            "node_id": node_id,
                            "group": group_idx + 1,
                            "success": result.get("success", False),
                            "cost": result.get("cost", 0.0),
                        })

                project.total_cost = cost_tracker.current_cost
                await session.commit()

                return {
                    "success": True,
                    "project_id": project_id,
                    "total_cost": cost_tracker.current_cost,
                    "remaining_budget": cost_tracker.budget_limit - cost_tracker.current_cost,
                    "execution_log": execution_log,
                    "results": results,
                }

            except Exception as e:
                await session.rollback()
                logger.error(f"Workflow execution failed: {e}")
                return {"error": str(e)}

    async def _execute_parallel_group(
        self,
        project_id: str,
        node_ids: List[str],
        canvas_data: Dict[str, Any],
        previous_results: Dict[str, Any],
        cost_tracker: CostTracker,
        session: AsyncSession,
    ) -> Dict[str, Any]:
        tasks = []

        for node_id in node_ids:
            node_data = canvas_data.get("nodes", {}).get(node_id)
            if not node_data:
                continue

            task = asyncio.create_task(
                self._execute_node(
                    project_id, node_id, node_data, previous_results, cost_tracker, session
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
        project_id: str,
        node_id: str,
        node_data: Dict[str, Any],
        previous_results: Dict[str, Any],
        cost_tracker: CostTracker,
        session: AsyncSession,
    ) -> Dict[str, Any]:
        agent_type = node_data.get("agent_type")
        if not agent_type:
            return {"success": False, "error": "缺少 agent_type"}

        try:
            agent = self.agent_registry.create(agent_type)

            context = node_data.get("context", {}).copy()
            context["project_id"] = project_id

            for upstream_node_id in node_data.get("upstream_nodes", []):
                if upstream_node_id in previous_results:
                    context[upstream_node_id] = previous_results[upstream_node_id]

            quality_level = node_data.get("quality_level", "standard")
            context["quality_level"] = quality_level

            result = await agent.execute(node_id, context)

            if result.success and result.cost > 0:
                cost_tracker.add_cost(result.cost, agent_type, node_id)

            graph_repo = GraphRepository(session)
            node = await graph_repo.get_node(project_id, node_id)

            if node:
                await graph_repo.update_node(project_id, node_id, {
                    "status": "ready" if result.success else "failed",
                    "cost": result.cost,
                    "metadata_": {**node.metadata_, **(result.data or {})},
                })

            return {
                "success": result.success,
                "data": result.data,
                "cost": result.cost,
                "error": result.error,
            }

        except Exception as e:
            logger.error(f"Node execution failed ({node_id}, {agent_type}): {e}")
            return {"success": False, "error": str(e)}

    async def create_node(self, project_id: str, node_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._get_session() as session:
            graph_repo = GraphRepository(session)

            node = await graph_repo.create_node({
                "project_id": project_id,
                "node_id": node_data.get("node_id"),
                "node_type": node_data.get("node_type", "text"),
                "position_x": node_data.get("position", {}).get("x", 0),
                "position_y": node_data.get("position", {}).get("y", 0),
                "metadata_": node_data.get("data", {}),
                "status": "draft",
            })

            await session.commit()

            return {
                "success": True,
                "node_id": node.node_id,
                "node_type": node.node_type,
            }

    async def update_node(self, project_id: str, node_id: str, node_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._get_session() as session:
            graph_repo = GraphRepository(session)

            update_data = {}
            if "position" in node_data:
                update_data["position_x"] = node_data["position"].get("x", 0)
                update_data["position_y"] = node_data["position"].get("y", 0)
            if "data" in node_data:
                node = await graph_repo.get_node(project_id, node_id)
                if node:
                    update_data["metadata_"] = {**node.metadata_, **node_data["data"]}
            if "status" in node_data:
                update_data["status"] = node_data["status"]

            if update_data:
                node = await graph_repo.update_node(project_id, node_id, update_data)
                await session.commit()

                return {"success": True, "node_id": node_id}

            return {"success": False, "error": "没有更新数据"}

    async def delete_node(self, project_id: str, node_id: str) -> Dict[str, Any]:
        async with self._get_session() as session:
            graph_repo = GraphRepository(session)

            success = await graph_repo.delete_node(project_id, node_id)
            await session.commit()

            return {"success": success, "node_id": node_id}

    async def create_edge(self, project_id: str, edge_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._get_session() as session:
            graph_repo = GraphRepository(session)

            edge = await graph_repo.create_edge({
                "project_id": project_id,
                "edge_id": edge_data.get("edge_id"),
                "source_node_id": edge_data.get("source"),
                "target_node_id": edge_data.get("target"),
                "edge_type": edge_data.get("type", "strong_dependency"),
            })

            await session.commit()

            return {"success": True, "edge_id": edge.edge_id}

    async def get_project_graph(self, project_id: str) -> Dict[str, Any]:
        async with self._get_session() as session:
            project_repo = ProjectRepository(session)
            graph_repo = GraphRepository(session)

            project = await project_repo.get(project_id)
            if not project:
                return {"error": f"项目不存在: {project_id}"}

            nodes = await graph_repo.get_nodes(project_id)
            edges = await graph_repo.get_edges(project_id)

            return {
                "project_id": project_id,
                "name": project.title,
                "nodes": [
                    {
                        "id": n.node_id,
                        "type": n.node_type,
                        "position": {"x": n.position_x, "y": n.position_y},
                        "data": n.metadata_,
                        "status": n.status,
                        "cost": n.cost,
                        "quality_score": n.quality_score,
                    }
                    for n in nodes
                ],
                "edges": [
                    {
                        "id": e.edge_id,
                        "source": e.source_node_id,
                        "target": e.target_node_id,
                        "type": e.edge_type,
                    }
                    for e in edges
                ],
            }

    async def human_review(self, project_id: str, node_id: str, decision: str, feedback: str = "") -> Dict[str, Any]:
        async with self._get_session() as session:
            graph_repo = GraphRepository(session)

            node = await graph_repo.get_node(project_id, node_id)
            if not node:
                return {"error": f"节点不存在: {node_id}"}

            status_map = {"approved": "approved", "rejected": "failed", "pending": "pending"}

            await graph_repo.update_node(project_id, node_id, {
                "status": status_map.get(decision, node.status),
                "metadata_": {
                    **node.metadata_,
                    "review_status": decision,
                    "review_feedback": feedback,
                },
            })

            await session.commit()

            return {
                "success": True,
                "project_id": project_id,
                "node_id": node_id,
                "review_status": decision,
                "feedback": feedback,
            }

    async def regenerate_node(self, project_id: str, node_id: str, context_updates: Dict[str, Any] = {}) -> Dict[str, Any]:
        async with self._get_session() as session:
            graph_repo = GraphRepository(session)

            node = await graph_repo.get_node(project_id, node_id)
            if not node:
                return {"error": f"节点不存在: {node_id}"}

            agent_type = node.metadata_.get("agent_type")
            if not agent_type:
                return {"error": "缺少 agent_type"}

            original_context = node.metadata_.get("context", {})
            original_context.update(context_updates)
            original_context["project_id"] = project_id

            try:
                agent = self.agent_registry.create(agent_type)
                result = await agent.execute(node_id, original_context)

                await graph_repo.update_node(project_id, node_id, {
                    "status": "ready" if result.success else "failed",
                    "cost": node.cost + (result.cost or 0),
                    "metadata_": {**node.metadata_, **(result.data or {})},
                })

                await session.commit()

                return {
                    "success": result.success,
                    "data": result.data,
                    "cost": result.cost,
                }

            except Exception as e:
                await session.rollback()
                return {"success": False, "error": str(e)}