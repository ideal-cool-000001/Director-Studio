from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ai_service_configs",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("service_type", sa.String(length=32), nullable=False),
        sa.Column("provider", sa.String(length=64), nullable=False),
        sa.Column("base_url", sa.String(length=512), nullable=False),
        sa.Column("model_name", sa.String(length=128), nullable=True),
        sa.Column("api_key_encrypted", sa.String(length=1024), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("extra_config", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_ai_service_configs_service_type"), "ai_service_configs", ["service_type"], unique=False)
    op.create_index(op.f("ix_ai_service_configs_provider"), "ai_service_configs", ["provider"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_ai_service_configs_provider"), table_name="ai_service_configs")
    op.drop_index(op.f("ix_ai_service_configs_service_type"), table_name="ai_service_configs")
    op.drop_table("ai_service_configs")