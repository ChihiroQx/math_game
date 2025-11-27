/**
 * 怪物配置文件
 * 统一管理所有怪物的属性
 */

export interface MonsterData {
  id: string;                 // 唯一ID
  name: string;               // 怪物名称
  spritePrefix: string;       // 精灵前缀（如 monster1）
  assetPath: string;          // 资源路径
  
  // 基础属性
  baseHealth: number;         // 基础生命值
  baseDamage: number;         // 基础攻击力
  moveSpeed: number;          // 移动速度（像素/秒）
  attackRange: number;        // 攻击范围（像素）
  attackInterval: number;     // 攻击间隔（毫秒）
  
  // 视觉属性
  scale: number;              // 缩放比例
  color: number;              // 代表颜色（用于UI）
}

/**
 * 所有怪物配置
 */
export const MONSTERS: Record<string, MonsterData> = {
  // 怪物1 - 普通
  'monster_1': {
    id: 'monster_1',
    name: '绿色史莱姆',
    spritePrefix: 'monster1',
    assetPath: 'assets/res/monster/monster1',
    
    baseHealth: 50,
    baseDamage: 10,
    moveSpeed: 60,
    attackRange: 150,
    attackInterval: 2000,
    
    scale: 0.6,
    color: 0x27AE60
  },
  
  // 怪物2 - 稍强
  'monster_2': {
    id: 'monster_2',
    name: '蓝色史莱姆',
    spritePrefix: 'monster004',
    assetPath: 'assets/res/monster/monster004',
    
    baseHealth: 60,
    baseDamage: 12,
    moveSpeed: 55,
    attackRange: 150,
    attackInterval: 2000,
    
    scale: 0.6,
    color: 0x3498DB
  },
  
  // 怪物3 - 中等
  'monster_3': {
    id: 'monster_3',
    name: '紫色史莱姆',
    spritePrefix: 'monster005',
    assetPath: 'assets/res/monster/monster005',
    
    baseHealth: 70,
    baseDamage: 15,
    moveSpeed: 50,
    attackRange: 150,
    attackInterval: 2000,
    
    scale: 0.6,
    color: 0x9B59B6
  },
  
  // 怪物4 - 强
  'monster_4': {
    id: 'monster_4',
    name: '红色史莱姆',
    spritePrefix: 'monster006',
    assetPath: 'assets/res/monster/monster006',
    
    baseHealth: 80,
    baseDamage: 18,
    moveSpeed: 65,
    attackRange: 150,
    attackInterval: 1800,
    
    scale: 0.6,
    color: 0xE74C3C
  },
  
  // 怪物5 - 快速
  'monster_5': {
    id: 'monster_5',
    name: '黄色史莱姆',
    spritePrefix: 'monster007',
    assetPath: 'assets/res/monster/monster007',
    
    baseHealth: 65,
    baseDamage: 14,
    moveSpeed: 75,          // 移动速度快
    attackRange: 150,
    attackInterval: 1800,
    
    scale: 0.6,
    color: 0xF1C40F
  },
  
  // 怪物6 - 肉盾
  'monster_6': {
    id: 'monster_6',
    name: '灰色史莱姆',
    spritePrefix: 'monster002',
    assetPath: 'assets/res/monster/monster002',
    
    baseHealth: 100,        // 高生命
    baseDamage: 12,
    moveSpeed: 45,          // 移动慢
    attackRange: 150,
    attackInterval: 2200,
    
    scale: 0.6,
    color: 0x95A5A6
  },
  
  // 怪物7 - 精英
  'monster_7': {
    id: 'monster_7',
    name: '黑色史莱姆',
    spritePrefix: 'monster009',
    assetPath: 'assets/res/monster/monster009',
    
    baseHealth: 90,
    baseDamage: 20,
    moveSpeed: 58,
    attackRange: 150,
    attackInterval: 1800,
    
    scale: 0.6,
    color: 0x34495E
  },
  
  // 怪物8 - Boss型
  'monster_8': {
    id: 'monster_8',
    name: '彩色史莱姆',
    spritePrefix: 'monster009',
    assetPath: 'assets/res/monster/monster009',
    
    baseHealth: 120,
    baseDamage: 25,
    moveSpeed: 50,
    attackRange: 150,
    attackInterval: 1500,
    
    scale: 0.6,
    color: 0xFF69B4
  }
};

/**
 * 获取怪物配置
 */
export function getMonsterConfig(id: string): MonsterData | null {
  return MONSTERS[id] || null;
}

/**
 * 获取所有怪物列表
 */
export function getAllMonsters(): MonsterData[] {
  return Object.values(MONSTERS);
}

/**
 * 根据难度获取随机怪物ID
 */
export function getRandomMonsterIdByDifficulty(difficulty: number): string {
  const monsterIds = Object.keys(MONSTERS);
  // 根据难度选择怪物范围
  let availableMonsters: string[];
  
  if (difficulty <= 2) {
    availableMonsters = monsterIds.slice(0, 3); // 怪物1-3
  } else if (difficulty <= 4) {
    availableMonsters = monsterIds.slice(0, 5); // 怪物1-5
  } else if (difficulty <= 6) {
    availableMonsters = monsterIds.slice(0, 7); // 怪物1-7
  } else {
    availableMonsters = monsterIds; // 所有怪物
  }
  
  const randomIndex = Math.floor(Math.random() * availableMonsters.length);
  return availableMonsters[randomIndex];
}

