// ═══════════════════════════════════════════
// WebSocket 消息类型
// ═══════════════════════════════════════════

import type { WSEventType, NodeStatus, TaskStatus } from '../constants';

/** WebSocket 消息基类 */
export interface WSMessage<T = unknown> {
  event: WSEventType;
  project_id: string;
  timestamp: string;
  payload: T;
}

/** 节点状态变化 */
export interface NodeStatusPayload {
  node_id: string;
  old_status: NodeStatus;
  new_status: NodeStatus;
}

/** 节点缩略图更新 */
export interface NodeThumbnailPayload {
  node_id: string;
  thumbnail_url: string;
}

/** 任务进度 */
export interface TaskProgressPayload {
  task_id: string;
  node_id: string;
  status: TaskStatus;
  progress: number; // 0-100
  message?: string;
}

/** 成本更新 */
export interface CostUpdatedPayload {
  total_cost: number;
  budget_limit: number;
  usage_ratio: number;
  node_cost?: { node_id: string; cost: number };
}

/** 预算警告 */
export interface BudgetWarningPayload {
  level: 'warning' | 'critical';
  usage_ratio: number;
  message: string;
}

/** 审核请求 */
export interface ReviewRequiredPayload {
  node_id: string;
  task_id: string;
  preview_url?: string;
  quality_score?: number;
  message: string;
}

/** 导出进度 */
export interface ExportProgressPayload {
  task_id: string;
  progress: number;
  stage: string;
  download_url?: string;
}
