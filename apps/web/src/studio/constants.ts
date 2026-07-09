import { PoseData, ShotPreset, CameraShot, BodyType, CharacterAddOption, GeometryAddOption } from './types';

export const BODY_TYPES: Record<BodyType, { label: string; scale: { x: number; y: number; z: number } }> = {
  male: { label: '男性', scale: { x: 1, y: 1.8, z: 1 } },
  female: { label: '女性', scale: { x: 0.9, y: 1.7, z: 0.9 } },
  muscular: { label: '健硕', scale: { x: 1.3, y: 1.9, z: 1.3 } },
  slender: { label: '纤细', scale: { x: 0.8, y: 1.85, z: 0.8 } },
  broad: { label: '宽厚', scale: { x: 1.2, y: 1.75, z: 1.2 } },
  child: { label: '儿童', scale: { x: 0.7, y: 1.2, z: 0.7 } },
  teen: { label: '少年', scale: { x: 0.85, y: 1.5, z: 0.85 } },
  chibi: { label: '二头身', scale: { x: 0.9, y: 1.0, z: 0.9 } },
};

export const CHARACTER_ADD_OPTIONS: CharacterAddOption[] = [
  { bodyType: 'male', label: '男性' },
  { bodyType: 'female', label: '女性' },
  { bodyType: 'muscular', label: '健硕' },
  { bodyType: 'slender', label: '纤细' },
  { bodyType: 'broad', label: '宽厚' },
  { bodyType: 'child', label: '儿童' },
  { bodyType: 'teen', label: '少年' },
  { bodyType: 'chibi', label: '二头身' },
];

export const GEOMETRY_ADD_OPTIONS: GeometryAddOption[] = [
  { type: 'box', label: '方块' },
  { type: 'cylinder', label: '圆柱' },
  { type: 'sphere', label: '球体' },
  { type: 'human', label: '人体素模' },
];

