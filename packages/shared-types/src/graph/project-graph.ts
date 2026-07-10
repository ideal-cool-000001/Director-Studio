// ═══════════════════════════════════════════
// ProjectGraph — 项目图结构 + 全局配置
// ═══════════════════════════════════════════

import type { AspectRatio, FrameRate, QualityLevel, StylePreset } from '../constants';
import type { AssetNode } from './asset-node';
import type { Edge } from './edge';

/** 项目全局配置 */
export interface GlobalConfig {
  style_preset: StylePreset;
  aspect_ratio: AspectRatio;
  target_duration: number; // 分钟
  budget_limit: number; // ¥
  quality_level: QualityLevel;
  fps: FrameRate;
  resolution: { width: number; height: number };
}

/** 布局建议（分组/折叠） */
export interface LayoutHints {
  groups: Array<{
    group_id: string;
    name: string;
    node_ids: string[];
    collapsed: boolean;
  }>;
}

/** 项目图结构 — 整个画布的数据模型 */
export interface ProjectGraph {
  project_id: string;
  title: string;
  global_config: GlobalConfig;
  nodes: Record<string, AssetNode>;
  edges: Record<string, Edge>;
  layout_hints: LayoutHints;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

/** 项目摘要（列表展示用） */
export interface ProjectSummary {
  project_id: string;
  title: string;
  node_count: number;
  edge_count: number;
  total_cost: number;
  quality_level: QualityLevel;
  created_at: string;
  updated_at: string;
}
