// ═══════════════════════════════════════════
// 分镜校验规则
// ═══════════════════════════════════════════

import type { StoryboardMetadata, ShotSize, CameraMovement } from '@director/shared-types';

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

const ALL_SHOT_SIZES: ShotSize[] = ['extreme_long', 'long', 'medium', 'close_up', 'extreme_close_up'];

const ALL_CAMERA_MOVEMENTS: CameraMovement[] = ['push_in', 'pull_out', 'pan', 'tilt', 'orbit', 'follow', 'shake', 'static', 'rotate'];

/**
 * 校验分镜数据完整性
 * PRD 硬性规则：
 * - 景别覆盖 ≥ 5 种
 * - 运镜覆盖 ≥ 5 种
 * - 相邻镜头景别变化
 * - 每个 shot 有完整三段（start/middle/end）
 */
export function validateStoryboard(storyboard: StoryboardMetadata): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const shots = storyboard.shots;

  if (!shots || shots.length === 0) {
    errors.push('分镜不能为空，至少需要一个镜头');
    return { passed: false, errors, warnings };
  }

  // 1. 景别覆盖 ≥ 5 种
  const usedShotSizes = new Set(shots.map(s => s.shot_size));
  if (usedShotSizes.size < 5) {
    const missing = ALL_SHOT_SIZES.filter(s => !usedShotSizes.has(s));
    errors.push(`景别覆盖不足：仅使用 ${usedShotSizes.size} 种，缺少 [${missing.join(', ')}]`);
  }

  // 2. 运镜覆盖 ≥ 5 种
  const usedMovements = new Set(shots.map(s => s.camera_movement));
  if (usedMovements.size < 5) {
    const missing = ALL_CAMERA_MOVEMENTS.filter(m => !usedMovements.has(m));
    errors.push(`运镜覆盖不足：仅使用 ${usedMovements.size} 种，缺少 [${missing.join(', ')}]`);
  }

  // 3. 相邻镜头景别变化
  for (let i = 1; i < shots.length; i++) {
    if (shots[i].shot_size === shots[i - 1].shot_size) {
      errors.push(`镜头 ${shots[i].shot_number} 与 ${shots[i - 1].shot_number} 景别相同 (${shots[i].shot_size})，需变化`);
    }
  }

  // 4. 每个 shot 有完整三段
  for (const shot of shots) {
    const { three_act } = shot;
    if (!three_act?.start?.description || !three_act?.middle?.description || !three_act?.end?.description) {
      errors.push(`镜头 ${shot.shot_number} 缺少完整的三段式描述（start/middle/end）`);
    }
  }

  // 5. 软性：总时长检查
  const totalDuration = shots.reduce((sum, s) => sum + s.duration, 0);
  if (totalDuration < 10) {
    warnings.push(`总时长仅 ${totalDuration}s，建议不少于 10 秒`);
  }

  return { passed: errors.length === 0, errors, warnings };
}
