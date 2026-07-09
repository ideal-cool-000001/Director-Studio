# ═══════════════════════════════════════════
# ORM 模型 — 连接线表
# ═══════════════════════════════════════════

import uuid
from datetime import datetime
from sqlalchemy import String, Float, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from src.db.models import Base


class EdgeModel(Base):
    __tablename__ = "edges"

    edge_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    source_node_id: Mapped[str] = mapped_column(String(64), nullable=False)
    target_node_id: Mapped[str] = mapped_column(String(64), nullable=False)
    source_handle: Mapped[str | None] = mapped_column(String(64), nullable=True)
    target_handle: Mapped[str | None] = mapped_column(String(64), nullable=True)
    edge_type: Mapped[str] = mapped_column(String(32), default="strong_dependency")
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
