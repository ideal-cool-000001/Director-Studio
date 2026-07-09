# ═══════════════════════════════════════════
# ORM 模型 — 资产节点表
# ═══════════════════════════════════════════

import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, Text, JSON, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from src.db.models import Base


class AssetNodeModel(Base):
    __tablename__ = "asset_nodes"

    node_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    node_type: Mapped[str] = mapped_column(String(32), nullable=False)
    position_x: Mapped[float] = mapped_column(Float, default=0.0)
    position_y: Mapped[float] = mapped_column(Float, default=0.0)
    size_width: Mapped[int] = mapped_column(Integer, default=200)
    size_height: Mapped[int] = mapped_column(Integer, default=120)
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    status: Mapped[str] = mapped_column(String(32), default="draft")
    quality_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    tags: Mapped[list] = mapped_column(ARRAY(String), default=list)
    active_version_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_by: Mapped[str] = mapped_column(String(64), default="system")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
