import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from src.db.models import Base


class VersionModel(Base):
    __tablename__ = "versions"

    version_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    node_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    project_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    version_number: Mapped[int] = mapped_column(index=True, default=1)
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    asset_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    prompt_version_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_by: Mapped[str] = mapped_column(String(16), default="agent")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)