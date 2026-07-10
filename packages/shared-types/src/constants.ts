// ═══════════════════════════════════════════
// 常量枚举 — 节点类型 / 边类型 / 状态 / 质量档位
// ═══════════════════════════════════════════

/** 画布上的 11 种节点类型 */
export enum NodeType {
  Project = 'project',
  Producer = 'producer',
  Director = 'director',
  Screenwriter = 'screenwriter',
  Character = 'character',
  Scene = 'scene',
  Storyboard = 'storyboard',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Editor = 'editor',
  Promotion = 'promotion',
}

/** 3 种连接线语义 */
export enum EdgeType {
  /** 实线：修改源节点 → 目标节点必须重生成 */
  StrongDependency = 'strong_dependency',
  /** 虚线：仅作为参考，不触发重生成 */
  WeakReference = 'weak_reference',
  /** 点划线：风格参数继承 */
  StyleInheritance = 'style_inheritance',
}

/** 节点生命周期状态 */
export enum NodeStatus {
  Draft = 'draft',
  Generating = 'generating',
  Ready = 'ready',
  Approved = 'approved',
  Failed = 'failed',
}

/** 质量档位（影响模型路由和成本） */
export enum QualityLevel {
  Draft = 'draft',
  Standard = 'standard',
  Premium = 'premium',
}

/** Agent 任务状态 */
export enum TaskStatus {
  Pending = 'pending',
  Running = 'running',
  WaitingReview = 'waiting_review',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

/** 画面比例 */
export type AspectRatio = '16:9' | '9:16' | '1:1';

/** 帧率 */
export type FrameRate = 24 | 30 | 60;

/** 时间段（场景光照） */
export type TimeOfDay = 'day' | 'dusk' | 'night';

/** 光照类型 */
export type LightingType = 'natural' | 'artificial' | 'mixed';

/** 景别 */
export type ShotSize =
  | 'extreme_long'
  | 'long'
  | 'medium'
  | 'close_up'
  | 'extreme_close_up';

/** 运镜方式 */
export type CameraMovement =
  | 'push_in'
  | 'pull_out'
  | 'pan'
  | 'tilt'
  | 'orbit'
  | 'follow'
  | 'shake'
  | 'static'
  | 'rotate';

/** 转场效果 */
export type TransitionType =
  | 'cut'
  | 'fade'
  | 'slide'
  | 'dissolve'
  | 'flash_white'
  | 'flash_black';

/** 风格预设 */
export type StylePreset =
  | 'realistic'
  | 'anime'
  | 'cyberpunk'
  | 'ink_wash'
  | 'retro'
  | '3d'
  | 'custom';

/** 音频类型 */
export type AudioType = 'tts_dialogue' | 'bgm' | 'sfx' | 'mixed';

/** 文本类型 */
export type TextType = 'dialogue' | 'narration' | 'subtitle' | 'note';

/** 角色关系类型 */
export type RelationType = 'rival' | 'lover' | 'colleague' | 'family' | 'friend' | 'other';

/** WebSocket 事件类型 */
export enum WSEventType {
  NodeStatusChanged = 'node:status_changed',
  NodeThumbnailUpdated = 'node:thumbnail_updated',
  NodeQualityScore = 'node:quality_score',
  TaskProgress = 'task:progress',
  TaskCompleted = 'task:completed',
  TaskFailed = 'task:failed',
  CostUpdated = 'cost:updated',
  CostBudgetWarning = 'cost:budget_warning',
  ReviewRequired = 'review:required',
  ReviewCompleted = 'review:completed',
  ExportProgress = 'export:progress',
  SystemAlert = 'system:alert',
}
