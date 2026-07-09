# ═══════════════════════════════════════════
# 图结构操作 API（nodes / edges）
# ═══════════════════════════════════════════

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Any

router = APIRouter()


# ─── 请求模型 ───

class CreateNodeRequest(BaseModel):
    node_type: str
    position: dict
    metadata: dict = {}
    tags: list[str] = []


class UpdateNodeRequest(BaseModel):
    position: Optional[dict] = None
    metadata: Optional[dict] = None
    status: Optional[str] = None
    tags: Optional[list[str]] = None


class CreateEdgeRequest(BaseModel):
    source_node_id: str
    target_node_id: str
    edge_type: str = "strong_dependency"
    metadata: Optional[dict] = None


# ─── 图结构查询 ───

@router.get("/graph")
async def get_graph(project_id: str):
    """获取完整图结构"""
    # TODO: 从 graph_repo 查询
    return {"nodes": {}, "edges": {}}


# ─── 节点 CRUD ───

@router.post("/nodes")
async def create_node(project_id: str, req: CreateNodeRequest):
    """创建节点"""
    # TODO: 写入 graph_repo，创建版本记录
    return {"node_id": "node_new", "node_type": req.node_type, "status": "draft"}


@router.patch("/nodes/{node_id}")
async def update_node(project_id: str, node_id: str, req: UpdateNodeRequest):
    """更新节点"""
    # TODO: 更新 metadata/position/status，创建新版本
    return {"node_id": node_id, "updated": True}


@router.delete("/nodes/{node_id}")
async def delete_node(project_id: str, node_id: str):
    """删除节点（级联删除相关边）"""
    # TODO: 事务内删除节点 + 关联边
    return {"node_id": node_id, "deleted": True}


# ─── 边 CRUD ───

@router.post("/edges")
async def create_edge(project_id: str, req: CreateEdgeRequest):
    """创建连接线"""
    # TODO: 循环检测 → 写入 → 更新依赖关系
    return {"edge_id": "edge_new", "edge_type": req.edge_type}


@router.delete("/edges/{edge_id}")
async def delete_edge(project_id: str, edge_id: str):
    """删除连接线"""
    return {"edge_id": edge_id, "deleted": True}


# ─── 节点版本 ───

@router.get("/nodes/{node_id}/versions")
async def list_versions(project_id: str, node_id: str):
    """获取节点版本列表"""
    return {"versions": []}


@router.post("/nodes/{node_id}/versions/rollback")
async def rollback_version(project_id: str, node_id: str, version_id: str):
    """回滚到指定版本"""
    return {"node_id": node_id, "rolled_back_to": version_id}


# ─── 依赖分析 ───

@router.get("/dependencies/affected")
async def get_affected_subgraph(project_id: str, node_id: str):
    """查询受影响的下游子图"""
    # TODO: 调用 dependency_engine
    return {
        "modified_node_id": node_id,
        "affected_node_ids": [],
        "estimated_time": 0,
        "estimated_cost": 0,
    }


@router.get("/dependencies/order")
async def get_execution_order(project_id: str):
    """获取拓扑排序后的执行顺序"""
    return {"execution_order": [], "parallel_groups": []}


# ─── 成本 ───

@router.get("/cost/summary")
async def get_cost_summary(project_id: str):
    """成本汇总"""
    return {"total_cost": 0, "budget_limit": 200, "usage_ratio": 0, "breakdown": []}


@router.get("/cost/breakdown")
async def get_cost_breakdown(project_id: str):
    """按环节分类的成本明细"""
    return {"breakdown": []}
