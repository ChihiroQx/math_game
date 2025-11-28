/**
 * 资源管理器
 * 负责游戏过程中的资源加载和管理
 * 与 PreloadScene 不同，PreloadScene 只负责游戏启动前的预加载
 */

import Phaser from 'phaser';
import { getAllCharacters, getCharacterConfig, extractFolderFromAssetPath as extractCharacterFolder } from '../config/CharacterConfig';
import { getAllMonsters, getMonsterIdByDifficulty, extractFolderFromAssetPath } from '../config/MonsterConfig';

export default class ResourceManager {
  private static instance: ResourceManager;
  private scene: Phaser.Scene | null = null;
  
  private constructor() {}
  
  /**
   * 从角色配置获取文件夹名（atlas key）
   */
  private getCharacterFolder(characterId: string): string | null {
    const config = getCharacterConfig(characterId);
    if (!config) return null;
    return extractCharacterFolder(config.assetPath);
  }
  
  /**
   * 从怪物配置获取文件夹名（atlas key）
   */
  private getMonsterFolder(difficulty: number): string | null {
    const monsterId = getMonsterIdByDifficulty(difficulty);
    const config = getAllMonsters().find(m => m.id === monsterId);
    if (!config) return null;
    return extractFolderFromAssetPath(config.assetPath);
  }
  
