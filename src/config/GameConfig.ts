/**
 * 游戏全局配置
 * 统一管理游戏中的各种配置参数
 */

/**
 * 特殊题配置
 */
export const SPECIAL_QUESTION_CONFIG = {
  // 特殊题出现概率（0.0 - 1.0）
  spawnProbability: 0.2, // 20%
  
  // 特殊题倒计时（秒）
  countdownSeconds: 8,
  
  // 特殊题类型选择概率（0.0 - 1.0）
  // true: 使用更高难度，false: 使用混合运算
  higherDifficultyProbability: 0.5 // 50%
};

/**
 * 获取特殊题出现概率
 */
export function getSpecialQuestionProbability(): number {
  return SPECIAL_QUESTION_CONFIG.spawnProbability;
}

/**
 * 获取特殊题倒计时（秒）
 */
export function getSpecialQuestionCountdown(): number {
  return SPECIAL_QUESTION_CONFIG.countdownSeconds;
}

/**
 * 获取特殊题类型选择概率
 */
export function getSpecialQuestionTypeProbability(): number {
  return SPECIAL_QUESTION_CONFIG.higherDifficultyProbability;
}

/**
 * 无限模式配置
 */
export const INFINITE_MODE_CONFIG = {
  // 无限模式下特殊题出现概率（0.0 - 1.0）
  specialQuestionProbability: 0.4, // 40%（比普通模式高）
  
  // 无限模式是否启用
  enabled: true
};

/**
 * 获取无限模式下特殊题出现概率
 */
export function getInfiniteModeSpecialQuestionProbability(): number {
  return INFINITE_MODE_CONFIG.specialQuestionProbability;
}

/**
 * 检查无限模式是否启用
 */
export function isInfiniteModeEnabled(): boolean {
  return INFINITE_MODE_CONFIG.enabled;
}

