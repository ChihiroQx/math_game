/**
 * 特效配置文件
 * 统一管理所有游戏特效
 */

export interface EffectData {
  id: string;              // 特效ID（如 'effect_008'）
  name: string;            // 特效名称
  frames: number;          // 总帧数
  frameRate: number;       // 帧率（每秒帧数）
  type: 'bullet' | 'hit' | 'buff' | 'other';  // 特效类型
  description: string;     // 描述
  color?: string;          // 主色调（用于识别）
}

/**
 * 所有特效配置
 */
export const EFFECTS: Record<string, EffectData> = {
  // ========== 子弹特效 ==========
  
  'effect_008': {
    id: 'effect_008',
    name: '蓝色电球',
    frames: 12,
    frameRate: 24,
    type: 'bullet',
    description: '蓝色能量球，白色核心，内部有闪电状裂纹，蓝色光晕',
    color: '#3498DB'
  },
  
  'effect_020f': {
    id: 'effect_020f',
    name: '暗影飞弹',
    frames: 7,
    frameRate: 20,
    type: 'bullet',
    description: '紫色和白色能量投射物，从左到右移动，带有蓝色轮廓',
    color: '#9B59B6'
  },
  
  'effect_030f': {
    id: 'effect_030f',
    name: '火焰飞弹',
    frames: 9,
    frameRate: 20,
    type: 'bullet',
    description: '红色/橙色/黄色火焰飞弹，中心明亮，边缘有不规则的火焰形状',
    color: '#E74C3C'
  },
  
  'effect_036f': {
    id: 'effect_036f',
    name: '混合能量飞弹',
    frames: 10,
    frameRate: 22,
    type: 'bullet',
    description: '红色-橙色和蓝色-青色混合能量，中心有白色亮点，周围有雪花和星星粒子',
    color: '#FF8C00'
  },
  
  'effect_087f': {
    id: 'effect_087f',
    name: '圣光飞弹',
    frames: 9,
    frameRate: 22,
    type: 'bullet',
    description: '黄色/金色水滴状能量投射物，带有拖尾效果',
    color: '#FFD700'
  },
  
  // ========== 击中特效 ==========
  
  'effect_036h': {
    id: 'effect_036h',
    name: '圣光爆炸',
    frames: 14,
    frameRate: 30,
    type: 'hit',
    description: '金色闪光，神圣爆发',
    color: '#FFD700'
  },
  
  'effect_061h': {
    id: 'effect_061h',
    name: '蓝色星爆',
    frames: 8,
    frameRate: 30,
    type: 'hit',
    description: '蓝色星爆效果，中心明亮，向外扩散出多条电蓝色射线和白色粒子',
    color: '#3498DB'
  },
  
  'effect_070': {
    id: 'effect_070',
    name: '烈焰爆炸',
    frames: 14,
    frameRate: 30,
    type: 'hit',
    description: '大型火爆，最强威力',
    color: '#FF6347'
  },
  
  'effect_088h': {
    id: 'effect_088h',
    name: '神秘爆炸',
    frames: 17,
    frameRate: 30,
    type: 'hit',
    description: '神秘爆炸，大型',
    color: '#6A1B9A'
  },
  
};

/**
 * 获取特效配置
 */
export function getEffectConfig(id: string): EffectData | null {
  return EFFECTS[id] || null;
}

/**
 * 获取所有子弹特效
 */
export function getBulletEffects(): EffectData[] {
  return Object.values(EFFECTS).filter(effect => effect.type === 'bullet');
}

/**
 * 获取所有击中特效
 */
export function getHitEffects(): EffectData[] {
  return Object.values(EFFECTS).filter(effect => effect.type === 'hit');
}

/**
 * 根据颜色获取推荐特效
 */
export function getEffectsByColor(color: string, type: 'bullet' | 'hit'): EffectData[] {
  return Object.values(EFFECTS).filter(
    effect => effect.type === type && effect.color === color
  );
}

