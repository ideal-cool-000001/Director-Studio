from typing import Dict, List, Optional, Any
from uuid import uuid4
from datetime import datetime, timedelta
from .base_memory import BaseMemory, MemoryEntry, MemoryIndex


class SessionMemory(BaseMemory):
    def __init__(self, session_id: str, max_entries: int = 50, ttl_minutes: int = 60):
        self.session_id = session_id
        self.max_entries = max_entries
        self.ttl_minutes = ttl_minutes
        self._entries: Dict[str, MemoryEntry] = {}
        self._index = MemoryIndex()
        self._creation_time = datetime.now()

    def add(self, content: str, metadata: Dict[str, Any] = None) -> str:
        entry_id = str(uuid4())
        metadata = metadata or {}
        metadata["session_id"] = self.session_id

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

        if len(self._entries) > self.max_entries:
            self._prune_old_entries()

        return entry_id

    def get(self, entry_id: str) -> Optional[MemoryEntry]:
        entry = self._entries.get(entry_id)
        if entry and self._is_expired(entry):
            del self._entries[entry_id]
            return None
        return entry

    def search(self, query: str, limit: int = 10) -> List[MemoryEntry]:
        matched_ids = self._index.search(query)
        results = []

        for entry_id in matched_ids[:limit]:
            entry = self._entries.get(entry_id)
            if entry and not self._is_expired(entry):
                results.append(entry)

        results.sort(key=lambda e: e.timestamp, reverse=True)
        return results

    def list(self, limit: int = 100) -> List[MemoryEntry]:
        all_entries = [e for e in self._entries.values() if not self._is_expired(e)]
        all_entries.sort(key=lambda e: e.timestamp, reverse=True)
        return all_entries[:limit]

    def update(self, entry_id: str, content: str, metadata: Dict[str, Any] = None) -> bool:
        entry = self._entries.get(entry_id)
        if not entry or self._is_expired(entry):
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

    def get_summary(self) -> Dict[str, Any]:
        entries = self.list()
        return {
            "session_id": self.session_id,
            "entry_count": len(entries),
            "creation_time": self._creation_time.isoformat(),
            "recent_entries": [e.to_dict() for e in entries[:5]],
        }

    def _is_expired(self, entry: MemoryEntry) -> bool:
        if entry.timestamp + timedelta(minutes=self.ttl_minutes) < datetime.now():
            return True
        return False

    def _prune_old_entries(self):
        entries = sorted(self._entries.values(), key=lambda e: e.timestamp)
        entries_to_remove = entries[: len(entries) - self.max_entries]

        for entry in entries_to_remove:
            del self._entries[entry.id]