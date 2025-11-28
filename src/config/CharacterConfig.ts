/**
 * 角色配置文件
 * 统一管理所有可选角色的属性
 */

export interface CharacterData {
  id: string;                 // 唯一ID
  title: string;              // 称号
  name: string;               // 真实名字
  description: string;        // 角色描述
  spritePrefix: string;       // 精灵前缀（如 monster307）
  assetPath: string;          // 资源路径
  
  // 基础属性
  maxHealth: number;          // 最大生命值
  attackPower: number;        // 攻击力加成（百分比，100为基准）
  moveSpeed: number;          // 移动速度（暂未使用，预留）
  bulletSpeed: number;        // 子弹速度
  attackDelay: number;        // 攻击延迟（毫秒）
  
  // 购买信息
  price: number;              // 购买价格（金币）
  isDefault: boolean;         // 是否默认拥有
  
  // 视觉属性
  scale: number;              // 缩放比例
  color: string;              // 代表颜色（用于UI展示）
  
  // 特效配置
  bulletEffect: string;       // 子弹特效ID（如 'effect_008'）
  hitEffect: string;          // 击中特效ID（如 'effect_020h'）
  effectScale: number;        // 特效缩放（默认1.0）
}

/**
 * 所有可用角色配置
 */
export const CHARACTERS: Record<string, CharacterData> = {
  // 默认角色 - 冰霜之星
  'mage_307': {
    id: 'mage_307',
    title: '冰霜之星',
    name: '艾莉丝',
    description: '冰霜魔法，属性均衡',
    spritePrefix: 'mage_307',
    assetPath: 'assets/res/player_atlas/307', // 更新为atlas路径
    
    maxHealth: 100,
    attackPower: 100,    // 基准攻击力
    moveSpeed: 100,
    bulletSpeed: 1600,
    attackDelay: 250,
    
    price: 0,            // 免费（默认拥有）
    isDefault: true,
    
    scale: 0.8,
    color: '#3498DB',    // 蓝色（蓝色和金色）
    
    bulletEffect: 'effect_008', // 蓝色电球（12帧，完美匹配蓝色和金色）
    hitEffect: 'effect_061h',   // 蓝色星爆（8帧，电蓝色射线，完美匹配）
    effectScale: 0.5            // 缩小到一半
  },
  
  // 光明使者 - 高攻击
  'mage_119': {
    id: 'mage_119',
    title: '光明使者',
    name: '莉莉丝',
    description: '光明魔法，攻击+20%，生命-10%',
    spritePrefix: 'mage_119',
    assetPath: 'assets/res/player_atlas/119', // 更新为atlas路径
    
    maxHealth: 90,
    attackPower: 120,    // 攻击力+20%
    moveSpeed: 100,
    bulletSpeed: 1700,   // 子弹更快
    attackDelay: 250,
    
    price: 500,
    isDefault: false,
    
    scale: 0.8,
    color: '#87CEEB',    // 浅蓝色（光属性，浅蓝色和白色）
    
    bulletEffect: 'effect_087f', // 黄色/金色水滴状能量（9帧，完美匹配光属性）
    hitEffect: 'effect_036h',     // 圣光爆炸（14帧，完美匹配光属性）
    effectScale: 0.5              // 缩小到一半
  },
  
  // 暗影法师 - 高生命
  'mage_303': {
    id: 'mage_303',
    title: '暗影法师',
    name: '艾莎',
    description: '暗影魔法，生命+30%，攻击-10%',
    spritePrefix: 'mage_303',
    assetPath: 'assets/res/player_atlas/303', // 更新为atlas路径
    
    maxHealth: 130,
    attackPower: 90,     // 攻击力-10%
    moveSpeed: 100,
    bulletSpeed: 1500,
    attackDelay: 250,
    
    price: 600,
    isDefault: false,
    
    scale: 0.8,
    color: '#6A1B9A',    // 深紫色（暗属性，深蓝色和金色）
    
    bulletEffect: 'effect_020f', // 紫色和白色能量投射物（7帧，完美匹配暗属性）
    hitEffect: 'effect_088h',    // 神秘爆炸（17帧，大型暗影爆炸，更震撼）
    effectScale: 0.5             // 缩小到一半
  },
  
  // 魔法少女 - 快速射击
  'mage_311': {
    id: 'mage_311',
    title: '魔法少女',
    name: '米娅',
    description: '粉色魔法，攻速+30%，攻击-15%',
    spritePrefix: 'mage_311',
    assetPath: 'assets/res/player_atlas/311', // 更新为atlas路径
    
    maxHealth: 100,
    attackPower: 85,
    moveSpeed: 100,
    bulletSpeed: 1800,   // 子弹最快
    attackDelay: 200,    // 攻击延迟更短
    
    price: 700,
    isDefault: false,
    
    scale: 0.8,
    color: '#FF69B4',    // 粉色（粉色属性）
    
    bulletEffect: 'effect_036f', // 混合能量飞弹（10帧，火冰混合）
    hitEffect: 'effect_036h',     // 圣光爆炸（14帧，金色闪光，神圣爆发）
    effectScale: 0.45            // 缩小到一半（原来0.9）
  },
  
  // 星辉术士 - 全能型
  'mage_335': {
    id: 'mage_335',
    title: '星辉术士',
    name: '诺娅',
    description: '星辰之力，全属性+10%',
    spritePrefix: 'mage_335',
    assetPath: 'assets/res/player_atlas/335', // 更新为atlas路径
    
    maxHealth: 110,
    attackPower: 110,
    moveSpeed: 110,
    bulletSpeed: 1650,
    attackDelay: 240,
    
    price: 1000,
    isDefault: false,
    
    scale: 0.8,
    color: '#E67E22',    // 橙色/金色（星光属性，紫色和金色）
    
    bulletEffect: 'effect_036f', // 火冰混合能量（10帧，包含金色元素，匹配星光）
    hitEffect: 'effect_036h',     // 圣光爆炸（14帧，橙色、黄色、白色，匹配金色和星光）
    effectScale: 0.5              // 缩小到一半
  },
  
  // 烈焰骑士 - 终极战士
  'mage_315': {
    id: 'mage_315',
    title: '烈焰骑士',
    name: '露娜',
    description: '最强战士，攻击+30%，生命+20%',
    spritePrefix: 'mage_315',
    assetPath: 'assets/res/player_atlas/315', // 更新为atlas路径
    
    maxHealth: 120, 
    attackPower: 130,    // 最高攻击力
    moveSpeed: 100,
    bulletSpeed: 1600,
    attackDelay: 250,
    
    price: 1500,         // 最贵
    isDefault: false,
    
    scale: 0.8,
    color: '#E74C3C',    // 红色（火焰属性，红色和金色）
    
    bulletEffect: 'effect_030f', // 红色/橙色/黄色火焰飞弹（9帧，完美匹配火焰属性）
    hitEffect: 'effect_070',     // 烈焰爆炸（14帧，三个橙色/红色火焰，最震撼）
    effectScale: 0.55            // 缩小到一半（原来1.1）
  }
};

/**
 * 获取角色配置
 */
export function getCharacterConfig(id: string): CharacterData | null {
  return CHARACTERS[id] || null;
}

/**
 * 获取所有角色列表
 */
export function getAllCharacters(): CharacterData[] {
  return Object.values(CHARACTERS);
}

/**
 * 获取默认角色
 */
export function getDefaultCharacter(): CharacterData {
  return CHARACTERS['mage_307'];
}

/**
 * 从assetPath提取文件夹名（atlas key）
 * 例如: 'assets/res/player_atlas/307' -> '307'
 */
export function extractFolderFromAssetPath(assetPath: string): string {
  const parts = assetPath.split('/');
  return parts[parts.length - 1];
}

