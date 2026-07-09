from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.models import AIServiceConfigModel


class AIServiceConfigRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: dict) -> AIServiceConfigModel:
        config = AIServiceConfigModel(**data)
        self.session.add(config)
        await self.session.flush()
        return config

    async def get(self, config_id: str) -> AIServiceConfigModel | None:
        stmt = select(AIServiceConfigModel).where(AIServiceConfigModel.id == config_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_provider(self, service_type: str, provider: str) -> AIServiceConfigModel | None:
        stmt = select(AIServiceConfigModel).where(
            AIServiceConfigModel.service_type == service_type,
            AIServiceConfigModel.provider == provider
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_service_type(self, service_type: str) -> list[AIServiceConfigModel]:
        stmt = select(AIServiceConfigModel).where(AIServiceConfigModel.service_type == service_type)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_all(self) -> list[AIServiceConfigModel]:
        stmt = select(AIServiceConfigModel)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update(self, config_id: str, data: dict) -> AIServiceConfigModel | None:
        stmt = update(AIServiceConfigModel).where(AIServiceConfigModel.id == config_id).values(**data).returning(AIServiceConfigModel)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_by_provider(self, service_type: str, provider: str, data: dict) -> AIServiceConfigModel | None:
        stmt = update(AIServiceConfigModel).where(
            AIServiceConfigModel.service_type == service_type,
            AIServiceConfigModel.provider == provider
        ).values(**data).returning(AIServiceConfigModel)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete(self, config_id: str) -> bool:
        stmt = delete(AIServiceConfigModel).where(AIServiceConfigModel.id == config_id)
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    async def toggle_enabled(self, config_id: str, enabled: bool) -> AIServiceConfigModel | None:
        stmt = update(AIServiceConfigModel).where(AIServiceConfigModel.id == config_id).values(enabled=enabled).returning(AIServiceConfigModel)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()