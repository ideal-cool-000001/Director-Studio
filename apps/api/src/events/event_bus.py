from typing import Dict, List, Callable, Optional, Any
from uuid import uuid4
from datetime import datetime
from enum import Enum
import asyncio


class EventType(str, Enum):
    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"
    STAGE_COMPLETED = "stage_completed"
    TASK_STARTED = "task_started"
    TASK_COMPLETED = "task_completed"
    TASK_FAILED = "task_failed"
    AGENT_MESSAGE = "agent_message"
    AGENT_ACTION = "agent_action"
    MEMORY_UPDATED = "memory_updated"
    MODEL_USED = "model_used"
    PROMPT_GENERATED = "prompt_generated"
    MEDIA_GENERATED = "media_generated"
    QUALITY_CHECK = "quality_check"
    WORKFLOW_PAUSED = "workflow_paused"
    WORKFLOW_RESUMED = "workflow_resumed"


class WorkflowStage(str, Enum):
    PLANNING = "planning"
    WRITING = "writing"
    STORYBOARDING = "storyboarding"
    PRODUCTION = "production"
    EDITING = "editing"
    PUBLISHING = "publishing"


class AgentRole(str, Enum):
    PRODUCER = "producer"
    DIRECTOR = "director"
    SCREENWRITER = "screenwriter"
    CHARACTER_DESIGNER = "character_designer"
    SCENE_DESIGNER = "scene_designer"
    STORYBOARD_ARRANGER = "storyboard_arranger"
    VIDEO_GENERATOR = "video_generator"
    AUDIO_PRODUCER = "audio_producer"
    EDITOR = "editor"
    PROMOTION = "promotion"
    QUALITY_INSPECTOR = "quality_inspector"


class Event:
    def __init__(
        self,
        event_type: EventType,
        project_id: str,
        payload: Dict[str, Any],
        agent_id: Optional[str] = None,
        session_id: Optional[str] = None,
    ):
        self.id = str(uuid4())
        self.event_type = event_type
        self.project_id = project_id
        self.agent_id = agent_id
        self.session_id = session_id
        self.payload = payload
        self.timestamp = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "event_type": self.event_type.value,
            "project_id": self.project_id,
            "agent_id": self.agent_id,
            "session_id": self.session_id,
            "payload": self.payload,
            "timestamp": self.timestamp.isoformat(),
        }


class EventBus:
    def __init__(self):
        self._subscribers: Dict[EventType, List[Callable[[Event], asyncio.coroutines.Coroutine[Any, Any, None]]]] = {}
        self._project_subscribers: Dict[str, List[Callable[[Event], asyncio.coroutines.Coroutine[Any, Any, None]]]] = {}
        self._event_history: List[Event] = []
        self._max_history_size = 1000
        self._lock = asyncio.Lock()

    def subscribe(
        self,
        event_type: EventType,
        handler: Callable[[Event], asyncio.coroutines.Coroutine[Any, Any, None]],
    ) -> str:
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)
        return f"{event_type.value}_{len(self._subscribers[event_type])}"

    def subscribe_to_project(
        self,
        project_id: str,
        handler: Callable[[Event], asyncio.coroutines.Coroutine[Any, Any, None]],
    ) -> str:
        if project_id not in self._project_subscribers:
            self._project_subscribers[project_id] = []
        self._project_subscribers[project_id].append(handler)
        return f"project_{project_id}_{len(self._project_subscribers[project_id])}"

    def unsubscribe(self, subscription_id: str) -> bool:
        parts = subscription_id.split("_")
        if parts[0] == "project":
            project_id = parts[1]
            index = int(parts[2]) - 1
            if project_id in self._project_subscribers and index < len(self._project_subscribers[project_id]):
                self._project_subscribers[project_id].pop(index)
                return True
        else:
            event_type = EventType(parts[0])
            index = int(parts[1]) - 1
            if event_type in self._subscribers and index < len(self._subscribers[event_type]):
                self._subscribers[event_type].pop(index)
                return True
        return False

    async def publish(self, event: Event) -> None:
        async with self._lock:
            self._event_history.append(event)
            if len(self._event_history) > self._max_history_size:
                self._event_history.pop(0)

        tasks = []

        if event.event_type in self._subscribers:
            for handler in self._subscribers[event.event_type]:
                tasks.append(asyncio.create_task(handler(event)))

        if event.project_id in self._project_subscribers:
            for handler in self._project_subscribers[event.project_id]:
                tasks.append(asyncio.create_task(handler(event)))

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    def get_history(
        self,
        project_id: Optional[str] = None,
        event_type: Optional[EventType] = None,
        limit: int = 50,
    ) -> List[Event]:
        filtered = self._event_history

        if project_id:
            filtered = [e for e in filtered if e.project_id == project_id]

        if event_type:
            filtered = [e for e in filtered if e.event_type == event_type]

        return filtered[-limit:]

    def get_event_counts(self) -> Dict[str, int]:
        counts: Dict[str, int] = {}
        for event in self._event_history:
            key = event.event_type.value
            counts[key] = counts.get(key, 0) + 1
        return counts

    async def flush_history(self) -> None:
        async with self._lock:
            self._event_history.clear()


event_bus = EventBus()