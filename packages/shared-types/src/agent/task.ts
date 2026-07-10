// ═══════════════════════════════════════════
// Agent 任务相关类型
// ═══════════════════════════════════════════

import type { TaskStatus, QualityLevel, NodeType } from '../constants';

/** Agent 类型（10 种专家 Agent） */
export type AgentType =
  | 'producer'
  | 'director'
  | 'screenwriter'
  | 'character_designer'
  | 'scene_designer'
  | 'storyboard_arranger'
  | 'image_generator'
  | 'video_generator'
  | 'audio_producer'
  | 'editor'
  | 'promotion';

/** Agent 任务 */
export interface AgentTask {
  task_id: string;
  project_id: string;
  node_id: string;
  agent_type: AgentType;
  status: TaskStatus;
  quality_level: QualityLevel;
  progress: number; // 0-100
  result?: TaskResult;
  error?: string;
  estimated_time?: number; // 秒
  estimated_cost?: number; // ¥
  actual_cost?: number;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

/** 任务执行结果 */
export interface TaskResult {
  asset_url?: string;
  thumbnail_url?: string;
  quality_score?: number;
  metadata?: Record<string, unknown>;
  prompt_used?: string;
  model_used?: string;
  token_usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

/** Prompt 版本记录 */
export interface PromptVersion {
  version_id: string;
  node_id: string;
  template_version: string;
  full_prompt: string;
  negative_prompt: string;
  parameters: Record<string, unknown>;
  quality_score?: number;
  user_feedback?: string;
  created_at: string;
}

/** 批量生成请求 */
export interface BatchGenerateRequest {
  node_ids: string[];
  quality_level?: QualityLevel;
}

/** 局部重生成请求 */
export interface RegenerateRequest {
  modified_node_id: string;
  quality_level?: QualityLevel;
  auto_confirm?: boolean;
}

/** 受影响子图分析结果 */
export interface AffectedSubgraph {
  modified_node_id: string;
  affected_node_ids: string[];
  affected_edges: string[];
  estimated_time: number;
  estimated_cost: number;
  execution_order: string[][]; // 并行组 [组1节点, 组2节点, ...]
}
