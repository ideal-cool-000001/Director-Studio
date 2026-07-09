# ═══════════════════════════════════════════
# 智能依赖推断引擎
# 拓扑排序 + 循环检测 + 并行组识别
# ═══════════════════════════════════════════

from collections import defaultdict, deque
from typing import Any


class CircularDependencyError(Exception):
    """循环依赖异常"""
    pass


class DependencyEngine:
    """从画布连接线自动构建依赖图，计算执行顺序"""

    def __init__(self):
        self._graph: dict[str, list[str]] = defaultdict(list)  # 邻接表: node -> [downstream_nodes]
        self._reverse: dict[str, list[str]] = defaultdict(list)  # 反向: node -> [upstream_nodes]

    def build_from_edges(self, edges: list[dict]) -> None:
        """从 Edge 列表构建依赖图（仅处理 strong_dependency 类型的边）"""
        self._graph.clear()
        self._reverse.clear()

        for edge in edges:
            if edge.get("edge_type") == "strong_dependency":
                src = edge["source_node_id"]
                tgt = edge["target_node_id"]
                self._graph[src].append(tgt)
                self._reverse[tgt].append(src)

    def detect_cycle(self) -> bool:
        """DFS 检测循环依赖"""
        visited = set()
        rec_stack = set()

        def _dfs(node: str) -> bool:
            visited.add(node)
            rec_stack.add(node)
            for neighbor in self._graph.get(node, []):
                if neighbor not in visited:
                    if _dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True
            rec_stack.discard(node)
            return False

        all_nodes = set(self._graph.keys()) | {
            n for neighbors in self._graph.values() for n in neighbors
        }
        for node in all_nodes:
            if node not in visited:
                if _dfs(node):
                    return True
        return False

    def topological_sort(self) -> list[str]:
        """拓扑排序 — Kahn 算法"""
        if self.detect_cycle():
            raise CircularDependencyError("检测到循环依赖，请检查连接线")

        in_degree: dict[str, int] = defaultdict(int)
        all_nodes = set(self._graph.keys()) | {
            n for neighbors in self._graph.values() for n in neighbors
        }

        for node in all_nodes:
            for neighbor in self._graph.get(node, []):
                in_degree[neighbor] += 1

        queue = deque([n for n in all_nodes if in_degree[n] == 0])
        result = []

        while queue:
            node = queue.popleft()
            result.append(node)
            for neighbor in self._graph.get(node, []):
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        return result

    def get_parallel_groups(self) -> list[list[str]]:
        """识别可并行执行的节点组"""
        if self.detect_cycle():
            raise CircularDependencyError("检测到循环依赖")

        in_degree: dict[str, int] = defaultdict(int)
        all_nodes = set(self._graph.keys()) | {
            n for neighbors in self._graph.values() for n in neighbors
        }

        for node in all_nodes:
            for neighbor in self._graph.get(node, []):
                in_degree[neighbor] += 1

        groups = []
        queue = deque([n for n in all_nodes if in_degree[n] == 0])

        while queue:
            # 同一层级的节点可以并行执行
            group = list(queue)
            groups.append(group)
            next_queue: deque[str] = deque()
            for node in group:
                for neighbor in self._graph.get(node, []):
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        next_queue.append(neighbor)
            queue = next_queue

        return groups

    def get_affected_subgraph(self, modified_node: str) -> dict[str, Any]:
        """计算修改某节点后受影响的下游子图"""
        affected = set()
        queue = deque([modified_node])

        while queue:
            node = queue.popleft()
            if node in affected:
                continue
            affected.add(node)
            for neighbor in self._graph.get(node, []):
                queue.append(neighbor)

        return {
            "modified_node_id": modified_node,
            "affected_node_ids": sorted(affected),
            "affected_count": len(affected),
        }
