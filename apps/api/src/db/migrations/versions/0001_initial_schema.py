from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("email", sa.String(length=256), nullable=False),
        sa.Column("password_hash", sa.String(length=512), nullable=False),
        sa.Column("username", sa.String(length=64), nullable=True),
        sa.Column("avatar_url", sa.String(length=512), nullable=True),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("api_key", sa.String(length=64), nullable=True),
        sa.Column("preferences", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("user_id"),
        sa.UniqueConstraint("api_key"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "projects",
        sa.Column("project_id", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=256), nullable=False),
        sa.Column("global_config", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("total_cost", sa.Float(), nullable=False),
        sa.Column("created_by", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("project_id"),
    )

    op.create_table(
        "asset_nodes",
        sa.Column("node_id", sa.String(length=64), nullable=False),
        sa.Column("project_id", sa.String(length=64), nullable=False),
        sa.Column("node_type", sa.String(length=32), nullable=False),
        sa.Column("position_x", sa.Float(), nullable=False),
        sa.Column("position_y", sa.Float(), nullable=False),
        sa.Column("size_width", sa.Integer(), nullable=False),
        sa.Column("size_height", sa.Integer(), nullable=False),
        sa.Column("metadata", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("quality_score", sa.Float(), nullable=True),
        sa.Column("cost", sa.Float(), nullable=False),
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("active_version_id", sa.String(length=64), nullable=True),
        sa.Column("created_by", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("node_id"),
    )
    op.create_index(op.f("ix_asset_nodes_project_id"), "asset_nodes", ["project_id"], unique=False)

    op.create_table(
        "edges",
        sa.Column("edge_id", sa.String(length=64), nullable=False),
        sa.Column("project_id", sa.String(length=64), nullable=False),
        sa.Column("source_node_id", sa.String(length=64), nullable=False),
        sa.Column("target_node_id", sa.String(length=64), nullable=False),
        sa.Column("source_handle", sa.String(length=64), nullable=True),
        sa.Column("target_handle", sa.String(length=64), nullable=True),
        sa.Column("edge_type", sa.String(length=32), nullable=False),
        sa.Column("metadata", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("edge_id"),
    )
    op.create_index(op.f("ix_edges_project_id"), "edges", ["project_id"], unique=False)

    op.create_table(
        "versions",
        sa.Column("version_id", sa.String(length=64), nullable=False),
        sa.Column("node_id", sa.String(length=64), nullable=False),
        sa.Column("project_id", sa.String(length=64), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("data", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("asset_url", sa.String(length=512), nullable=True),
        sa.Column("prompt_version_id", sa.String(length=64), nullable=True),
        sa.Column("created_by", sa.String(length=16), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("version_id"),
    )
    op.create_index(op.f("ix_versions_node_id"), "versions", ["node_id"], unique=False)
    op.create_index(op.f("ix_versions_project_id"), "versions", ["project_id"], unique=False)
    op.create_index(op.f("ix_versions_version_number"), "versions", ["version_number"], unique=False)

    op.create_table(
        "prompt_versions",
        sa.Column("prompt_version_id", sa.String(length=64), nullable=False),
        sa.Column("template_id", sa.String(length=64), nullable=False),
        sa.Column("project_id", sa.String(length=64), nullable=True),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("prompt_text", sa.String(length=8192), nullable=False),
        sa.Column("variables", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("metadata", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("created_by", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("prompt_version_id"),
    )
    op.create_index(op.f("ix_prompt_versions_project_id"), "prompt_versions", ["project_id"], unique=False)
    op.create_index(op.f("ix_prompt_versions_template_id"), "prompt_versions", ["template_id"], unique=False)
    op.create_index(op.f("ix_prompt_versions_version_number"), "prompt_versions", ["version_number"], unique=False)

    op.create_table(
        "agent_tasks",
        sa.Column("task_id", sa.String(length=64), nullable=False),
        sa.Column("project_id", sa.String(length=64), nullable=False),
        sa.Column("node_id", sa.String(length=64), nullable=False),
        sa.Column("agent_type", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("quality_level", sa.String(length=16), nullable=False),
        sa.Column("progress", sa.Integer(), nullable=False),
        sa.Column("result", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("estimated_time", sa.Float(), nullable=True),
        sa.Column("estimated_cost", sa.Float(), nullable=True),
        sa.Column("actual_cost", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("task_id"),
    )
    op.create_index(op.f("ix_agent_tasks_node_id"), "agent_tasks", ["node_id"], unique=False)
    op.create_index(op.f("ix_agent_tasks_project_id"), "agent_tasks", ["project_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_agent_tasks_project_id"), table_name="agent_tasks")
    op.drop_index(op.f("ix_agent_tasks_node_id"), table_name="agent_tasks")
    op.drop_table("agent_tasks")

    op.drop_index(op.f("ix_prompt_versions_version_number"), table_name="prompt_versions")
    op.drop_index(op.f("ix_prompt_versions_template_id"), table_name="prompt_versions")
    op.drop_index(op.f("ix_prompt_versions_project_id"), table_name="prompt_versions")
    op.drop_table("prompt_versions")

    op.drop_index(op.f("ix_versions_version_number"), table_name="versions")
    op.drop_index(op.f("ix_versions_project_id"), table_name="versions")
    op.drop_index(op.f("ix_versions_node_id"), table_name="versions")
    op.drop_table("versions")

    op.drop_index(op.f("ix_edges_project_id"), table_name="edges")
    op.drop_table("edges")

    op.drop_index(op.f("ix_asset_nodes_project_id"), table_name="asset_nodes")
    op.drop_table("asset_nodes")

    op.drop_table("projects")

    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")