/**
 * 资源管理器
 * 负责游戏过程中的资源加载和管理
 * 与 PreloadScene 不同，PreloadScene 只负责游戏启动前的预加载
 */

import Phaser from 'phaser';
import { getAllCharacters } from '../config/CharacterConfig';

export default class ResourceManager {
  private static instance: ResourceManager;
  private scene: Phaser.Scene | null = null;
  
  // 角色ID到文件夹的映射
  private readonly characterMap: Record<string, string> = {
    'mage_307': '307',
    'mage_119': '119',
    'mage_303': '303',
    'mage_311': '311',
    'mage_335': '335',
    'mage_315': '315'
  };
  
  // 怪物类型映射
  private readonly monsterTypes = [
    { folder: 'monster', prefix: 'monster' },
    { folder: 'monster1', prefix: 'monster1' },
    { folder: 'monster004', prefix: 'monster004' },
    { folder: 'monster005', prefix: 'monster005' },
    { folder: 'monster006', prefix: 'monster006' },
    { folder: 'monster007', prefix: 'monster007' },
    { folder: 'monster002', prefix: 'monster002' },
    { folder: 'monster009', prefix: 'monster009' }
  ];
  
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }
  
  /**
   * 设置当前场景（用于资源加载）
   */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }
  
  /**
   * 检查角色资源是否已加载
   */
  public isCharacterLoaded(characterId: string): boolean {
    if (!this.scene) return false;
    const testKey = `${characterId}_wait_001`;
    return this.scene.textures.exists(testKey);
  }
  
  /**
   * 检查怪物资源是否已加载
   */
  public isMonsterLoaded(difficulty: number): boolean {
    if (!this.scene) return false;
    const testKey = `monster${difficulty}_wait_001`;
    return this.scene.textures.exists(testKey);
  }
  
  /**
   * 延迟加载角色资源
   */
  public async loadCharacter(characterId: string): Promise<void> {
    if (!this.scene) {
      throw new Error('ResourceManager: 场景未设置');
    }
    
    // 检查是否已加载
    if (this.isCharacterLoaded(characterId)) {
      return;
    }
    
    const folder = this.characterMap[characterId];
    if (!folder) {
      throw new Error(`未知角色ID: ${characterId}`);
    }
    
    // 加载角色资源
    this.loadCharacterSprites(characterId, folder);
    
    // 等待加载完成
    return new Promise<void>((resolve, reject) => {
      const completeHandler = () => {
        this.createCharacterAnimations(characterId);
        resolve();
      };
      
      const errorHandler = (file: any) => {
        this.scene!.load.off('complete', completeHandler);
        this.scene!.load.off('loaderror', errorHandler);
        reject(new Error(`加载角色资源失败: ${characterId}, 文件: ${file.key}`));
      };
      
      this.scene!.load.once('complete', completeHandler);
      this.scene!.load.once('loaderror', errorHandler);
      
      this.scene!.load.start();
    });
  }
  
  /**
   * 延迟加载怪物资源
   */
  public async loadMonster(difficulty: number): Promise<void> {
    if (!this.scene) {
      throw new Error('ResourceManager: 场景未设置');
    }
    
    // 检查是否已加载
    if (this.isMonsterLoaded(difficulty)) {
      return;
    }
    
    if (difficulty < 1 || difficulty > this.monsterTypes.length) {
      throw new Error(`无效的怪物难度: ${difficulty}`);
    }
    
    const type = this.monsterTypes[difficulty - 1];
    
    // 加载怪物资源
    this.loadMonsterType(difficulty, type.folder, type.prefix);
    
    // 等待加载完成
    return new Promise<void>((resolve, reject) => {
      const completeHandler = () => {
        this.createMonsterAnimations(difficulty);
        resolve();
      };
      
      const errorHandler = (file: any) => {
        this.scene!.load.off('complete', completeHandler);
        this.scene!.load.off('loaderror', errorHandler);
        reject(new Error(`加载怪物资源失败: monster${difficulty}, 文件: ${file.key}`));
      };
      
      this.scene!.load.once('complete', completeHandler);
      this.scene!.load.once('loaderror', errorHandler);
      
      this.scene!.load.start();
    });
  }
  
  /**
   * 批量加载多个角色资源
   */
  public async loadCharacters(characterIds: string[]): Promise<void> {
    const promises = characterIds
      .filter(id => !this.isCharacterLoaded(id))
      .map(id => this.loadCharacter(id));
    
    await Promise.all(promises);
  }
  
  /**
   * 加载单个角色的精灵
   */
  private loadCharacterSprites(characterId: string, folder: string): void {
    if (!this.scene) return;
    
    const basePath = `assets/res/player/${folder}/`;
    const prefix = characterId;
    
    // 加载待机动画（12帧）
    for (let i = 1; i <= 12; i++) {
      const key = `${prefix}_wait_${i.toString().padStart(3, '0')}`;
      const file = `${prefix}_wait_${i.toString().padStart(3, '0')}.png`;
      this.scene.load.image(key, basePath + file);
    }
    
    // 加载攻击动画（12帧）
    for (let i = 1; i <= 12; i++) {
      const key = `${prefix}_attack_${i.toString().padStart(3, '0')}`;
      const file = `${prefix}_attack_${i.toString().padStart(3, '0')}.png`;
      this.scene.load.image(key, basePath + file);
    }
    
    // 加载受击动画（3帧）
    for (let i = 1; i <= 3; i++) {
      const key = `${prefix}_hited_${i.toString().padStart(3, '0')}`;
      const file = `${prefix}_hited_${i.toString().padStart(3, '0')}.png`;
      this.scene.load.image(key, basePath + file);
    }
  }
  
  /**
   * 加载单个怪物类型
   */
  private loadMonsterType(difficulty: number, folder: string, prefix: string): void {
    if (!this.scene) return;
    
    const basePath = `assets/res/monster/${folder}/`;
    
    // 加载待机动画
    for (let i = 1; i <= 8; i++) {
      const key = `monster${difficulty}_wait_${i.toString().padStart(3, '0')}`;
      const file = `${prefix}_wait_${i.toString().padStart(3, '0')}.png`;
      this.scene.load.image(key, basePath + file);
    }
    
    // 加载攻击动画
    for (let i = 1; i <= 8; i++) {
      const key = `monster${difficulty}_attack_${i.toString().padStart(3, '0')}`;
      const file = `${prefix}_attack_${i.toString().padStart(3, '0')}.png`;
      this.scene.load.image(key, basePath + file);
    }
    
    // 加载受击动画
    for (let i = 1; i <= 3; i++) {
      const key = `monster${difficulty}_hited_${i.toString().padStart(3, '0')}`;
      const file = `${prefix}_hited_${i.toString().padStart(3, '0')}.png`;
      this.scene.load.image(key, basePath + file);
    }
  }
  
  /**
   * 创建角色动画
   */
  private createCharacterAnimations(characterId: string): void {
    if (!this.scene) return;
    
    // 检查资源是否已加载
    const testKey = `${characterId}_wait_001`;
    if (!this.scene.textures.exists(testKey)) {
      console.warn(`角色资源未加载: ${characterId}`);
      return;
    }
    
    // 检查动画是否已存在
    if (this.scene.anims.exists(`${characterId}_wait`)) {
      return;
    }
    
    // 待机动画
    const waitFrames: any[] = [];
    for (let i = 1; i <= 12; i++) {
      waitFrames.push({ 
        key: `${characterId}_wait_${i.toString().padStart(3, '0')}`,
        frame: 0
      });
    }
    this.scene.anims.create({
      key: `${characterId}_wait`,
      frames: waitFrames,
      frameRate: 12,
      repeat: -1
    });
    
    // 攻击动画
    const attackFrames: any[] = [];
    for (let i = 1; i <= 12; i++) {
      attackFrames.push({ 
        key: `${characterId}_attack_${i.toString().padStart(3, '0')}`,
        frame: 0
      });
    }
    this.scene.anims.create({
      key: `${characterId}_attack`,
      frames: attackFrames,
      frameRate: 24,
      repeat: 0
    });
    
    // 受击动画
    const hitedFrames: any[] = [];
    for (let i = 1; i <= 3; i++) {
      hitedFrames.push({ 
        key: `${characterId}_hited_${i.toString().padStart(3, '0')}`,
        frame: 0
      });
    }
    this.scene.anims.create({
      key: `${characterId}_hited`,
      frames: hitedFrames,
      frameRate: 12,
      repeat: 0
    });
  }
  
  /**
   * 创建怪物动画
   */
  private createMonsterAnimations(difficulty: number): void {
    if (!this.scene) return;
    
    // 检查资源是否已加载
    const testKey = `monster${difficulty}_wait_001`;
    if (!this.scene.textures.exists(testKey)) {
      console.warn(`怪物资源未加载: monster${difficulty}`);
      return;
    }
    
    // 检查动画是否已存在
    if (this.scene.anims.exists(`monster${difficulty}_wait`)) {
      return;
    }
    
    // 待机动画
    const waitFrames: any[] = [];
    for (let i = 1; i <= 8; i++) {
      waitFrames.push({ 
        key: `monster${difficulty}_wait_${i.toString().padStart(3, '0')}`,
        frame: 0
      });
    }
    this.scene.anims.create({
      key: `monster${difficulty}_wait`,
      frames: waitFrames,
      frameRate: 8,
      repeat: -1
    });
    
    // 攻击动画
    const attackFrames: any[] = [];
    for (let i = 1; i <= 8; i++) {
      attackFrames.push({ 
        key: `monster${difficulty}_attack_${i.toString().padStart(3, '0')}`,
        frame: 0
      });
    }
    this.scene.anims.create({
      key: `monster${difficulty}_attack`,
      frames: attackFrames,
      frameRate: 16,
      repeat: 0
    });
    
    // 受击动画
    const hitedFrames: any[] = [];
    for (let i = 1; i <= 3; i++) {
      hitedFrames.push({ 
        key: `monster${difficulty}_hited_${i.toString().padStart(3, '0')}`,
        frame: 0
      });
    }
    this.scene.anims.create({
      key: `monster${difficulty}_hited`,
      frames: hitedFrames,
      frameRate: 12,
      repeat: 0
    });
  }
}

