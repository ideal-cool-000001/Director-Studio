// ═══════════════════════════════════════════
// API 请求 / 响应 Schema
// ═══════════════════════════════════════════

import type { NodeType, EdgeType, NodeStatus, QualityLevel, AspectRatio, StylePreset } from '../constants';

// ─── 项目 API ───

export interface CreateProjectRequest {
  title: string;
  style_preset: StylePreset;
  aspect_ratio: AspectRatio;
  target_duration: number;
  budget_limit: number;
  quality_level: QualityLevel;
  fps?: 24 | 30 | 60;
}

export interface UpdateProjectRequest {
  title?: string;
  global_config?: Partial<{
    style_preset: StylePreset;
    aspect_ratio: AspectRatio;
    target_duration: number;
    budget_limit: number;
    quality_level: QualityLevel;
  }>;
}

// ─── 节点 API ───

export interface CreateNodeRequest {
  node_type: NodeType;
  position: { x: number; y: number };
  metadata: Record<string, unknown>;
  tags?: string[];
}

export interface UpdateNodeRequest {
  position?: { x: number; y: number };
  metadata?: Record<string, unknown>;
  status?: NodeStatus;
  tags?: string[];
}

// ─── 边 API ───

export interface CreateEdgeRequest {
  source_node_id: string;
  target_node_id: string;
  source_handle?: string;
  target_handle?: string;
  edge_type: EdgeType;
  metadata?: {
    strength?: number;
    inherit_weight?: number;
    label?: string;
  };
}

// ─── 生成 API ───

export interface GenerateRequest {
  quality_level?: QualityLevel;
}

// ─── 审核 API ───

export interface ReviewActionRequest {
  action: 'approve' | 'reject' | 'modify';
  feedback?: string;
  modified_metadata?: Record<string, unknown>;
}

// ─── 通用响应 ───

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// ─── 成本摘要 ───

export interface CostSummary {
  total_cost: number;
  budget_limit: number;
  usage_ratio: number;
  breakdown: Array<{
    node_type: NodeType;
    cost: number;
    count: number;
  }>;
}
