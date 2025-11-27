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
  
  // 子弹特效
  bulletColor: number;        // 子弹颜色（外圈）
  bulletCoreColor: number;    // 子弹核心颜色
  bulletSize: number;         // 子弹大小
}

/**
 * 所有可用角色配置
 */
export const CHARACTERS: Record<string, CharacterData> = {
  // 默认角色 - 蓝白骑士
  'mage_307': {
    id: 'mage_307',
    title: '圣骑之星',
    name: '艾莉丝',
    description: '见习骑士，属性均衡',
    spritePrefix: 'mage_307',
    assetPath: 'assets/res/player/307',
    
    maxHealth: 100,
    attackPower: 100,    // 基准攻击力
    moveSpeed: 100,
    bulletSpeed: 1600,
    attackDelay: 250,
    
    price: 0,            // 免费（默认拥有）
    isDefault: true,
    
    scale: 0.8,
    color: '#FF69B4',    // 粉色
    
    bulletColor: 0xFF69B4,      // 粉色子弹
    bulletCoreColor: 0xFFFFFF,  // 白色核心
    bulletSize: 12
  },
  
  // 黑发刺客 - 高攻击
  'mage_119': {
    id: 'mage_119',
    title: '暗影刺客',
    name: '莉莉丝',
    description: '神秘敏捷，攻击+20%，生命-10%',
    spritePrefix: 'mage_119',
    assetPath: 'assets/res/player/119',
    
    maxHealth: 90,
    attackPower: 120,    // 攻击力+20%
    moveSpeed: 100,
    bulletSpeed: 1700,   // 子弹更快
    attackDelay: 250,
    
    price: 500,
    isDefault: false,
    
    scale: 0.8,
    color: '#9B59B6',    // 紫色
    
    bulletColor: 0x9B59B6,      // 紫色子弹
    bulletCoreColor: 0xE6E6FA,  // 淡紫色核心
    bulletSize: 12
  },
  
  // 蓝发法师 - 高生命
  'mage_303': {
    id: 'mage_303',
    title: '冰霜法师',
    name: '艾莎',
    description: '冰雪魔法，生命+30%，攻击-10%',
    spritePrefix: 'mage_303',
    assetPath: 'assets/res/player/303',
    
    maxHealth: 130,
    attackPower: 90,     // 攻击力-10%
    moveSpeed: 100,
    bulletSpeed: 1500,
    attackDelay: 250,
    
    price: 600,
    isDefault: false,
    
    scale: 0.8,
    color: '#3498DB',    // 蓝色
    
    bulletColor: 0x3498DB,      // 蓝色子弹
    bulletCoreColor: 0xADD8E6,  // 淡蓝色核心
    bulletSize: 12
  },
  
  // 粉发魔法少女 - 快速射击
  'mage_311': {
    id: 'mage_311',
    title: '魔法少女',
    name: '米娅',
    description: '活力魔法，攻速+30%，攻击-15%',
    spritePrefix: 'mage_311',
    assetPath: 'assets/res/player/311',
    
    maxHealth: 100,
    attackPower: 85,
    moveSpeed: 100,
    bulletSpeed: 1800,   // 子弹最快
    attackDelay: 200,    // 攻击延迟更短
    
    price: 700,
    isDefault: false,
    
    scale: 0.8,
    color: '#27AE60',    // 绿色
    
    bulletColor: 0x27AE60,      // 绿色子弹
    bulletCoreColor: 0x90EE90,  // 淡绿色核心
    bulletSize: 10               // 小一点，更快
  },
  
  // 紫发术士 - 全能型
  'mage_334': {
    id: 'mage_335',
    title: '星辉术士',
    name: '诺娅',
    description: '星辰之力，全属性+10%',
    spritePrefix: 'mage_335',
    assetPath: 'assets/res/player/335',
    
    maxHealth: 110,
    attackPower: 110,
    moveSpeed: 110,
    bulletSpeed: 1650,
    attackDelay: 240,
    
    price: 1000,
    isDefault: false,
    
    scale: 0.8,
    color: '#E67E22',    // 橙色
    
    bulletColor: 0xE67E22,      // 橙色子弹
    bulletCoreColor: 0xFFDAB9,  // 桃色核心
    bulletSize: 12
  },
  
  // 金甲战士 - 终极战士
  'mage_315': {
    id: 'mage_315',
    title: '烈焰骑士',
    name: '露娜',
    description: '最强战士，攻击+30%，生命+20%',
    spritePrefix: 'mage_315',
    assetPath: 'assets/res/player/315',
    
    maxHealth: 120, 
    attackPower: 130,    // 最高攻击力
    moveSpeed: 100,
    bulletSpeed: 1600,
    attackDelay: 250,
    
    price: 1500,         // 最贵
    isDefault: false,
    
    scale: 0.8,
    color: '#E74C3C',    // 红色
    
    bulletColor: 0xE74C3C,      // 红色子弹
    bulletCoreColor: 0xFF6347,  // 番茄红核心
    bulletSize: 14               // 最大，最强
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

