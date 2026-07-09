# ═══════════════════════════════════════════
# Agent 基类 — 所有专家 Agent 的公共接口
# ═══════════════════════════════════════════

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime
import time
from ..memory import memory_manager
from ..events import EventType, Event, event_bus


@dataclass
class AgentResult:
    """Agent 执行结果"""
    success: bool
    data: dict = field(default_factory=dict)
    error: str = ""
    cost: float = 0.0
    duration_seconds: float = 0.0
    model_used: str = ""
    prompt_used: str = ""


class BaseAgent(ABC):
    """专家 Agent 基类"""

    agent_type: str = "base"
    description: str = ""
    agent_id: str = "base"

    @abstractmethod
    async def execute(self, project_id: str, context: dict) -> AgentResult:
        """执行 Agent 任务"""
        ...

    @abstractmethod
    async def validate(self, data: dict) -> dict:
        """校验 Agent 输出数据"""
        ...

    async def add_memory(self, project_id: str, content: str, metadata: Dict[str, Any] = None, stage: Optional[str] = None, importance: float = 0.5) -> str:
        """添加记忆"""
        metadata = metadata or {}
        metadata["importance"] = importance
        metadata["agent_id"] = self.agent_id

        if stage:
            return memory_manager.add_to_stage(project_id, stage, content, metadata)
        return memory_manager.add_to_project(project_id, content, metadata)

    async def search_memory(self, project_id: str, query: str, limit: int = 10) -> Any:
        """搜索记忆"""
        return memory_manager.search_project(project_id, query, limit)

    async def get_project_context(self, project_id: str) -> Optional[Dict[str, Any]]:
        """获取项目上下文"""
        return memory_manager.get_project_context(project_id)

    async def record_model_usage(self, project_id: str, model_id: str, provider: str, config: Dict[str, Any]) -> None:
        """记录模型使用"""
        memory_manager.record_ai_model_usage(project_id, model_id, provider, config)

    async def record_prompt_usage(self, project_id: str, prompt: str, stage: str, metadata: Dict[str, Any] = None) -> None:
        """记录提示词使用"""
        memory_manager.record_prompt_usage(project_id, prompt, self.agent_id, stage, metadata)

    async def send_event(self, project_id: str, event_type: EventType, payload: Dict[str, Any]) -> None:
        """发送事件"""
        await event_bus.publish(Event(
            event_type=event_type,
            project_id=project_id,
            payload=payload,
            agent_id=self.agent_id,
        ))

    async def on_progress(self, project_id: str, progress: int, message: str = "") -> None:
        """进度回调（子类可覆写）"""
        await self.send_event(project_id, EventType.AGENT_ACTION, {
            "action": "progress",
            "progress": progress,
            "message": message,
        })

    async def on_complete(self, project_id: str, result: AgentResult) -> None:
        """完成回调"""
        await self.send_event(project_id, EventType.AGENT_ACTION, {
            "action": "complete",
            "success": result.success,
            "error": result.error,
        })

        if result.model_used:
            await self.record_model_usage(project_id, result.model_used, "", {})

        if result.prompt_used:
            await self.record_prompt_usage(project_id, result.prompt_used, "")

    async def execute_with_memory(self, project_id: str, context: dict) -> AgentResult:
        """带记忆管理的执行方法"""
        start_time = time.time()

        try:
            context["project_context"] = self.get_project_context(project_id)

            result = await self.execute(project_id, context)

            result.duration_seconds = time.time() - start_time

            if result.success:
                await self.on_complete(project_id, result)

                summary = f"{self.agent_id} 完成任务: {result.data.get('summary', '')}"
                await self.add_memory(project_id, summary, {
                    "task_type": context.get("task_type", "unknown"),
                    "stage": context.get("stage", ""),
                    "importance": 0.7,
                })

            return result

        except Exception as e:
            duration = time.time() - start_time
            error_msg = str(e)

            await self.send_event(project_id, EventType.TASK_FAILED, {
                "error": error_msg,
                "agent_id": self.agent_id,
            })

            return AgentResult(
                success=False,
                error=error_msg,
                duration_seconds=duration,
            )
