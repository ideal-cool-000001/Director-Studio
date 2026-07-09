from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.models import AssetNodeModel, EdgeModel, VersionModel


class GraphRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_nodes(self, project_id: str) -> list[AssetNodeModel]:
        stmt = select(AssetNodeModel).where(AssetNodeModel.project_id == project_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_node(self, project_id: str, node_id: str) -> AssetNodeModel | None:
        stmt = select(AssetNodeModel).where(
            AssetNodeModel.project_id == project_id,
            AssetNodeModel.node_id == node_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_node(self, data: dict) -> AssetNodeModel:
        node = AssetNodeModel(**data)
        self.session.add(node)
        await self.session.flush()
        return node

    async def update_node(self, project_id: str, node_id: str, data: dict) -> AssetNodeModel | None:
        stmt = update(AssetNodeModel).where(
            AssetNodeModel.project_id == project_id,
            AssetNodeModel.node_id == node_id,
        ).values(**data).returning(AssetNodeModel)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete_node(self, project_id: str, node_id: str) -> bool:
        await self.session.execute(
            delete(EdgeModel).where(
                (EdgeModel.source_node_id == node_id) | (EdgeModel.target_node_id == node_id)
            )
        )
        await self.session.execute(
            delete(VersionModel).where(VersionModel.node_id == node_id)
        )
        stmt = delete(AssetNodeModel).where(
            AssetNodeModel.project_id == project_id,
            AssetNodeModel.node_id == node_id,
        )
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    async def update_node_status(self, node_id: str, status: str) -> AssetNodeModel | None:
        stmt = update(AssetNodeModel).where(AssetNodeModel.node_id == node_id).values(status=status).returning(AssetNodeModel)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_edges(self, project_id: str) -> list[EdgeModel]:
        stmt = select(EdgeModel).where(EdgeModel.project_id == project_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create_edge(self, data: dict) -> EdgeModel:
        edge = EdgeModel(**data)
        self.session.add(edge)
        await self.session.flush()
        return edge

    async def delete_edge(self, project_id: str, edge_id: str) -> bool:
        stmt = delete(EdgeModel).where(
            EdgeModel.project_id == project_id,
            EdgeModel.edge_id == edge_id,
        )
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    async def get_node_versions(self, node_id: str) -> list[VersionModel]:
        stmt = select(VersionModel).where(VersionModel.node_id == node_id).order_by(VersionModel.version_number.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create_version(self, data: dict) -> VersionModel:
        max_version_stmt = select(func.max(VersionModel.version_number)).where(
            VersionModel.node_id == data["node_id"]
        )
        result = await self.session.execute(max_version_stmt)
        max_version = result.scalar() or 0
        data["version_number"] = max_version + 1

        version = VersionModel(**data)
        self.session.add(version)
        await self.session.flush()
        return version