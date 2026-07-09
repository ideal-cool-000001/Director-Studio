from typing import Dict, List, Optional, Any, Tuple
from uuid import uuid4
from datetime import datetime
from .base_memory import BaseMemory, MemoryEntry, MemoryIndex
from .stage_memory import StageMemory


class ProjectMemory(BaseMemory):
    def __init__(self, project_id: str, project_name: str = ""):
        self.project_id = project_id
        self.project_name = project_name
        self._entries: Dict[str, MemoryEntry] = {}
        self._index = MemoryIndex()
        self._stage_memories: Dict[str, StageMemory] = {}
        self._ai_models_used: Dict[str, Dict[str, Any]] = {}
        self._prompts_used: List[Dict[str, Any]] = []
        self._project_summary: Optional[str] = None
        self._last_summarized_at: Optional[datetime] = None

    def add(self, content: str, metadata: Dict[str, Any] = None) -> str:
        entry_id = str(uuid4())
        metadata = metadata or {}
        metadata["project_id"] = self.project_id

        entry = MemoryEntry(
            id=entry_id,
            content=content,
            metadata=metadata,
            timestamp=datetime.now(),
            importance=metadata.get("importance", 0.5),
        )

        self._entries[entry_id] = entry

        keywords = metadata.get("keywords", [])
        if isinstance(keywords, str):
            keywords = keywords.split(",")
        self._index.add_entry(entry_id, keywords)

        return entry_id

    def get(self, entry_id: str) -> Optional[MemoryEntry]:
        return self._entries.get(entry_id)

    def search(self, query: str, limit: int = 10) -> List[MemoryEntry]:
        matched_ids = self._index.search(query)
        results = []

        for entry_id in matched_ids[:limit]:
            entry = self._entries.get(entry_id)
            if entry:
                results.append(entry)

        results.sort(key=lambda e: (e.importance, e.timestamp), reverse=True)
        return results

    def list(self, limit: int = 100) -> List[MemoryEntry]:
        all_entries = list(self._entries.values())
        all_entries.sort(key=lambda e: (e.importance, e.timestamp), reverse=True)
        return all_entries[:limit]

    def update(self, entry_id: str, content: str, metadata: Dict[str, Any] = None) -> bool:
        entry = self._entries.get(entry_id)
        if not entry:
            return False

        entry.content = content
        if metadata:
            entry.metadata.update(metadata)
            entry.timestamp = datetime.now()

        return True

    def delete(self, entry_id: str) -> bool:
        if entry_id in self._entries:
            del self._entries[entry_id]
            return True
        return False

    def clear(self) -> None:
        self._entries.clear()
        self._index.clear()
        self._stage_memories.clear()
        self._ai_models_used.clear()
        self._prompts_used.clear()
        self._project_summary = None

    def get_stage_memory(self, stage: str) -> StageMemory:
        if stage not in self._stage_memories:
            self._stage_memories[stage] = StageMemory(self.project_id, stage)
        return self._stage_memories[stage]

    def record_ai_model_usage(self, model_id: str, provider: str, config: Dict[str, Any]) -> None:
        if model_id not in self._ai_models_used:
            self._ai_models_used[model_id] = {
                "provider": provider,
                "config": config,
                "usage_count": 0,
                "first_used_at": datetime.now(),
                "last_used_at": datetime.now(),
            }
        else:
            self._ai_models_used[model_id]["usage_count"] += 1
            self._ai_models_used[model_id]["last_used_at"] = datetime.now()
            self._ai_models_used[model_id]["config"] = config

    def record_prompt_usage(self, prompt: str, agent_id: str, stage: str, metadata: Dict[str, Any] = None) -> None:
        prompt_record = {
            "id": str(uuid4()),
            "prompt": prompt,
            "agent_id": agent_id,
            "stage": stage,
            "timestamp": datetime.now(),
            "metadata": metadata or {},
        }
        self._prompts_used.append(prompt_record)

    def get_all_models_used(self) -> Dict[str, Dict[str, Any]]:
        return dict(self._ai_models_used)

    def get_all_prompts_used(self) -> List[Dict[str, Any]]:
        return list(self._prompts_used)

    def generate_project_summary(self) -> str:
        stage_summaries = []
        for stage, stage_memory in self._stage_memories.items():
            summary = stage_memory.get_stage_summary()
            stage_summaries.append({
                "stage": stage,
                "entry_count": summary["entry_count"],
                "context_keys": list(summary["context"].keys()),
            })

        self._project_summary = f"""
项目: {self.project_name} (ID: {self.project_id})
阶段统计: {stage_summaries}
使用的AI模型: {list(self._ai_models_used.keys())}
提示词数量: {len(self._prompts_used)}
项目记忆条目: {len(self._entries)}
        """.strip()

        self._last_summarized_at = datetime.now()
        return self._project_summary

    def get_project_summary(self) -> Optional[str]:
        return self._project_summary

    def export_to_knowledge(self) -> Dict[str, Any]:
        return {
            "project_id": self.project_id,
            "project_name": self.project_name,
            "summary": self.generate_project_summary(),
            "models_used": self._ai_models_used,
            "prompts_used": self._prompts_used,
            "high_importance_entries": [e.to_dict() for e in self.list() if e.importance >= 0.7],
            "stage_contexts": {
                stage: sm.get_all_context()
                for stage, sm in self._stage_memories.items()
            },
            "exported_at": datetime.now().isoformat(),
        }

    def import_from_knowledge(self, knowledge_data: Dict[str, Any]) -> None:
        self.project_name = knowledge_data.get("project_name", self.project_name)
        self._ai_models_used = knowledge_data.get("models_used", {})
        self._prompts_used = knowledge_data.get("prompts_used", [])

        for entry_data in knowledge_data.get("high_importance_entries", []):
            entry = MemoryEntry(
                id=entry_data["id"],
                content=entry_data["content"],
                metadata=entry_data.get("metadata", {}),
                timestamp=datetime.fromisoformat(entry_data["timestamp"]) if entry_data.get("timestamp") else datetime.now(),
                importance=entry_data.get("importance", 0.5),
            )
            self._entries[entry.id] = entry

        for stage, context in knowledge_data.get("stage_contexts", {}).items():
            stage_memory = self.get_stage_memory(stage)
            for key, value in context.items():
                stage_memory.set_context(key, value)

    def get_full_context(self) -> Dict[str, Any]:
        return {
            "project_id": self.project_id,
            "project_name": self.project_name,
            "models_used": self._ai_models_used,
            "recent_prompts": self._prompts_used[-10:],
            "stage_contexts": {
                stage: sm.get_all_context()
                for stage, sm in self._stage_memories.items()
            },
            "summary": self.get_project_summary(),
        }