  /**
   * 获取怪物atlas key（用于Phaser纹理）
   * 怪物atlas key是monster1-monster8，而不是文件夹名
   */
  private getMonsterAtlasKey(difficulty: number): string {
    return `monster${difficulty}`;
  }
  
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
    const folder = this.getCharacterFolder(characterId);
    if (!folder) return false;
    return this.scene.textures.exists(folder); // 检查atlas是否存在
  }
  
  /**
   * 检查怪物资源是否已加载
   */
  public isMonsterLoaded(difficulty: number): boolean {
    if (!this.scene) return false;
    const atlasKey = this.getMonsterAtlasKey(difficulty);
    return this.scene.textures.exists(atlasKey); // 检查atlas是否存在
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
    
    const folder = this.getCharacterFolder(characterId);
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
    
    if (difficulty < 1 || difficulty > 8) {
      throw new Error(`无效的怪物难度: ${difficulty}`);
    }
    
    const folder = this.getMonsterFolder(difficulty);
    if (!folder) {
      throw new Error(`无法获取怪物文件夹: difficulty=${difficulty}`);
    }
    
    const monsterId = getMonsterIdByDifficulty(difficulty);
    const config = getAllMonsters().find(m => m.id === monsterId);
    if (!config) {
      throw new Error(`怪物配置未找到: ${monsterId}`);
    }
    
    // 加载怪物资源
    this.loadMonsterType(difficulty, folder, config.spritePrefix);
    
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
   * 加载单个角色的精灵（使用Atlas）
   */
  private loadCharacterSprites(characterId: string, folder: string): void {
    if (!this.scene) return;
    
    // 使用Atlas加载
    const atlasKey = folder; // 使用文件夹名作为atlas key
    const atlasJson = `assets/res/player_atlas/${folder}.json`;
    const atlasPng = `assets/res/player_atlas/${folder}.png`; // 实际文件名是 folder.png，不是 folder-0.png
    
    this.scene.load.atlas(atlasKey, atlasPng, atlasJson);
  }
  
  /**
   * 加载单个怪物类型（使用Atlas）
   */
  private loadMonsterType(difficulty: number, folder: string, prefix: string): void {
    if (!this.scene) return;
    
    // 怪物atlas key（用于Phaser纹理）
    const atlasKey = this.getMonsterAtlasKey(difficulty);
    
    // 使用实际的文件夹名加载（folder就是实际的文件夹名，如monster, monster1, monster004等）
    const atlasJson = `assets/res/monster_atlas/${folder}.json`;
    const atlasPng = `assets/res/monster_atlas/${folder}.png`; // 实际文件名是 folder.png，不是 folder-0.png
    
    this.scene.load.atlas(atlasKey, atlasPng, atlasJson);
  }
  
  /**
   * 创建角色动画（使用Atlas）
   */
  private createCharacterAnimations(characterId: string): void {
    if (!this.scene) return;
    
    const folder = this.getCharacterFolder(characterId);
    if (!folder) {
      console.warn(`未知角色ID: ${characterId}`);
      return;
    }
    
    // 检查atlas是否已加载
    if (!this.scene.textures.exists(folder)) {
      console.warn(`角色Atlas未加载: ${folder}`);
      return;
    }
    
    // 检查动画是否已存在
    if (this.scene.anims.exists(`${characterId}_wait`)) {
      return;
    }
    
    const atlas = this.scene.textures.get(folder);
    
    // 待机动画
    const waitFrames: any[] = [];
    for (let i = 1; i <= 12; i++) {
      const frameName = `${characterId}_wait_${i.toString().padStart(3, '0')}.png`;
      if (atlas.has(frameName)) {
        waitFrames.push({ key: folder, frame: frameName });
      }
    }
    if (waitFrames.length > 0) {
      this.scene.anims.create({
        key: `${characterId}_wait`,
        frames: waitFrames,
        frameRate: 12,
        repeat: -1
      });
    }
    
    // 攻击动画
    const attackFrames: any[] = [];
    for (let i = 1; i <= 12; i++) {
      const frameName = `${characterId}_attack_${i.toString().padStart(3, '0')}.png`;
      if (atlas.has(frameName)) {
        attackFrames.push({ key: folder, frame: frameName });
      }
    }
    if (attackFrames.length > 0) {
      this.scene.anims.create({
        key: `${characterId}_attack`,
        frames: attackFrames,
        frameRate: 24,
        repeat: 0
      });
    }
    
    // 受击动画
    const hitedFrames: any[] = [];
    for (let i = 1; i <= 3; i++) {
      const frameName = `${characterId}_hited_${i.toString().padStart(3, '0')}.png`;
      if (atlas.has(frameName)) {
        hitedFrames.push({ key: folder, frame: frameName });
      }
    }
    if (hitedFrames.length > 0) {
      this.scene.anims.create({
        key: `${characterId}_hited`,
        frames: hitedFrames,
        frameRate: 12,
        repeat: 0
      });
    }
  }
  
  /**
   * 创建怪物动画（使用Atlas）
   */
  private createMonsterAnimations(difficulty: number): void {
    if (!this.scene) return;
    
    if (difficulty < 1 || difficulty > 8) {
      console.warn(`无效的怪物难度: ${difficulty}`);
      return;
    }
    
    const atlasKey = this.getMonsterAtlasKey(difficulty);
    const monsterId = getMonsterIdByDifficulty(difficulty);
    const config = getAllMonsters().find(m => m.id === monsterId);
    if (!config) {
      console.warn(`怪物配置未找到: ${monsterId}`);
      return;
    }
    
    const spritePrefix = config.spritePrefix;
    
    // 检查atlas是否已加载
    if (!this.scene.textures.exists(atlasKey)) {
      console.warn(`怪物Atlas未加载: ${atlasKey}`);
      return;
    }
    
    // 检查动画是否已存在
    if (this.scene.anims.exists(`monster${difficulty}_wait`)) {
      return;
    }
    
    const atlas = this.scene.textures.get(atlasKey);
    
    // 待机动画
    const waitFrames: any[] = [];
    for (let i = 1; i <= 8; i++) {
      const frameName = `${spritePrefix}_wait_${i.toString().padStart(3, '0')}.png`;
      if (atlas.has(frameName)) {
        waitFrames.push({ key: atlasKey, frame: frameName });
      }
    }
    if (waitFrames.length > 0) {
      this.scene.anims.create({
        key: `monster${difficulty}_wait`,
        frames: waitFrames,
        frameRate: 8,
        repeat: -1
      });
    }
    
    // 攻击动画
    const attackFrames: any[] = [];
    for (let i = 1; i <= 8; i++) {
      const frameName = `${spritePrefix}_attack_${i.toString().padStart(3, '0')}.png`;
      if (atlas.has(frameName)) {
        attackFrames.push({ key: atlasKey, frame: frameName });
      }
    }
    if (attackFrames.length > 0) {
      this.scene.anims.create({
        key: `monster${difficulty}_attack`,
        frames: attackFrames,
        frameRate: 16,
        repeat: 0
      });
    }
    
    // 受击动画
    const hitedFrames: any[] = [];
    for (let i = 1; i <= 3; i++) {
      const frameName = `${spritePrefix}_hited_${i.toString().padStart(3, '0')}.png`;
      if (atlas.has(frameName)) {
        hitedFrames.push({ key: atlasKey, frame: frameName });
      }
    }
    if (hitedFrames.length > 0) {
      this.scene.anims.create({
        key: `monster${difficulty}_hited`,
        frames: hitedFrames,
        frameRate: 12,
        repeat: 0
      });
    }
  }
  
  /**
   * 预加载角色资源（同步，不等待，用于PreloadScene）
   */
  public preloadCharacter(characterId: string): void {
    if (!this.scene) {
      console.warn('ResourceManager: 场景未设置');
      return;
    }
    
    const folder = this.getCharacterFolder(characterId);
    if (!folder) {
      console.warn(`未知角色ID: ${characterId}`);
      return;
    }
    
    // 如果已加载，跳过
    if (this.isCharacterLoaded(characterId)) {
      return;
    }
    
    this.loadCharacterSprites(characterId, folder);
  }
  
  /**
   * 预加载怪物资源（同步，不等待，用于PreloadScene）
   */
  public preloadMonster(difficulty: number): void {
    if (!this.scene) {
      console.warn('ResourceManager: 场景未设置');
      return;
    }
    
    if (difficulty < 1 || difficulty > 8) {
      console.warn(`无效的怪物难度: ${difficulty}`);
      return;
    }
    
    // 如果已加载，跳过
    if (this.isMonsterLoaded(difficulty)) {
      return;
    }
    
    const folder = this.getMonsterFolder(difficulty);
    if (!folder) {
      console.warn(`无法获取怪物文件夹: difficulty=${difficulty}`);
      return;
    }
    
    const monsterId = getMonsterIdByDifficulty(difficulty);
    const config = getAllMonsters().find(m => m.id === monsterId);
    if (!config) {
      console.warn(`怪物配置未找到: ${monsterId}`);
      return;
    }
    
    this.loadMonsterType(difficulty, folder, config.spritePrefix);
  }
  
  /**
   * 预加载特效图集（同步，不等待，用于PreloadScene）
   */
  public preloadEffects(): void {
    if (!this.scene) {
      console.warn('ResourceManager: 场景未设置');
      return;
    }
    
    // 检查特效图集是否已加载
    if (this.scene.textures.exists('effect')) {
      return;
    }
    
    // 所有特效都在一个图集中
    const atlasKey = 'effect';
    const atlasJson = 'assets/res/effect_atlas/effect.json';
    const atlasPng = 'assets/res/effect_atlas/effect.png';
    
    this.scene.load.atlas(atlasKey, atlasPng, atlasJson);
  }
  
  /**
   * 创建角色动画（供PreloadScene使用）
   */
  public createCharacterAnimationsForPreload(characterId: string): void {
    this.createCharacterAnimations(characterId);
  }
  
  /**
   * 创建怪物动画（供PreloadScene使用）
   */
  public createMonsterAnimationsForPreload(difficulty: number): void {
    this.createMonsterAnimations(difficulty);
  }
  
  /**
   * 创建特效动画（供PreloadScene使用）
   */
  public createEffectAnimationsForPreload(effectId: string, repeat: boolean): void {
    if (!this.scene) return;
    
    // 检查特效图集是否已加载
    if (!this.scene.textures.exists('effect')) {
      console.warn('特效图集未加载');
      return;
    }
    
    // 检查动画是否已存在
    if (this.scene.anims.exists(effectId)) {
      return;
    }
    
    const atlas = this.scene.textures.get('effect');
    const { getEffectConfig } = require('../config/EffectConfig');
    const effectData = getEffectConfig(effectId);
    
    if (!effectData) {
      console.warn(`特效配置不存在: ${effectId}`);
      return;
    }
    
    const frames: any[] = [];
    for (let i = 1; i <= effectData.frames; i++) {
      // 帧名格式：effect_XXX/effect_XXX_XX.png
      const frameName = `${effectId}/${effectId}_${i.toString().padStart(2, '0')}.png`;
      if (atlas.has(frameName)) {
        frames.push({
          key: 'effect',
          frame: frameName
        });
      }
    }
    
    if (frames.length > 0) {
      this.scene.anims.create({
        key: effectId,
        frames: frames,
        frameRate: effectData.frameRate,
        repeat: repeat ? -1 : 0  // -1循环，0播放一次
      });
      
      console.log(`创建动画: ${effectId} (${frames.length}帧, ${effectData.frameRate}fps, ${repeat ? '循环' : '单次'})`);
    } else {
      console.warn(`特效帧未找到: ${effectId}`);
    }
  }
}

