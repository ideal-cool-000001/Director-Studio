from typing import Dict, List, Optional, Any
from uuid import uuid4
from datetime import datetime
from .session_memory import SessionMemory
from .stage_memory import StageMemory
from .project_memory import ProjectMemory
from .base_memory import MemoryEntry


class MemoryManager:
    def __init__(self):
        self._session_memories: Dict[str, SessionMemory] = {}
        self._project_memories: Dict[str, ProjectMemory] = {}

    def create_session_memory(self, session_id: Optional[str] = None) -> SessionMemory:
        session_id = session_id or str(uuid4())
        if session_id not in self._session_memories:
            self._session_memories[session_id] = SessionMemory(session_id)
        return self._session_memories[session_id]

    def get_session_memory(self, session_id: str) -> Optional[SessionMemory]:
        return self._session_memories.get(session_id)

    def create_project_memory(self, project_id: str, project_name: str = "") -> ProjectMemory:
        if project_id not in self._project_memories:
            self._project_memories[project_id] = ProjectMemory(project_id, project_name)
        return self._project_memories[project_id]

    def get_project_memory(self, project_id: str) -> Optional[ProjectMemory]:
        return self._project_memories.get(project_id)

    def get_stage_memory(self, project_id: str, stage: str) -> Optional[StageMemory]:
        project_memory = self._project_memories.get(project_id)
        if not project_memory:
            return None
        return project_memory.get_stage_memory(stage)

    def add_to_session(self, session_id: str, content: str, metadata: Dict[str, Any] = None) -> str:
        session_memory = self.get_session_memory(session_id)
        if not session_memory:
            session_memory = self.create_session_memory(session_id)
        return session_memory.add(content, metadata)

    def add_to_stage(self, project_id: str, stage: str, content: str, metadata: Dict[str, Any] = None) -> str:
        project_memory = self.get_project_memory(project_id)
        if not project_memory:
            project_memory = self.create_project_memory(project_id)
        stage_memory = project_memory.get_stage_memory(stage)
        return stage_memory.add(content, metadata)

    def add_to_project(self, project_id: str, content: str, metadata: Dict[str, Any] = None) -> str:
        project_memory = self.get_project_memory(project_id)
        if not project_memory:
            project_memory = self.create_project_memory(project_id)
        return project_memory.add(content, metadata)

    def search_session(self, session_id: str, query: str, limit: int = 10) -> List[MemoryEntry]:
        session_memory = self.get_session_memory(session_id)
        if not session_memory:
            return []
        return session_memory.search(query, limit)

    def search_stage(self, project_id: str, stage: str, query: str, limit: int = 10) -> List[MemoryEntry]:
        stage_memory = self.get_stage_memory(project_id, stage)
        if not stage_memory:
            return []
        return stage_memory.search(query, limit)

    def search_project(self, project_id: str, query: str, limit: int = 10) -> List[MemoryEntry]:
        project_memory = self.get_project_memory(project_id)
        if not project_memory:
            return []
        return project_memory.search(query, limit)

    def search_across_levels(self, project_id: str, session_id: str, query: str, limit: int = 10) -> Dict[str, List[MemoryEntry]]:
        results = {
            "session": [],
            "stage": [],
            "project": [],
        }

        if session_id:
            results["session"] = self.search_session(session_id, query, limit)

        project_memory = self.get_project_memory(project_id)
        if project_memory:
            results["project"] = project_memory.search(query, limit)

            for stage in StageMemory.STAGES:
                stage_memory = project_memory.get_stage_memory(stage)
                stage_results = stage_memory.search(query, limit)
                if stage_results:
                    results["stage"].extend(stage_results)

        results["stage"] = results["stage"][:limit]
        return results

    def transfer_stage_to_project(self, project_id: str, stage: str) -> List[Dict[str, Any]]:
        project_memory = self.get_project_memory(project_id)
        if not project_memory:
            return []

        stage_memory = project_memory.get_stage_memory(stage)
        transferred = stage_memory.transfer_to_project()

        for entry_data in transferred:
            project_memory.add(
                content=entry_data["content"],
                metadata=entry_data.get("metadata", {}),
            )

        return transferred

    def record_ai_model_usage(self, project_id: str, model_id: str, provider: str, config: Dict[str, Any]) -> None:
        project_memory = self.get_project_memory(project_id)
        if not project_memory:
            project_memory = self.create_project_memory(project_id)
        project_memory.record_ai_model_usage(model_id, provider, config)

    def record_prompt_usage(self, project_id: str, prompt: str, agent_id: str, stage: str, metadata: Dict[str, Any] = None) -> None:
        project_memory = self.get_project_memory(project_id)
        if not project_memory:
            project_memory = self.create_project_memory(project_id)
        project_memory.record_prompt_usage(prompt, agent_id, stage, metadata)

    def export_project_knowledge(self, project_id: str) -> Optional[Dict[str, Any]]:
        project_memory = self.get_project_memory(project_id)
        if not project_memory:
            return None
        return project_memory.export_to_knowledge()

    def import_project_knowledge(self, project_id: str, knowledge_data: Dict[str, Any]) -> None:
        project_memory = self.create_project_memory(project_id)
        project_memory.import_from_knowledge(knowledge_data)

    def generate_project_summary(self, project_id: str) -> Optional[str]:
        project_memory = self.get_project_memory(project_id)
        if not project_memory:
            return None
        return project_memory.generate_project_summary()

    def get_project_context(self, project_id: str) -> Optional[Dict[str, Any]]:
        project_memory = self.get_project_memory(project_id)
        if not project_memory:
            return None
        return project_memory.get_full_context()

    def cleanup_expired_sessions(self) -> int:
        expired_count = 0
        now = datetime.now()

        sessions_to_remove = []
        for session_id, session_memory in self._session_memories.items():
            if (now - session_memory._creation_time).total_seconds() > session_memory.ttl_minutes * 60:
                sessions_to_remove.append(session_id)

        for session_id in sessions_to_remove:
            del self._session_memories[session_id]
            expired_count += 1

        return expired_count

    def clear_project_memory(self, project_id: str) -> None:
        if project_id in self._project_memories:
            self._project_memories[project_id].clear()
            del self._project_memories[project_id]

    def get_stats(self) -> Dict[str, Any]:
        return {
            "total_sessions": len(self._session_memories),
            "total_projects": len(self._project_memories),
            "project_details": {
                project_id: {
                    "name": pm.project_name,
                    "entry_count": len(pm._entries),
                    "stages": list(pm._stage_memories.keys()),
                    "models_used": list(pm._ai_models_used.keys()),
                }
                for project_id, pm in self._project_memories.items()
            },
        }


memory_manager = MemoryManager()