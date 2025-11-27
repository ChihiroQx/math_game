import { getMonsterConfig, MonsterData } from '../config/MonsterConfig';

/**
 * 怪物类（使用序列帧动画）
 * 负责怪物的显示、移动、攻击等行为
 * 现已升级：使用配置系统，支持多种怪物类型
 */
export class Monster {
  public sprite: Phaser.GameObjects.Sprite;
  public health: number;
  public maxHealth: number;
  public damage: number;
  public isAlive: boolean;
  public attackRange: number;
  public moveSpeed: number;
  public difficulty: number; // 保留用于兼容（关卡难度）
  
  private scene: Phaser.Scene;
  private healthBar: Phaser.GameObjects.Graphics;
  private healthBarBg: Phaser.GameObjects.Graphics;
  private lastAttackTime: number = 0;
  private attackCooldown: number;
  
  // 怪物配置
  private monsterConfig: MonsterData;
  private spritePrefix: string; // 怪物精灵前缀
  private animPrefix: string; // 动画前缀（monster1-8）
  
  constructor(scene: Phaser.Scene, x: number, y: number, difficulty: number, monsterId: string) {
    this.scene = scene;
    this.difficulty = difficulty;
    this.isAlive = true;
    
    // 从配置读取怪物属性
    const config = getMonsterConfig(monsterId);
    if (!config) {
      throw new Error(`怪物配置未找到: ${monsterId}`);
    }
    
    this.monsterConfig = config;
    
    // 计算关卡倍率（基于difficulty）
    const levelMultiplier = 1 + (difficulty - 1) * 0.5;
    
    // 使用配置的属性
    this.spritePrefix = this.monsterConfig.spritePrefix;
    this.maxHealth = Math.floor(this.monsterConfig.baseHealth * levelMultiplier);
    this.health = this.maxHealth;
    this.damage = Math.floor(this.monsterConfig.baseDamage * levelMultiplier);
    this.moveSpeed = this.monsterConfig.moveSpeed;
    this.attackRange = this.monsterConfig.attackRange;
    this.attackCooldown = this.monsterConfig.attackInterval;
    
    // 动画前缀（monster1-8，用于播放动画）
    const monsterIdNum = monsterId.split('_')[1];
    this.animPrefix = `monster${monsterIdNum}`;
    
    // 创建怪物精灵
    const firstFrame = `${this.animPrefix}_wait_001`;
    this.sprite = scene.add.sprite(x, y, firstFrame);
    this.sprite.setScale(0.6); // 缩小到0.6倍，更协调
    this.sprite.setFlipX(false); // 不翻转，面向左侧（公主方向）
    this.sprite.setOrigin(0.5, 1); // 设置锚点为底部中心，脚底作为定位点
    
    // 播放待机动画
    const animKey = `${this.animPrefix}_wait`;
    this.sprite.play(animKey);
    
    // 创建血条背景（放在脚底下方，统一位置）
    this.healthBarBg = scene.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.7);
    this.healthBarBg.fillRoundedRect(x - 30, y + 5, 60, 8, 4);
    
    // 创建血条
    this.healthBar = scene.add.graphics();
    this.updateHealthBar();
  }
  
  /**
   * 更新血条显示
   */
  private updateHealthBar(): void {
    this.healthBar.clear();
    
    const x = this.sprite.x;
    const y = this.sprite.y;
    
    const healthPercent = this.health / this.maxHealth;
    const barWidth = 56 * healthPercent;
    
    // 根据血量设置颜色
    let color = 0xFF4444; // 红色（怪物血条）
    if (healthPercent < 0.3) {
      color = 0x880000; // 深红色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRoundedRect(x - 28, y + 7, barWidth, 6, 3);
    
    // 更新血条背景位置
    this.healthBarBg.clear();
    this.healthBarBg.fillStyle(0x000000, 0.7);
    this.healthBarBg.fillRoundedRect(x - 30, y + 5, 60, 8, 4);
  }
  
  /**
   * 受到伤害
   */
  public takeDamage(damage: number): void {
    if (!this.isAlive) return;
    
    this.health -= damage;
    
    if (this.health <= 0) {
      this.health = 0;
      this.die();
      return;
    }
    
    this.updateHealthBar();
    
    // 播放受击动画
    const hitedKey = `${this.animPrefix}_hited`;
    const waitKey = `${this.animPrefix}_wait`;
    this.sprite.play(hitedKey);
    this.sprite.once('animationcomplete', () => {
      if (this.isAlive) {
        this.sprite.play(waitKey);
      }
    });
    
    // 受伤震动
    const originalX = this.sprite.x;
    this.scene.tweens.add({
      targets: this.sprite,
      x: originalX + 15,
      duration: 50,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.sprite.x = originalX;
      }
    });
    
    // 受伤闪红
    this.sprite.setTint(0xFF0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });
  }
  
  /**
   * 死亡
   */
  private die(): void {
    this.isAlive = false;
    
    // 立即隐藏血条（避免血条飞走）
    this.healthBar.setVisible(false);
    this.healthBarBg.setVisible(false);
    
    // 只对怪物精灵播放死亡动画（淡出+缩小）
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 0.5,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      }
    });
  }
  
  /**
   * 向目标移动（仅水平移动）
   */
  public moveTowards(targetX: number): void {
    if (!this.isAlive) return;
    
    const distance = targetX - this.sprite.x;
    
    // 如果在攻击范围内，停止移动
    if (Math.abs(distance) <= this.attackRange) {
      return; // 已到达攻击距离，停止移动
    }
    
    if (Math.abs(distance) > 2) {
      // 只更新x坐标
      const direction = distance > 0 ? 1 : -1;
      this.sprite.x += direction * this.moveSpeed * (1/60);
      
      // 更新血条位置
      this.updateHealthBar();
    }
  }
  
  /**
   * 是否到达公主（进入攻击距离）
   */
  public hasReachedPrincess(princessX: number): boolean {
    const distance = Math.abs(this.sprite.x - princessX);
    return distance <= this.attackRange;
  }
  
  /**
   * 攻击公主
   */
  public attackPrincess(onAttackCallback: () => void): boolean {
    if (!this.isAlive) return false;
    
    const currentTime = Date.now();
    if (currentTime - this.lastAttackTime < this.attackCooldown) {
      return false;
    }
    
    this.lastAttackTime = currentTime;
    
    // 播放攻击动画（使用动态的动画key）
    const attackKey = `${this.animPrefix}_attack`;
    const waitKey = `${this.animPrefix}_wait`;
    this.sprite.play(attackKey);
    this.sprite.once('animationcomplete', () => {
      if (this.isAlive) {
        this.sprite.play(waitKey);
      }
    });
    
    // 延迟执行攻击回调（等待攻击动画播放到合适位置）
    this.scene.time.delayedCall(300, () => {
      if (this.isAlive) {
        onAttackCallback();
      }
    });
    
    return true;
  }
  
  /**
   * 更新（每帧调用）
   */
  public update(): void {
    if (!this.isAlive) return;
    
    this.updateHealthBar();
  }
  
  /**
   * 销毁
   */
  public destroy(): void {
    this.sprite.destroy();
    this.healthBar.destroy();
    this.healthBarBg.destroy();
  }
}
