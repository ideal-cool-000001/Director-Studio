// ═══════════════════════════════════════════
// 角色校验规则
// ═══════════════════════════════════════════

import type { CharacterMetadata } from '@director/shared-types';

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 校验角色数据完整性
 * PRD 硬性规则：
 * - 肖像提示词包含完整要素（五官/发型/服饰/画质参数）
 * - 至少 1 张正面参考图
 */
export function validateCharacter(character: CharacterMetadata, referenceImageCount: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 必须有名称
  if (!character.name?.trim()) {
    errors.push('角色名称不能为空');
  }

  // 必须有描述
  if (!character.description?.trim()) {
    errors.push('角色形象描述不能为空');
  }

  // 肖像提示词检查
  if (character.portrait_prompt) {
    const prompt = character.portrait_prompt.toLowerCase();
    const requiredAspects = [
      { keywords: ['face', 'eyes', 'nose', 'mouth', '五官'], label: '五官' },
      { keywords: ['hair', 'hairstyle', '发型', '头发'], label: '发型' },
      { keywords: ['wear', 'cloth', 'dress', 'outfit', '服饰', '穿'], label: '服饰' },
    ];

    for (const aspect of requiredAspects) {
      const hasAspect = aspect.keywords.some(kw => prompt.includes(kw));
      if (!hasAspect) {
        warnings.push(`肖像提示词可能缺少「${aspect.label}」相关描述`);
      }
    }
  } else {
    warnings.push('尚未生成肖像提示词');
  }

  // 参考图检查
  if (referenceImageCount < 1) {
    errors.push('至少需要 1 张正面参考图审核通过后才能进入下游');
  }

  // 软性：关系对称性检查提示
  if (character.relationships && character.relationships.length > 0) {
    warnings.push('请确保角色关系矩阵双向一致（A→B 的关系和 B→A 应匹配）');
  }

  return { passed: errors.length === 0, errors, warnings };
}
