from typing import Dict, List, Optional, Any, Tuple
from uuid import uuid4
from datetime import datetime
from ..events import EventType, WorkflowStage, AgentRole, Event, event_bus
from ..memory import memory_manager
from .registry import AgentRegistry
from .base_agent import BaseAgent
import asyncio


class WorkflowState:
    def __init__(self, project_id: str):
        self.project_id = project_id
        self.current_stage: WorkflowStage = WorkflowStage.PLANNING
        self.stage_progress: Dict[str, float] = {stage.value: 0.0 for stage in WorkflowStage}
        self.active_tasks: List[str] = []
        self.completed_tasks: List[str] = []
        self.failed_tasks: List[str] = []
        self.last_updated: datetime = datetime.now()
        self.agent_status: Dict[str, str] = {}

    def update_stage(self, stage: WorkflowStage):
        self.current_stage = stage
        self.last_updated = datetime.now()

    def update_progress(self, stage: str, progress: float):
        self.stage_progress[stage] = progress
        self.last_updated = datetime.now()

    def add_active_task(self, task_id: str):
        if task_id not in self.active_tasks:
            self.active_tasks.append(task_id)

    def complete_task(self, task_id: str):
        if task_id in self.active_tasks:
            self.active_tasks.remove(task_id)
        if task_id not in self.completed_tasks:
            self.completed_tasks.append(task_id)
        self.last_updated = datetime.now()

    def fail_task(self, task_id: str):
        if task_id in self.active_tasks:
            self.active_tasks.remove(task_id)
        if task_id not in self.failed_tasks:
            self.failed_tasks.append(task_id)
        self.last_updated = datetime.now()

    def update_agent_status(self, agent_id: str, status: str):
        self.agent_status[agent_id] = status
        self.last_updated = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "project_id": self.project_id,
            "current_stage": self.current_stage.value,
            "stage_progress": self.stage_progress,
            "active_tasks": self.active_tasks,
            "completed_tasks": self.completed_tasks,
            "failed_tasks": self.failed_tasks,
            "last_updated": self.last_updated.isoformat(),
            "agent_status": self.agent_status,
        }


