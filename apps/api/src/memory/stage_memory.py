from typing import Dict, List, Optional, Any
from uuid import uuid4
from datetime import datetime
from .base_memory import BaseMemory, MemoryEntry, MemoryIndex


class StageMemory(BaseMemory):
    STAGES = ["planning", "writing", "storyboarding", "production", "editing", "publishing"]

    def __init__(self, project_id: str, stage: str):
        if stage not in self.STAGES:
            raise ValueError(f"Invalid stage: {stage}. Must be one of {self.STAGES}")

        self.project_id = project_id
        self.stage = stage
        self._entries: Dict[str, MemoryEntry] = {}
        self._index = MemoryIndex()
        self._stage_context: Dict[str, Any] = {}

    def add(self, content: str, metadata: Dict[str, Any] = None) -> str:
        entry_id = str(uuid4())
        metadata = metadata or {}
        metadata["project_id"] = self.project_id
        metadata["stage"] = self.stage

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
        self._stage_context.clear()

    def set_context(self, key: str, value: Any):
        self._stage_context[key] = value

    def get_context(self, key: str) -> Optional[Any]:
        return self._stage_context.get(key)

    def get_all_context(self) -> Dict[str, Any]:
        return dict(self._stage_context)

    def get_stage_summary(self) -> Dict[str, Any]:
        entries = self.list()
        return {
            "project_id": self.project_id,
            "stage": self.stage,
            "entry_count": len(entries),
            "context": self._stage_context,
            "high_importance_entries": [e.to_dict() for e in entries if e.importance >= 0.8][:10],
        }

    def transfer_to_project(self) -> List[Dict[str, Any]]:
        high_importance = [e for e in self.list() if e.importance >= 0.7]
        return [e.to_dict() for e in high_importance]