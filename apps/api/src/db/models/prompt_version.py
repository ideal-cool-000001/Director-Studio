import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from src.db.models import Base


class PromptVersionModel(Base):
    __tablename__ = "prompt_versions"

    prompt_version_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    template_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    project_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    version_number: Mapped[int] = mapped_column(index=True, default=1)
    prompt_text: Mapped[str] = mapped_column(String(8192), nullable=False)
    variables: Mapped[dict] = mapped_column(JSON, default=dict)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSON, nullable=True)
    created_by: Mapped[str] = mapped_column(String(64), default="system")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)