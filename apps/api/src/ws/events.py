from enum import Enum
from dataclasses import dataclass, asdict
from typing import Optional


class WSEventType(str, Enum):
    NODE_STATUS_CHANGED = "node:status_changed"
    NODE_THUMBNAIL_UPDATED = "node:thumbnail_updated"
    NODE_QUALITY_SCORE = "node:quality_score"
    TASK_PROGRESS = "task:progress"
    TASK_COMPLETED = "task:completed"
    TASK_FAILED = "task:failed"
    COST_UPDATED = "cost:updated"
    COST_BUDGET_WARNING = "cost:budget_warning"
    REVIEW_REQUIRED = "review:required"
    REVIEW_COMPLETED = "review:completed"
    EXPORT_PROGRESS = "export:progress"
    SYSTEM_ALERT = "system:alert"


@dataclass
class WSMessage:
    event: WSEventType
    project_id: str
    payload: dict

    def to_dict(self):
        return {
            "event": self.event.value,
            "project_id": self.project_id,
            "payload": self.payload,
        }


@dataclass
class NodeStatusChangedPayload:
    node_id: str
    status: str
    previous_status: Optional[str] = None
    message: Optional[str] = None


@dataclass
class NodeThumbnailUpdatedPayload:
    node_id: str
    thumbnail_url: str


@dataclass
class NodeQualityScorePayload:
    node_id: str
    score: float
    details: Optional[dict] = None


@dataclass
class TaskProgressPayload:
    task_id: str
    node_id: str
    progress: int
    status: str
    message: Optional[str] = None


@dataclass
class TaskCompletedPayload:
    task_id: str
    node_id: str
    result: dict
    cost: float = 0.0


@dataclass
class TaskFailedPayload:
    task_id: str
    node_id: str
    error: str
    retry_count: int = 0


@dataclass
class CostUpdatedPayload:
    project_id: str
    total_cost: float
    node_cost: Optional[dict] = None


@dataclass
class CostBudgetWarningPayload:
    project_id: str
    budget_limit: float
    current_cost: float
    warning_level: str


@dataclass
class ReviewRequiredPayload:
    node_id: str
    node_type: str
    task_id: str
    review_type: str


@dataclass
class ReviewCompletedPayload:
    node_id: str
    action: str
    reviewer_id: Optional[str] = None
    feedback: Optional[str] = None


@dataclass
class ExportProgressPayload:
    export_id: str
    progress: int
    status: str


@dataclass
class SystemAlertPayload:
    level: str
    message: str
    timestamp: str