class WorkflowCoordinator:
    STAGE_AGENTS: Dict[WorkflowStage, List[AgentRole]] = {
        WorkflowStage.PLANNING: [AgentRole.PRODUCER, AgentRole.DIRECTOR],
        WorkflowStage.WRITING: [AgentRole.SCREENWRITER, AgentRole.DIRECTOR],
        WorkflowStage.STORYBOARDING: [AgentRole.CHARACTER_DESIGNER, AgentRole.SCENE_DESIGNER, AgentRole.STORYBOARD_ARRANGER],
        WorkflowStage.PRODUCTION: [AgentRole.SCENE_DESIGNER, AgentRole.DIRECTOR, AgentRole.VIDEO_GENERATOR],
        WorkflowStage.EDITING: [AgentRole.EDITOR, AgentRole.DIRECTOR, AgentRole.AUDIO_PRODUCER],
        WorkflowStage.PUBLISHING: [AgentRole.DIRECTOR, AgentRole.PROMOTION],
    }

    def __init__(self):
        self._workflow_states: Dict[str, WorkflowState] = {}
        self._registry = AgentRegistry()
        self._setup_event_handlers()

    def _setup_event_handlers(self):
        event_bus.subscribe(EventType.TASK_COMPLETED, self._handle_task_completed)
        event_bus.subscribe(EventType.TASK_FAILED, self._handle_task_failed)
        event_bus.subscribe(EventType.STAGE_COMPLETED, self._handle_stage_completed)

    async def _handle_task_completed(self, event: Event):
        project_id = event.project_id
        task_id = event.payload.get("task_id")
        stage = event.payload.get("stage")

        if project_id not in self._workflow_states:
            self._workflow_states[project_id] = WorkflowState(project_id)

        state = self._workflow_states[project_id]
        state.complete_task(task_id)

        if stage:
            state.update_progress(stage, min(1.0, state.stage_progress.get(stage, 0) + 0.25))

        await self._check_stage_completion(project_id)

    async def _handle_task_failed(self, event: Event):
        project_id = event.project_id
        task_id = event.payload.get("task_id")

        if project_id in self._workflow_states:
            state = self._workflow_states[project_id]
            state.fail_task(task_id)

    async def _handle_stage_completed(self, event: Event):
        project_id = event.project_id
        stage = event.payload.get("stage")

        if project_id not in self._workflow_states:
            self._workflow_states[project_id] = WorkflowState(project_id)

        state = self._workflow_states[project_id]
        state.update_progress(stage, 1.0)

        memory_manager.transfer_stage_to_project(project_id, stage)

        await self._advance_to_next_stage(project_id)

    async def _check_stage_completion(self, project_id: str):
        state = self._workflow_states.get(project_id)
        if not state:
            return

        if state.stage_progress.get(state.current_stage.value, 0) >= 1.0:
            await event_bus.publish(Event(
                event_type=EventType.STAGE_COMPLETED,
                project_id=project_id,
                payload={"stage": state.current_stage.value},
                agent_id="coordinator",
            ))

    async def _advance_to_next_stage(self, project_id: str):
        state = self._workflow_states.get(project_id)
        if not state:
            return

        stages = list(WorkflowStage)
        current_index = stages.index(state.current_stage)

        if current_index < len(stages) - 1:
            next_stage = stages[current_index + 1]
            state.update_stage(next_stage)

            await event_bus.publish(Event(
                event_type=EventType.PROJECT_UPDATED,
                project_id=project_id,
                payload={
                    "stage": next_stage.value,
                    "message": f"项目已进入{next_stage.value}阶段",
                },
                agent_id="coordinator",
            ))

            await self._dispatch_agents_for_stage(project_id, next_stage)

    async def _dispatch_agents_for_stage(self, project_id: str, stage: WorkflowStage):
        agents = self.STAGE_AGENTS.get(stage, [])

        for agent_role in agents:
            agent = self._registry.get_agent(agent_role.value)
            if agent:
                await self._assign_agent_task(project_id, agent, stage)

    async def _assign_agent_task(self, project_id: str, agent: BaseAgent, stage: WorkflowStage):
        task_id = str(uuid4())

        if project_id not in self._workflow_states:
            self._workflow_states[project_id] = WorkflowState(project_id)

        state = self._workflow_states[project_id]
        state.add_active_task(task_id)
        state.update_agent_status(agent.agent_id, "working")

        await event_bus.publish(Event(
            event_type=EventType.TASK_STARTED,
            project_id=project_id,
            payload={
                "task_id": task_id,
                "agent_id": agent.agent_id,
                "stage": stage.value,
                "task_description": f"{agent.agent_id}正在处理{stage.value}阶段任务",
            },
            agent_id=agent.agent_id,
        ))

        try:
            project_context = memory_manager.get_project_context(project_id)
            result = await agent.execute(project_id, {
                "task_id": task_id,
                "stage": stage.value,
                "project_context": project_context,
            })

            await event_bus.publish(Event(
                event_type=EventType.TASK_COMPLETED,
                project_id=project_id,
                payload={
                    "task_id": task_id,
                    "agent_id": agent.agent_id,
                    "stage": stage.value,
                    "result": result,
                },
                agent_id=agent.agent_id,
            ))

            state.update_agent_status(agent.agent_id, "idle")

        except Exception as e:
            await event_bus.publish(Event(
                event_type=EventType.TASK_FAILED,
                project_id=project_id,
                payload={
                    "task_id": task_id,
                    "agent_id": agent.agent_id,
                    "stage": stage.value,
                    "error": str(e),
                },
                agent_id=agent.agent_id,
            ))

            state.update_agent_status(agent.agent_id, "error")

    async def start_workflow(self, project_id: str, project_name: str = "") -> Dict[str, Any]:
        memory_manager.create_project_memory(project_id, project_name)

        if project_id not in self._workflow_states:
            self._workflow_states[project_id] = WorkflowState(project_id)

        await event_bus.publish(Event(
            event_type=EventType.PROJECT_CREATED,
            project_id=project_id,
            payload={"project_name": project_name},
            agent_id="coordinator",
        ))

        await self._dispatch_agents_for_stage(project_id, WorkflowStage.PLANNING)

        return self.get_workflow_state(project_id)

    async def pause_workflow(self, project_id: str) -> Dict[str, Any]:
        await event_bus.publish(Event(
            event_type=EventType.WORKFLOW_PAUSED,
            project_id=project_id,
            payload={},
            agent_id="coordinator",
        ))
        return self.get_workflow_state(project_id)

    async def resume_workflow(self, project_id: str) -> Dict[str, Any]:
        await event_bus.publish(Event(
            event_type=EventType.WORKFLOW_RESUMED,
            project_id=project_id,
            payload={},
            agent_id="coordinator",
        ))

        state = self._workflow_states.get(project_id)
        if state:
            await self._dispatch_agents_for_stage(project_id, state.current_stage)

        return self.get_workflow_state(project_id)

    def get_workflow_state(self, project_id: str) -> Dict[str, Any]:
        state = self._workflow_states.get(project_id)
        if not state:
            return {"error": "Workflow not found"}
        return state.to_dict()

    def get_all_workflows(self) -> List[Dict[str, Any]]:
        return [state.to_dict() for state in self._workflow_states.values()]

    async def run_agent_task(self, project_id: str, agent_role: str, task_data: Dict[str, Any]) -> Any:
        agent = self._registry.get_agent(agent_role)
        if not agent:
            raise ValueError(f"Agent not found: {agent_role}")

        if project_id not in self._workflow_states:
            self._workflow_states[project_id] = WorkflowState(project_id)

        task_id = str(uuid4())
        state = self._workflow_states[project_id]
        state.add_active_task(task_id)
        state.update_agent_status(agent_role, "working")

        await event_bus.publish(Event(
            event_type=EventType.TASK_STARTED,
            project_id=project_id,
            payload={
                "task_id": task_id,
                "agent_id": agent_role,
                "task_description": task_data.get("description", "Custom task"),
            },
            agent_id=agent_role,
        ))

        try:
            result = await agent.execute(project_id, task_data)

            await event_bus.publish(Event(
                event_type=EventType.TASK_COMPLETED,
                project_id=project_id,
                payload={
                    "task_id": task_id,
                    "agent_id": agent_role,
                    "result": result,
                },
                agent_id=agent_role,
            ))

            state.complete_task(task_id)
            state.update_agent_status(agent_role, "idle")

            return result

        except Exception as e:
            await event_bus.publish(Event(
                event_type=EventType.TASK_FAILED,
                project_id=project_id,
                payload={
                    "task_id": task_id,
                    "agent_id": agent_role,
                    "error": str(e),
                },
                agent_id=agent_role,
            ))

            state.fail_task(task_id)
            state.update_agent_status(agent_role, "error")
            raise


workflow_coordinator = WorkflowCoordinator()