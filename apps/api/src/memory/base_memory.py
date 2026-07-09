from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from uuid import UUID


class MemoryEntry:
    def __init__(
        self,
        id: str,
        content: str,
        metadata: Dict[str, Any],
        timestamp: Optional[datetime] = None,
        importance: float = 0.5,
    ):
        self.id = id
        self.content = content
        self.metadata = metadata
        self.timestamp = timestamp or datetime.now()
        self.importance = importance

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "content": self.content,
            "metadata": self.metadata,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "importance": self.importance,
        }


class BaseMemory(ABC):
    @abstractmethod
    def add(self, content: str, metadata: Dict[str, Any] = None) -> str:
        pass

    @abstractmethod
    def get(self, entry_id: str) -> Optional[MemoryEntry]:
        pass

    @abstractmethod
    def search(self, query: str, limit: int = 10) -> List[MemoryEntry]:
        pass

    @abstractmethod
    def list(self, limit: int = 100) -> List[MemoryEntry]:
        pass

    @abstractmethod
    def update(self, entry_id: str, content: str, metadata: Dict[str, Any] = None) -> bool:
        pass

    @abstractmethod
    def delete(self, entry_id: str) -> bool:
        pass

    @abstractmethod
    def clear(self) -> None:
        pass


class MemoryIndex:
    def __init__(self):
        self._index: Dict[str, List[str]] = {}

    def add_entry(self, entry_id: str, keywords: List[str]):
        for keyword in keywords:
            keyword = keyword.lower().strip()
            if keyword not in self._index:
                self._index[keyword] = []
            if entry_id not in self._index[keyword]:
                self._index[keyword].append(entry_id)

    def search(self, query: str) -> List[str]:
        query_terms = query.lower().strip().split()
        results: Dict[str, int] = {}

        for term in query_terms:
            if term in self._index:
                for entry_id in self._index[term]:
                    results[entry_id] = results.get(entry_id, 0) + 1

        return sorted(results.keys(), key=results.get, reverse=True)

    def clear(self):
        self._index.clear()