/**
 * 玩家数据接口
 */
export interface PlayerData {
  playerName: string;
  coins: number;
  totalStars: number;
  levelProgress: LevelProgress[];
  ownedCharacters: string[];            // 拥有的角色ID列表
  currentCharacter: string;             // 当前使用的角色ID
  infiniteModeRecords?: InfiniteModeRecord[]; // 无限模式记录（可选，兼容旧数据）
}

/**
 * 关卡进度接口
 */
export interface LevelProgress {
  world: number;
  level: number;
  stars: number;
  highScore: number;
  isCompleted: boolean;
}

/**
 * 无限模式记录接口
 */
export interface InfiniteModeRecord {
  world: number;
  level: number;
  playerName: string;
  killCount: number;        // 击杀怪物数
  survivalTime: number;     // 存活时间（秒）
  timestamp: number;         // 记录时间戳
}

/**
 * 无限模式记录接口
 */
export interface InfiniteModeRecord {
  world: number;
  level: number;
  playerName: string;
  killCount: number;        // 击杀怪物数
  survivalTime: number;     // 存活时间（秒）
  timestamp: number;         // 记录时间戳
}

/**
 * 数据管理器
 * 负责玩家数据的保存和加载
 */
export default class DataManager {
  private static instance: DataManager;
  private static readonly SAVE_KEY = 'MathAdventure_SaveData';
  
  public playerData: PlayerData;
  
  private constructor() {
    this.playerData = this.getDefaultData();
    this.loadData();
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }
  
  /**
   * 获取默认数据
   */
  private getDefaultData(): PlayerData {
    return {
      playerName: '',  // 初始名字为空，必须由玩家设置
      coins: 0,
      totalStars: 0,
      levelProgress: [],
      ownedCharacters: ['mage_307'],  // 默认拥有粉色法师
      currentCharacter: 'mage_307'    // 默认使用粉色法师
    };
  }
  
  /**
   * 加载数据
   */
  public loadData(): void {
    try {
      const savedData = localStorage.getItem(DataManager.SAVE_KEY);
      if (savedData) {
        this.playerData = JSON.parse(savedData);
        console.log('数据加载成功');
      } else {
        // 首次游戏，解锁第一关
        this.playerData = this.getDefaultData();
        this.playerData.levelProgress.push({
          world: 1,
          level: 1,
          stars: 0,
          highScore: 0,
          isCompleted: false
        });
        this.saveData();
      }
    } catch (error) {
      console.error('数据加载失败', error);
      this.playerData = this.getDefaultData();
    }
  }
  
  /**
   * 保存数据
   */
  public saveData(): void {
    try {
      const dataStr = JSON.stringify(this.playerData);
      localStorage.setItem(DataManager.SAVE_KEY, dataStr);
      console.log('数据保存成功');
    } catch (error) {
      console.error('数据保存失败', error);
    }
  }
  
  /**
   * 添加金币
   */
  public addCoins(amount: number): void {
    this.playerData.coins += amount;
    this.saveData();
  }
  
  /**
   * 使用金币
   */
  public spendCoins(amount: number): boolean {
    if (this.playerData.coins >= amount) {
      this.playerData.coins -= amount;
      this.saveData();
      return true;
    }
    return false;
  }
  
  /**
   * 保存关卡进度
   */
  public saveLevelProgress(world: number, level: number, stars: number, score: number): void {
    // 查找是否已有该关卡记录
    const existingIndex = this.playerData.levelProgress.findIndex(
      p => p.world === world && p.level === level
    );
    
    if (existingIndex !== -1) {
      const existing = this.playerData.levelProgress[existingIndex];
      
      // 只更新更好的成绩
      if (stars > existing.stars) {
        const starDiff = stars - existing.stars;
        this.playerData.totalStars += starDiff;
        existing.stars = stars;
      }
      
      if (score > existing.highScore) {
        existing.highScore = score;
      }
      
      existing.isCompleted = true;
    } else {
      // 新关卡
      this.playerData.levelProgress.push({
        world,
        level,
        stars,
        highScore: score,
        isCompleted: true
      });
      this.playerData.totalStars += stars;
    }
    
    // 解锁下一关
    this.unlockNextLevel(world, level);
    this.saveData();
  }
  
  /**
   * 解锁下一关
   */
  private unlockNextLevel(currentWorld: number, currentLevel: number): void {
    const levelsPerWorld = [5, 4, 3]; // 每个世界的关卡数
    
    let nextWorld = currentWorld;
    let nextLevel = currentLevel + 1;
    
    // 检查是否需要进入下一个世界
    if (nextLevel > levelsPerWorld[currentWorld - 1]) {
      nextWorld++;
      nextLevel = 1;
    }
    
    // 检查下一关是否已存在
    if (nextWorld <= 3) {
      const exists = this.playerData.levelProgress.some(
        p => p.world === nextWorld && p.level === nextLevel
      );
      
      if (!exists) {
        this.playerData.levelProgress.push({
          world: nextWorld,
          level: nextLevel,
          stars: 0,
          highScore: 0,
          isCompleted: false
        });
      }
    }
  }
  
