// ═══════════════════════════════════════════
// Edge — 图结构连接线
// ═══════════════════════════════════════════

import type { EdgeType } from '../constants';

/** 连接线元数据 */
export interface EdgeMetadata {
  /** 引用强度 (0-1)，用于弱引用的权重 */
  strength?: number;
  /** 风格继承权重 (0-1) */
  inherit_weight?: number;
  /** 连接线标签（可选） */
  label?: string;
}

/** 连接线 */
export interface Edge {
  edge_id: string;
  project_id: string;
  source_node_id: string;
  target_node_id: string;
  /** 源节点的输出端口 ID */
  source_handle?: string;
  /** 目标节点的输入端口 ID */
  target_handle?: string;
  edge_type: EdgeType;
  metadata?: EdgeMetadata;
  created_at: string;
}
