// ═══════════════════════════════════════════
// 场景红线校验 — 禁止环境提示词中出现人物词汇
// ═══════════════════════════════════════════

/** 禁止出现在场景环境提示词中的人物相关词汇 */
const FORBIDDEN_PERSON_WORDS = [
  // 英文
  'person', 'people', 'man', 'woman', 'boy', 'girl', 'child', 'children',
  'figure', 'standing', 'sitting', 'walking', 'running', 'human',
  'face', 'body', 'hand', 'hands', 'arm', 'arms', 'leg', 'legs',
  'male', 'female', 'guy', 'lady', 'teenager', 'elderly',
  // 中文
  '人', '男人', '女人', '男孩', '女孩', '孩子', '人物',
  '站立', '坐着', '行走', '跑步', '脸', '身体',
];

export interface RedlineCheckResult {
  passed: boolean;
  violations: string[];
  message: string;
}

/**
 * 检查场景环境提示词是否包含禁止的人物词汇
 * 硬性规则：发现即阻断，不允许进入下游
 */
export function checkSceneRedline(environmentPrompt: string): RedlineCheckResult {
  const lowerPrompt = environmentPrompt.toLowerCase();
  const violations: string[] = [];

  for (const word of FORBIDDEN_PERSON_WORDS) {
    // 使用词边界匹配，避免误判（如 "human" 不应匹配 "humanity"）
    const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'gi');
    if (regex.test(lowerPrompt)) {
      violations.push(word);
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    message: violations.length === 0
      ? '通过：环境提示词未检测到人物相关词汇'
      : `红线违规：环境提示词包含禁止的人物词汇 [${violations.join(', ')}]，请移除后重试`,
  };
}
