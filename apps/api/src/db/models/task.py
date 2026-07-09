# ═══════════════════════════════════════════
# ORM 模型 — Agent 任务表
# ═══════════════════════════════════════════

import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column
from src.db.models import Base


class TaskModel(Base):
    __tablename__ = "agent_tasks"

    task_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    node_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    agent_type: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    quality_level: Mapped[str] = mapped_column(String(16), default="standard")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_time: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    actual_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