  /**
   * 检查关卡是否解锁
   */
  public isLevelUnlocked(world: number, level: number): boolean {
    // 第一关总是解锁的
    if (world === 1 && level === 1) return true;
    
    return this.playerData.levelProgress.some(
      p => p.world === world && p.level === level
    );
  }
  
  /**
   * 获取关卡星级
   */
  public getLevelStars(world: number, level: number): number {
    const progress = this.playerData.levelProgress.find(
      p => p.world === world && p.level === level
    );
    return progress ? progress.stars : 0;
  }
  
  /**
   * 重置所有数据
   */
  public resetAllData(): void {
    localStorage.removeItem(DataManager.SAVE_KEY);
    this.playerData = this.getDefaultData();
    this.loadData();
  }
  
  // ============ 新的角色/皮肤系统方法 ============
  
  /**
   * 检查是否拥有某个角色
   */
  public isCharacterOwned(characterId: string): boolean {
    // 兼容旧数据：如果没有ownedCharacters字段，初始化它
    if (!this.playerData.ownedCharacters) {
      this.playerData.ownedCharacters = ['mage_307'];
    }
    return this.playerData.ownedCharacters.includes(characterId);
  }
  
  /**
   * 购买角色
   */
  public purchaseCharacter(characterId: string, price: number): boolean {
    // 兼容旧数据
    if (!this.playerData.ownedCharacters) {
      this.playerData.ownedCharacters = ['mage_307'];
    }
    
    // 检查是否已拥有
    if (this.isCharacterOwned(characterId)) {
      return false;
    }
    
    // 检查金币是否足够
    if (this.playerData.coins < price) {
      return false;
    }
    
    // 扣除金币
    this.playerData.coins -= price;
    
    // 添加到拥有列表
    this.playerData.ownedCharacters.push(characterId);
    
    this.saveData();
    return true;
  }
  
  /**
   * 设置当前使用的角色
   */
  public setCurrentCharacter(characterId: string): void {
    // 兼容旧数据
    if (!this.playerData.ownedCharacters) {
      this.playerData.ownedCharacters = ['mage_307'];
    }
    if (!this.playerData.currentCharacter) {
      this.playerData.currentCharacter = 'mage_307';
    }
    
    // 只能装备已拥有的角色
    if (this.isCharacterOwned(characterId)) {
      this.playerData.currentCharacter = characterId;
      this.saveData();
    }
  }
  
  /**
   * 获取当前使用的角色ID
   */
  public getCurrentCharacter(): string {
    // 兼容旧数据
    if (!this.playerData.currentCharacter) {
      this.playerData.currentCharacter = 'mage_307';
      this.saveData();
    }
    return this.playerData.currentCharacter;
  }
  
  /**
   * 保存无限模式记录
   */
  public saveInfiniteModeRecord(world: number, level: number, killCount: number, survivalTime: number): void {
    // 兼容旧数据
    if (!this.playerData.infiniteModeRecords) {
      this.playerData.infiniteModeRecords = [];
    }
    
    const record: InfiniteModeRecord = {
      world,
      level,
      playerName: this.playerData.playerName || '勇敢的小朋友',
      killCount,
      survivalTime,
      timestamp: Date.now()
    };
    
    // 添加到记录列表
    this.playerData.infiniteModeRecords.push(record);
    
    // 只保留每个关卡的前100条记录（避免数据过大）
    const levelRecords = this.playerData.infiniteModeRecords.filter(
      r => r.world === world && r.level === level
    );
    if (levelRecords.length > 100) {
      // 按击杀数降序排序，保留前100条
      levelRecords.sort((a, b) => b.killCount - a.killCount);
      const toKeep = levelRecords.slice(0, 100);
      
      // 移除该关卡的所有记录，然后添加保留的记录
      this.playerData.infiniteModeRecords = this.playerData.infiniteModeRecords.filter(
        r => !(r.world === world && r.level === level)
      );
      this.playerData.infiniteModeRecords.push(...toKeep);
    }
    
    this.saveData();
  }
  
  /**
   * 获取指定关卡的无限模式排行榜
   */
  public getInfiniteModeLeaderboard(world: number, level: number): InfiniteModeRecord[] {
    // 兼容旧数据
    if (!this.playerData.infiniteModeRecords) {
      return [];
    }
    
    return this.playerData.infiniteModeRecords
      .filter(r => r.world === world && r.level === level)
      .sort((a, b) => {
        // 先按击杀数降序，再按存活时间降序
        if (b.killCount !== a.killCount) {
          return b.killCount - a.killCount;
        }
        return b.survivalTime - a.survivalTime;
      })
      .slice(0, 50); // 只返回前50名
  }
  
  /**
   * 检查关卡是否已通关（用于判断是否进入无限模式）
   */
  public isLevelCompleted(world: number, level: number): boolean {
    const progress = this.playerData.levelProgress.find(
      p => p.world === world && p.level === level
    );
    return progress?.isCompleted === true;
  }
}
