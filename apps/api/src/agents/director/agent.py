from typing import Dict, Any, List, Optional
from datetime import datetime

from src.agents.base_agent import BaseAgent, AgentResult
from src.db.session import async_session
from src.db.repositories.graph_repo import GraphRepository
from src.db.repositories.project_repo import ProjectRepository
from src.memory import memory_manager
from src.events import EventType, Event, event_bus
from .review_engine import ReviewEngine, ReviewResult
from .prompts import DIRECTOR_REVIEW_PROMPT


class DirectorAgent(BaseAgent):
    agent_type: str = "director"
    description: str = "导演Agent：把控全流程质量，审核各环节产出，管理项目记忆"
    agent_id: str = "director"

    def __init__(self):
        self.review_engine = ReviewEngine()
        self._setup_event_listeners()

    def _setup_event_listeners(self):
        event_bus.subscribe(EventType.TASK_COMPLETED, self._on_task_completed)
        event_bus.subscribe(EventType.TASK_FAILED, self._on_task_failed)
        event_bus.subscribe(EventType.MEDIA_GENERATED, self._on_media_generated)
        event_bus.subscribe(EventType.PROMPT_GENERATED, self._on_prompt_generated)

    async def _on_task_completed(self, event: Event):
        project_id = event.project_id
        agent_id = event.payload.get("agent_id")
        result = event.payload.get("result", {})

        summary = f"{agent_id} 完成任务: {result.get('summary', '')}"
        await memory_manager.add_to_project(project_id, summary, {
            "agent_id": agent_id,
            "task_type": "completed",
            "importance": 0.6,
        })

    async def _on_task_failed(self, event: Event):
        project_id = event.project_id
        agent_id = event.payload.get("agent_id")
        error = event.payload.get("error", "")

        error_record = f"{agent_id} 任务失败: {error}"
        await memory_manager.add_to_project(project_id, error_record, {
            "agent_id": agent_id,
            "task_type": "failed",
            "importance": 0.8,
        })

    async def _on_media_generated(self, event: Event):
        project_id = event.project_id
        media_type = event.payload.get("media_type")
        style = event.payload.get("style", "")

        media_record = f"生成{media_type}: 风格={style}"
        await memory_manager.add_to_project(project_id, media_record, {
            "media_type": media_type,
            "style": style,
            "importance": 0.7,
        })

    async def _on_prompt_generated(self, event: Event):
        project_id = event.project_id
        agent_id = event.payload.get("agent_id")
        prompt = event.payload.get("prompt", "")

        prompt_record = f"{agent_id} 生成提示词: {prompt[:100]}..."
        await memory_manager.add_to_project(project_id, prompt_record, {
            "agent_id": agent_id,
            "prompt_type": "generated",
            "importance": 0.5,
        })

    async def execute(self, project_id: str, context: Dict[str, Any]) -> AgentResult:
        action = context.get("action", "review")
        node_id = context.get("node_id", project_id)

        if action == "review":
            return await self._review(node_id, context)
        elif action == "approve":
            return await self._approve(node_id, context)
        elif action == "reject":
            return await self._reject(node_id, context)
        elif action == "get_review_history":
            return await self._get_review_history(context)
        elif action == "check_style":
            return await self._check_style(context)
        elif action == "intervene":
            return await self._intervene(node_id, context)
        elif action == "monitor_project":
            return await self._monitor_project(context)
        elif action == "call_agent":
            return await self._call_agent(context)
        elif action == "quality_overview":
            return await self._quality_overview(context)
        elif action == "export_knowledge":
            return await self._export_knowledge(project_id, context)
        elif action == "get_project_context":
            return await self._get_project_context(project_id)
        else:
            return AgentResult(
                success=False,
                error=f"未知操作: {action}",
            )

    async def _review(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        try:
            agent_type = context.get("agent_type", "")
            content_summary = context.get("content_summary", "")
            quality_score = context.get("quality_score", 0.0)
            project_name = context.get("project_name", "未命名项目")
            project_style = context.get("project_style", "")

            result = self.review_engine.review(node_id, agent_type, content_summary, quality_score)

            consistency_score = 0.0
            if project_style and content_summary:
                consistency_score = self._evaluate_style_consistency(project_style, content_summary)

            prompt = DIRECTOR_REVIEW_PROMPT.format(
                project_name=project_name,
                agent_type=agent_type,
                node_id=node_id,
                content_summary=content_summary,
                quality_score=quality_score,
            )

            return AgentResult(
                success=True,
                data={
                    "review_result": {
                        "node_id": result.node_id,
                        "agent_type": result.agent_type,
                        "decision": result.decision,
                        "feedback": result.feedback,
                        "quality_score": result.quality_score,
                        "timestamp": result.timestamp.isoformat(),
                    },
                    "style_consistency": {
                        "score": consistency_score,
                        "is_consistent": consistency_score >= 0.7,
                    },
                    "requires_human_review": self.review_engine.requires_human_review(quality_score),
                    "review_prompt": prompt,
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _approve(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        try:
            agent_type = context.get("agent_type", "")
            content_summary = context.get("content_summary", "")

            result = ReviewResult(
                node_id=node_id,
                agent_type=agent_type,
                decision="approve",
                feedback=context.get("feedback", "已批准"),
                quality_score=context.get("quality_score", 1.0),
            )

            self.review_engine.review_history[node_id] = result

            project_id = context.get("project_id")
            if project_id:
                await self._update_node_status(project_id, node_id, "approved")

            return AgentResult(
                success=True,
                data={
                    "message": "已批准",
                    "review_result": {
                        "node_id": result.node_id,
                        "agent_type": result.agent_type,
                        "decision": result.decision,
                        "feedback": result.feedback,
                        "quality_score": result.quality_score,
                        "timestamp": result.timestamp.isoformat(),
                    },
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _reject(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        try:
            agent_type = context.get("agent_type", "")
            content_summary = context.get("content_summary", "")
            reason = context.get("reason", "")
            suggestions = context.get("suggestions", "")

            result = ReviewResult(
                node_id=node_id,
                agent_type=agent_type,
                decision="reject",
                feedback=f"拒绝原因：{reason}\n修改建议：{suggestions}",
                quality_score=context.get("quality_score", 0.0),
            )

            self.review_engine.review_history[node_id] = result

            project_id = context.get("project_id")
            if project_id:
                await self._update_node_status(project_id, node_id, "failed")

            return AgentResult(
                success=True,
                data={
                    "message": "已拒绝",
                    "review_result": {
                        "node_id": result.node_id,
                        "agent_type": result.agent_type,
                        "decision": result.decision,
                        "feedback": result.feedback,
                        "quality_score": result.quality_score,
                        "timestamp": result.timestamp.isoformat(),
                    },
                    "reason": reason,
                    "suggestions": suggestions,
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _intervene(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        try:
            agent_type = context.get("agent_type", "")
            intervention_type = context.get("intervention_type", "adjust")
            parameters = context.get("parameters", {})

            if intervention_type == "adjust":
                result = await self._adjust_agent_parameters(agent_type, node_id, parameters)
            elif intervention_type == "rerun":
                result = await self._rerun_agent(agent_type, node_id, context)
            elif intervention_type == "override":
                result = await self._override_agent_output(node_id, context)
            else:
                return AgentResult(
                    success=False,
                    error=f"未知干预类型: {intervention_type}",
                )

            return AgentResult(
                success=True,
                data={
                    "intervention_type": intervention_type,
                    "agent_type": agent_type,
                    "node_id": node_id,
                    "result": result,
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _adjust_agent_parameters(self, agent_type: str, node_id: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "message": f"已调整 {agent_type} 的参数",
            "adjusted_parameters": parameters,
            "node_id": node_id,
        }

    async def _rerun_agent(self, agent_type: str, node_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        try:
            from src.agents.registry import AgentRegistry
            agent = AgentRegistry.create(agent_type)
            adjusted_context = {**context, "action": "regenerate"}
            result = await agent.execute(node_id, adjusted_context)

            return {
                "message": "已重新执行",
                "success": result.success,
                "agent_type": agent_type,
                "result": result.data,
            }
        except ValueError as e:
            return {"message": f"无法重新执行: {e}"}

    async def _override_agent_output(self, node_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        project_id = context.get("project_id")
        if project_id:
            await self._update_node_metadata(project_id, node_id, {"override": True, "override_data": context.get("override_data")})

        return {
            "message": "已覆盖输出",
            "node_id": node_id,
            "override_data": context.get("override_data"),
        }

    async def _call_agent(self, context: Dict[str, Any]) -> AgentResult:
        try:
            from src.agents.registry import AgentRegistry

            target_agent_type = context.get("target_agent_type")
            target_node_id = context.get("target_node_id", "director_call")
            target_context = context.get("target_context", {})

            agent = AgentRegistry.create(target_agent_type)
            result = await agent.execute(target_node_id, target_context)

            review_result = self.review_engine.review(
                target_node_id, target_agent_type, str(result.data), result.data.get("quality_score", 0.5)
            )

            return AgentResult(
                success=True,
                data={
                    "agent_type": target_agent_type,
                    "node_id": target_node_id,
                    "agent_result": {
                        "success": result.success,
                        "data": result.data,
                        "error": result.error,
                        "cost": result.cost,
                    },
                    "director_review": {
                        "decision": review_result.decision,
                        "feedback": review_result.feedback,
                        "quality_score": review_result.quality_score,
                    },
                },
                cost=result.cost,
                model_used=result.model_used,
            )
        except ValueError as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _monitor_project(self, context: Dict[str, Any]) -> AgentResult:
        try:
            project_id = context.get("project_id")
            if not project_id:
                return AgentResult(success=False, error="缺少 project_id")

            async with async_session() as session:
                project_repo = ProjectRepository(session)
                graph_repo = GraphRepository(session)

                project = await project_repo.get(project_id)
                nodes = await graph_repo.get_nodes(project_id)

                node_status_counts = {}
                total_cost = 0
                avg_quality = 0
                quality_count = 0

                for node in nodes:
                    status = node.status
                    node_status_counts[status] = node_status_counts.get(status, 0) + 1
                    total_cost += node.cost
                    if node.quality_score:
                        avg_quality += node.quality_score
                        quality_count += 1

                avg_quality = avg_quality / quality_count if quality_count > 0 else 0

                return AgentResult(
                    success=True,
                    data={
                        "project_id": project_id,
                        "project_name": project.title,
                        "total_cost": total_cost,
                        "budget": project.global_config.get("budget", 0),
                        "remaining_budget": max(0, project.global_config.get("budget", 0) - total_cost),
                        "node_status": node_status_counts,
                        "total_nodes": len(nodes),
                        "average_quality": avg_quality,
                        "style_preset": project.global_config.get("style_preset", ""),
                    },
                    cost=0.0,
                )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _quality_overview(self, context: Dict[str, Any]) -> AgentResult:
        try:
            project_id = context.get("project_id")
            if not project_id:
                return AgentResult(success=False, error="缺少 project_id")

            async with async_session() as session:
                graph_repo = GraphRepository(session)
                nodes = await graph_repo.get_nodes(project_id)

            quality_report = []
            issues = []

            for node in nodes:
                quality_score = node.quality_score or 0
                status = "excellent" if quality_score >= 0.9 else "good" if quality_score >= 0.7 else "fair" if quality_score >= 0.5 else "poor"

                quality_report.append({
                    "node_id": node.node_id,
                    "node_type": node.node_type,
                    "status": status,
                    "quality_score": quality_score,
                    "cost": node.cost,
                })

                if quality_score < 0.7:
                    issues.append({
                        "node_id": node.node_id,
                        "node_type": node.node_type,
                        "issue": f"质量评分偏低 ({quality_score:.2f})",
                        "suggestion": "建议重新生成或人工审核",
                    })

            overall_score = sum(n.quality_score or 0 for n in nodes) / len(nodes) if nodes else 0

            return AgentResult(
                success=True,
                data={
                    "project_id": project_id,
                    "overall_quality_score": overall_score,
                    "overall_status": "excellent" if overall_score >= 0.9 else "good" if overall_score >= 0.7 else "fair" if overall_score >= 0.5 else "poor",
                    "total_issues": len(issues),
                    "issues": issues,
                    "node_reports": quality_report,
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _get_review_history(self, context: Dict[str, Any]) -> AgentResult:
        try:
            node_id = context.get("node_id")
            history = self.review_engine.get_review_history(node_id)

            history_data = {
                key: {
                    "node_id": result.node_id,
                    "agent_type": result.agent_type,
                    "decision": result.decision,
                    "feedback": result.feedback,
                    "quality_score": result.quality_score,
                    "timestamp": result.timestamp.isoformat(),
                }
                for key, result in history.items()
            }

            return AgentResult(
                success=True,
                data={
                    "review_history": history_data,
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _check_style(self, context: Dict[str, Any]) -> AgentResult:
        try:
            project_style = context.get("project_style", "")
            agent_type = context.get("agent_type", "")
            content = context.get("content", "")

            consistency_score = self._evaluate_style_consistency(project_style, content)

            return AgentResult(
                success=True,
                data={
                    "project_style": project_style,
                    "agent_type": agent_type,
                    "consistency_score": consistency_score,
                    "is_consistent": consistency_score >= 0.7,
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _update_node_status(self, project_id: str, node_id: str, status: str):
        async with async_session() as session:
            graph_repo = GraphRepository(session)
            await graph_repo.update_node(project_id, node_id, {"status": status})
            await session.commit()

    async def _update_node_metadata(self, project_id: str, node_id: str, metadata: Dict[str, Any]):
        async with async_session() as session:
            graph_repo = GraphRepository(session)
            node = await graph_repo.get_node(project_id, node_id)
            if node:
                await graph_repo.update_node(project_id, node_id, {
                    "metadata_": {**node.metadata_, **metadata}
                })
            await session.commit()

    def _evaluate_style_consistency(self, project_style: str, content: str) -> float:
        style_keywords = {
            "anime": ["动漫", "二次元", "卡通", "日式", "萌", "Q版"],
            "realistic": ["写实", "真实", "逼真", "高清", "照片级", "真人"],
            "cyberpunk": ["赛博", "朋克", "未来", "霓虹灯", "机械", "科技"],
            "chinese_style": ["国风", "水墨", "古风", "汉服", "古典", "武侠"],
            "3d": ["三维", "立体", "渲染", "建模", "CG"],
            "pixel": ["像素", "复古", "8-bit", "16-bit"],
            "watercolor": ["水彩", "水墨", "手绘", "插画"],
        }

        project_style_lower = project_style.lower()
        matched_keywords = []

        for style, keywords in style_keywords.items():
            if style in project_style_lower:
                matched_keywords.extend(keywords)

        if not matched_keywords:
            return 0.5

        content_lower = content.lower()
        matches = sum(1 for kw in matched_keywords if kw in content_lower)
        return min(matches / len(matched_keywords), 1.0)

    async def _export_knowledge(self, project_id: str, context: Dict[str, Any]) -> AgentResult:
        try:
            knowledge_data = memory_manager.export_project_knowledge(project_id)
            if not knowledge_data:
                return AgentResult(success=False, error="项目记忆不存在")

            return AgentResult(
                success=True,
                data={
                    "knowledge": knowledge_data,
                    "exported_at": datetime.now().isoformat(),
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def _get_project_context(self, project_id: str) -> AgentResult:
        try:
            context_data = memory_manager.get_project_context(project_id)
            if not context_data:
                return AgentResult(success=False, error="项目上下文不存在")

            return AgentResult(
                success=True,
                data=context_data,
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
        valid_actions = ["review", "approve", "reject", "get_review_history", "check_style", "intervene", "monitor_project", "call_agent", "quality_overview", "export_knowledge", "get_project_context"]
        if action not in valid_actions:
            errors.append(f"无效的 action: {action}")

        if action in ["review", "approve", "reject"]:
            if "agent_type" not in data:
                errors.append("缺少 agent_type")
            if "content_summary" not in data:
                errors.append("缺少 content_summary")

        if action == "check_style":
            if "project_style" not in data:
                errors.append("缺少 project_style")
            if "content" not in data:
                errors.append("缺少 content")

        if action == "intervene":
            if "agent_type" not in data:
                errors.append("缺少 agent_type")
            if "intervention_type" not in data:
                errors.append("缺少 intervention_type")

        if action == "call_agent":
            if "target_agent_type" not in data:
                errors.append("缺少 target_agent_type")

        if action in ["monitor_project", "quality_overview"]:
            if "project_id" not in data:
                errors.append("缺少 project_id")

        if errors:
            return {"valid": False, "errors": errors}
        return {"valid": True}