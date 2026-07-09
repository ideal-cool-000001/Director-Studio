from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.models import ProjectModel


class ProjectRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: dict) -> ProjectModel:
        project = ProjectModel(**data)
        self.session.add(project)
        await self.session.flush()
        return project

    async def get(self, project_id: str) -> ProjectModel | None:
        stmt = select(ProjectModel).where(ProjectModel.project_id == project_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list(self, limit: int = 20, offset: int = 0) -> list[ProjectModel]:
        stmt = select(ProjectModel).offset(offset).limit(limit).order_by(ProjectModel.created_at.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update(self, project_id: str, data: dict) -> ProjectModel | None:
        stmt = update(ProjectModel).where(ProjectModel.project_id == project_id).values(**data).returning(ProjectModel)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete(self, project_id: str) -> bool:
        stmt = delete(ProjectModel).where(ProjectModel.project_id == project_id)
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    async def update_cost(self, project_id: str, total_cost: float) -> ProjectModel | None:
        stmt = update(ProjectModel).where(ProjectModel.project_id == project_id).values(total_cost=total_cost).returning(ProjectModel)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()