export const POSE_PRESETS: PoseData[] = [
  { name: '站立', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 0, y: 0, z: 0 }, head: { x: 0, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: 0 }, right_shoulder: { x: 0, y: 0, z: 0 }, left_elbow: { x: 0, y: 0, z: 0 }, right_elbow: { x: 0, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: 0, y: 0, z: 0 }, right_knee: { x: 0, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: 'T型', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 0, y: 0, z: 0 }, head: { x: 0, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: -90 }, right_shoulder: { x: 0, y: 0, z: 90 }, left_elbow: { x: 0, y: 0, z: 0 }, right_elbow: { x: 0, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: 0, y: 0, z: 0 }, right_knee: { x: 0, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '行走', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 10, y: 0, z: 0 }, head: { x: 0, y: 0, z: 0 }, left_shoulder: { x: 20, y: 0, z: 0 }, right_shoulder: { x: -20, y: 0, z: 0 }, left_elbow: { x: 90, y: 0, z: 0 }, right_elbow: { x: 90, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: -30, y: 0, z: 0 }, right_hip: { x: 30, y: 0, z: 0 }, left_knee: { x: 90, y: 0, z: 0 }, right_knee: { x: 0, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '跑步', joints: { body: { x: 15, y: 0, z: 0 }, torso: { x: 20, y: 0, z: 0 }, head: { x: -5, y: 0, z: 0 }, left_shoulder: { x: 40, y: 0, z: 0 }, right_shoulder: { x: -40, y: 0, z: 0 }, left_elbow: { x: 120, y: 0, z: 0 }, right_elbow: { x: 120, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: -45, y: 0, z: 0 }, right_hip: { x: 45, y: 0, z: 0 }, left_knee: { x: 120, y: 0, z: 0 }, right_knee: { x: 120, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '坐姿', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 15, y: 0, z: 0 }, head: { x: 0, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: -30 }, right_shoulder: { x: 0, y: 0, z: 30 }, left_elbow: { x: 90, y: 0, z: 0 }, right_elbow: { x: 90, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: -90, y: 0, z: 0 }, right_knee: { x: -90, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '蹲下', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 30, y: 0, z: 0 }, head: { x: 0, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: -20 }, right_shoulder: { x: 0, y: 0, z: 20 }, left_elbow: { x: 90, y: 0, z: 0 }, right_elbow: { x: 90, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: -135, y: 0, z: 0 }, right_knee: { x: -135, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '单膝跪', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 10, y: 0, z: 0 }, head: { x: 0, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: -20 }, right_shoulder: { x: 0, y: 0, z: 20 }, left_elbow: { x: 90, y: 0, z: 0 }, right_elbow: { x: 90, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: -90, y: 0, z: 0 }, right_knee: { x: 0, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '双膝跪', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 15, y: 0, z: 0 }, head: { x: 0, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: -15 }, right_shoulder: { x: 0, y: 0, z: 15 }, left_elbow: { x: 90, y: 0, z: 0 }, right_elbow: { x: 90, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: -90, y: 0, z: 0 }, right_knee: { x: -90, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '叉腰', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 0, y: 0, z: 0 }, head: { x: 0, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: -45 }, right_shoulder: { x: 0, y: 0, z: 45 }, left_elbow: { x: 90, y: 0, z: 0 }, right_elbow: { x: 90, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: 0, y: 0, z: 0 }, right_knee: { x: 0, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '倚靠', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 0, y: 0, z: 15 }, head: { x: 0, y: 0, z: -15 }, left_shoulder: { x: 0, y: 0, z: -20 }, right_shoulder: { x: 30, y: 0, z: 30 }, left_elbow: { x: 0, y: 0, z: 0 }, right_elbow: { x: 135, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: -30, y: 0, z: 0 }, right_knee: { x: 0, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '鞠躬', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: -45, y: 0, z: 0 }, head: { x: -30, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: -10 }, right_shoulder: { x: 0, y: 0, z: 10 }, left_elbow: { x: 0, y: 0, z: 0 }, right_elbow: { x: 0, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: 0, y: 0, z: 0 }, right_knee: { x: 0, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '思考', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 0, y: 0, z: 0 }, head: { x: 15, y: 0, z: 15 }, left_shoulder: { x: 20, y: 0, z: -30 }, right_shoulder: { x: 0, y: 0, z: 10 }, left_elbow: { x: 120, y: 0, z: 0 }, right_elbow: { x: 90, y: 0, z: 0 }, left_wrist: { x: -30, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: -15, y: 0, z: 0 }, right_knee: { x: 0, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '格斗', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 0, y: 0, z: 20 }, head: { x: 0, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: -45 }, right_shoulder: { x: 45, y: 0, z: 45 }, left_elbow: { x: 90, y: 0, z: 0 }, right_elbow: { x: 45, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: -20 }, right_hip: { x: 0, y: 0, z: 20 }, left_knee: { x: -30, y: 0, z: 0 }, right_knee: { x: -30, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '踢球', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 10, y: 0, z: -30 }, head: { x: 0, y: 0, z: -15 }, left_shoulder: { x: 0, y: 0, z: -30 }, right_shoulder: { x: 0, y: 0, z: 30 }, left_elbow: { x: 90, y: 0, z: 0 }, right_elbow: { x: 90, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 45, y: 0, z: 0 }, left_knee: { x: -30, y: 0, z: 0 }, right_knee: { x: 120, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '投掷', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: -20, y: 0, z: -30 }, head: { x: -10, y: 0, z: -10 }, left_shoulder: { x: 60, y: 0, z: 60 }, right_shoulder: { x: 0, y: 0, z: -20 }, left_elbow: { x: 45, y: 0, z: 0 }, right_elbow: { x: 90, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: -45, y: 0, z: 0 }, right_knee: { x: 0, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '推进', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 30, y: 0, z: 0 }, head: { x: 15, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: -30 }, right_shoulder: { x: 0, y: 0, z: 30 }, left_elbow: { x: 180, y: 0, z: 0 }, right_elbow: { x: 180, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: -45, y: 0, z: 0 }, right_knee: { x: -45, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '招手', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 0, y: 0, z: 0 }, head: { x: 0, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: -45 }, right_shoulder: { x: 45, y: 0, z: 0 }, left_elbow: { x: 0, y: 0, z: 0 }, right_elbow: { x: 45, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 90 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: 0, y: 0, z: 0 }, right_knee: { x: 0, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '伸手', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 0, y: 0, z: 0 }, head: { x: 0, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: -45 }, right_shoulder: { x: 0, y: 0, z: 0 }, left_elbow: { x: 0, y: 0, z: 0 }, right_elbow: { x: 0, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: 0, y: 0, z: 0 }, right_knee: { x: 0, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '抱臂', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 0, y: 0, z: 0 }, head: { x: 0, y: 0, z: 0 }, left_shoulder: { x: 30, y: 0, z: -30 }, right_shoulder: { x: 30, y: 0, z: 30 }, left_elbow: { x: 90, y: 0, z: 0 }, right_elbow: { x: 90, y: 0, z: 0 }, left_wrist: { x: 0, y: 0, z: 0 }, right_wrist: { x: 0, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: 0, y: 0, z: 0 }, right_knee: { x: 0, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
  { name: '看手机', joints: { body: { x: 0, y: 0, z: 0 }, torso: { x: 15, y: 0, z: 0 }, head: { x: -30, y: 0, z: 0 }, left_shoulder: { x: 0, y: 0, z: -30 }, right_shoulder: { x: 0, y: 0, z: 30 }, left_elbow: { x: 120, y: 0, z: 0 }, right_elbow: { x: 120, y: 0, z: 0 }, left_wrist: { x: -90, y: 0, z: 0 }, right_wrist: { x: -90, y: 0, z: 0 }, left_hip: { x: 0, y: 0, z: 0 }, right_hip: { x: 0, y: 0, z: 0 }, left_knee: { x: -30, y: 0, z: 0 }, right_knee: { x: -30, y: 0, z: 0 }, left_ankle: { x: 0, y: 0, z: 0 }, right_ankle: { x: 0, y: 0, z: 0 } } },
];

export const SHOT_PRESETS: Record<ShotPreset, CameraShot> = {
  front_medium: { name: '正面中景', preset: 'front_medium', position: { x: 0, y: 1.2, z: 5 }, target: { x: 0, y: 1, z: 0 }, fov: 50 },
  front_closeup: { name: '正面特写', preset: 'front_closeup', position: { x: 0, y: 1.5, z: 2.5 }, target: { x: 0, y: 1.5, z: 0 }, fov: 40 },
  side_follow: { name: '侧面跟拍', preset: 'side_follow', position: { x: 5, y: 1.2, z: 0 }, target: { x: 0, y: 1, z: 0 }, fov: 55 },
  over_shoulder: { name: '过肩', preset: 'over_shoulder', position: { x: 2, y: 1.2, z: 3 }, target: { x: -2, y: 1, z: 0 }, fov: 50 },
  birdseye: { name: '鸟瞰', preset: 'birdseye', position: { x: 0, y: 10, z: 0 }, target: { x: 0, y: 0, z: 0 }, fov: 80 },
  dutch_angle: { name: '荷兰角', preset: 'dutch_angle', position: { x: 3, y: 1.2, z: 3 }, target: { x: 0, y: 1, z: 0 }, fov: 50 },
  back_long: { name: '背面远景', preset: 'back_long', position: { x: 0, y: 2, z: -8 }, target: { x: 0, y: 1, z: 0 }, fov: 70 },
  three_quarter: { name: '三分之一', preset: 'three_quarter', position: { x: 3, y: 1.2, z: 4 }, target: { x: 0, y: 1, z: 0 }, fov: 55 },
  extreme_closeup: { name: '极端特写', preset: 'extreme_closeup', position: { x: 0, y: 1.5, z: 1.5 }, target: { x: 0, y: 1.5, z: 0 }, fov: 30 },
  wide_angle: { name: '广角', preset: 'wide_angle', position: { x: 0, y: 2, z: 8 }, target: { x: 0, y: 1, z: 0 }, fov: 90 },
  tracking_left: { name: '左跟拍', preset: 'tracking_left', position: { x: -5, y: 1.2, z: 0 }, target: { x: 0, y: 1, z: 0 }, fov: 55 },
  tracking_right: { name: '右跟拍', preset: 'tracking_right', position: { x: 5, y: 1.2, z: 0 }, target: { x: 0, y: 1, z: 0 }, fov: 55 },
  low_angle: { name: '低角度', preset: 'low_angle', position: { x: 0, y: 0.3, z: 4 }, target: { x: 0, y: 1.5, z: 0 }, fov: 60 },
  high_angle: { name: '高角度', preset: 'high_angle', position: { x: 0, y: 4, z: 4 }, target: { x: 0, y: 1, z: 0 }, fov: 60 },
  profile: { name: '侧面', preset: 'profile', position: { x: 4, y: 1.5, z: 0 }, target: { x: 0, y: 1.5, z: 0 }, fov: 45 },
};

export const SHOT_PRESET_GROUPS: Record<string, ShotPreset[]> = {
  front: ['front_medium', 'front_closeup', 'extreme_closeup'],
  side_back: ['side_follow', 'back_long', 'tracking_left', 'tracking_right', 'profile'],
  angle: ['dutch_angle', 'low_angle', 'high_angle'],
  special: ['over_shoulder', 'birdseye', 'wide_angle', 'three_quarter'],
};

export const ASPECT_RATIOS = [
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '1:1', value: '1:1' },
  { label: '21:9', value: '21:9' },
  { label: '4:3', value: '4:3' },
] as const;

export const PANORAMA_PRESETS = [
  { name: '城市夜景', url: '', type: 'gradient', colors: ['#1a1a2e', '#16213e', '#0f3460'] },
  { name: '森林日落', url: '', type: 'gradient', colors: ['#ff7e5f', '#feb47b', '#667eea'] },
  { name: '海滩', url: '', type: 'gradient', colors: ['#0077b6', '#48cae4', '#90e0ef'] },
  { name: '太空', url: '', type: 'gradient', colors: ['#0c0c0c', '#1a1a2e', '#16213e'] },
];

export const COLORS = [
  '#34c759', '#007aff', '#ff9500', '#ff3b30', '#af52de',
  '#5856d6', '#ff2d55', '#00d4aa', '#ffcc00', '#8e8e93',
];

export const STORAGE_KEY = 'director_studio_scene';

export const DEFAULT_SKY_COLOR = '#1a1a2e';

export const DEFAULT_GROUND_OPACITY = 0.3;

export const DEFAULT_GROUND_HEIGHT = 0;

export const DEFAULT_PANORAMA_RADIUS = 50;

export const DEFAULT_FOV = 50;