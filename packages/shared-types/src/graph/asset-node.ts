// ═══════════════════════════════════════════
// AssetNode — 图结构节点 + 8 种 Metadata 子类型
// ═══════════════════════════════════════════

import type {
  NodeType,
  NodeStatus,
  TimeOfDay,
  LightingType,
  ShotSize,
  CameraMovement,
  TransitionType,
  AudioType,
  TextType,
  RelationType,
} from '../constants';

// ─── 基础结构 ───

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  pitch: number;
  yaw: number;
  roll: number;
}

// ─── 版本记录 ───

export interface Version {
  version_id: string;
  version_number: number;
  data: Record<string, unknown>;
  asset_url?: string;
  thumbnail_url?: string;
  prompt_version_id?: string;
  created_at: string; // ISO 8601
  created_by: 'user' | 'agent';
}

// ─── 8 种 Metadata 子类型 ───

/** 角色卡片元数据 */
export interface CharacterMetadata {
  name: string;
  description: string;
  personality?: string;
  age?: number;
  gender?: 'male' | 'female' | 'non_binary';
  relationships?: Array<{
    target_character_id: string;
    relation_type: RelationType;
    description: string;
  }>;
  reference_images?: string[];
  portrait_prompt?: string;
  negative_prompt?: string;
  lora_model_path?: string;
}

/** 场景卡片元数据 */
export interface SceneMetadata {
  name: string;
  location: string;
  furnishings?: string;
  lighting?: {
    type: LightingType;
    direction?: string;
    color_temp?: number;
  };
  atmosphere?: string[];
  time_of_day?: TimeOfDay;
  reference_images?: string[];
  environment_prompt?: string;
  negative_prompt?: string;
}

/** 摄像机运动轨迹（3D 导演台输出） */
export interface CameraTrajectory {
  keyframes: Array<{
    time: number;
    position: Vec3;
    rotation: Rotation;
    focal_length: number;
  }>;
}

/** 分镜卡片元数据 */
export interface StoryboardMetadata {
  scene_id: string;
  shots: Array<{
    shot_id: string;
    shot_number: number;
    duration: number;
    shot_size: ShotSize;
    camera_movement: CameraMovement;
    camera_trajectory?: CameraTrajectory;
    three_act: {
      start: { time_range: string; description: string };
      middle: { time_range: string; description: string };
      end: { time_range: string; description: string };
    };
    dialogue?: Array<{
      character_id: string;
      line: string;
      emotion?: string;
      time_offset: number;
    }>;
    sound_effects?: string[];
    transition_to_next?: TransitionType;
  }>;
}

/** 图片卡片元数据 */
export interface ImageMetadata {
  asset_url?: string;
  thumbnail_url?: string;
  resolution?: { width: number; height: number };
  generation_params?: {
    model: string;
    seed: number;
    steps: number;
    cfg_scale: number;
  };
  source_shot_id?: string;
}

/** 视频卡片元数据 */
export interface VideoMetadata {
  asset_url?: string;
  thumbnail_url?: string;
  duration?: number;
  resolution?: { width: number; height: number };
  fps?: number;
  codec?: string;
  generation_model?: string;
  source_shot_id?: string;
}

/** 音频卡片元数据 */
export interface AudioMetadata {
  asset_url?: string;
  duration?: number;
  sample_rate?: number;
  channels?: number;
  audio_type: AudioType;
  character_id?: string;
}

/** 文本卡片元数据 */
export interface TextMetadata {
  content: string;
  text_type: TextType;
  word_count: number;
  language?: string;
}

/** 风格卡片元数据 */
export interface StyleMetadata {
  preset: string;
  color_scheme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  moodboard_urls?: string[];
  style_params?: Record<string, number>;
}

/** 所有 Metadata 联合类型 */
export type NodeMetadata =
  | CharacterMetadata
  | SceneMetadata
  | StoryboardMetadata
  | ImageMetadata
  | VideoMetadata
  | AudioMetadata
  | TextMetadata
  | StyleMetadata;

// ─── AssetNode 主体 ───

export interface AssetNode {
  node_id: string;
  project_id: string;
  node_type: NodeType;
  position: Position;
  size: Size;
  metadata: NodeMetadata;
  versions: Version[];
  active_version_id?: string;
  dependencies: string[];
  dependents: string[];
  status: NodeStatus;
  quality_score?: number;
  cost: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}
