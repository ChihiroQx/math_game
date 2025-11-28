import { getCharacterConfig, CharacterData } from '../config/CharacterConfig';

/**
 * 公主类（使用序列帧动画）
 * 负责公主的显示、受伤、攻击等行为
 * 现已升级：使用配置系统，支持多种角色皮肤
 */
export class Princess {
  public sprite: Phaser.GameObjects.Sprite;
  public maxHealth: number;
  public currentHealth: number;
  public isAlive: boolean;
  public attackPower: number; // 攻击力加成
  
  private scene: Phaser.Scene;
  private healthBar: Phaser.GameObjects.Graphics;
  private healthBarBg: Phaser.GameObjects.Graphics;
  private healthText: Phaser.GameObjects.Text;
  
  // 角色配置
  private characterConfig: CharacterData;
  private spritePrefix: string; // 角色精灵前缀（如 monster307）
  
  // 子弹参数（从配置读取）
  private ATTACK_DELAY: number;
  private BULLET_SPEED: number;
  
  constructor(scene: Phaser.Scene, x: number, y: number, characterId: string) {
    this.scene = scene;
    
    // 从配置读取角色属性
    const config = getCharacterConfig(characterId);
    if (!config) {
      throw new Error(`角色配置未找到: ${characterId}`);
    }
    
    this.characterConfig = config;
    
    // 使用配置的属性
    this.spritePrefix = this.characterConfig.spritePrefix;
    this.maxHealth = this.characterConfig.maxHealth;
    this.currentHealth = this.maxHealth;
    this.isAlive = true;
    this.attackPower = this.characterConfig.attackPower;
    this.ATTACK_DELAY = this.characterConfig.attackDelay;
    this.BULLET_SPEED = this.characterConfig.bulletSpeed;
    
    // 创建角色精灵（使用Atlas）
    // 从配置的assetPath提取文件夹名（atlas key）
    const assetPathParts = this.characterConfig.assetPath.split('/');
    const atlasKey = assetPathParts[assetPathParts.length - 1]; // 提取最后一个部分作为文件夹名
    const firstFrameName = `${this.spritePrefix}_wait_001.png`;
    
    // 使用atlas创建sprite
    this.sprite = scene.add.sprite(x, y, atlasKey, firstFrameName);
    this.sprite.setScale(this.characterConfig.scale);
    this.sprite.setOrigin(0.5, 1);
    
    // 播放待机动画
    const waitAnimKey = `${this.spritePrefix}_wait`;
    this.sprite.play(waitAnimKey);
    
    // 创建血条背景（放在脚底下方，统一位置）- 放大显示
    this.healthBarBg = scene.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.7);
    this.healthBarBg.fillRoundedRect(x - 60, y + 5, 120, 18, 8);
    
    // 创建血条
    this.healthBar = scene.add.graphics();
    
    // 血量文字 - 放大字体
    this.healthText = scene.add.text(x, y + 14, '', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.healthText.setOrigin(0.5);
    
    this.updateHealthBar();
  }
  
  /**
   * 更新血条显示（放大版本）
   */
  private updateHealthBar(): void {
    this.healthBar.clear();
    
    const x = this.sprite.x;
    const y = this.sprite.y;
    
    const healthPercent = this.currentHealth / this.maxHealth;
    const barWidth = 114 * healthPercent; // 放大后的宽度
    
    // 根据血量设置颜色
    let color = 0x00FF00; // 绿色
    if (healthPercent < 0.3) {
      color = 0xFF0000; // 红色
    } else if (healthPercent < 0.6) {
      color = 0xFFFF00; // 黄色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRoundedRect(x - 57, y + 8, barWidth, 12, 5); // 放大高度和圆角
    
    // 更新血量文字（更大字体）
    this.healthText.setText(`${this.currentHealth}/${this.maxHealth}`);
    this.healthText.setPosition(x, y + 14);
    
    // 更新血条背景位置（放大尺寸）
    this.healthBarBg.clear();
    this.healthBarBg.fillStyle(0x000000, 0.7);
    this.healthBarBg.fillRoundedRect(x - 60, y + 5, 120, 18, 8);
  }
  
  /**
   * 受到伤害
   */
  public takeDamage(damage: number): void {
    if (!this.isAlive) return;
    
    this.currentHealth -= damage;
    
    if (this.currentHealth <= 0) {
      this.currentHealth = 0;
      this.die();
    }
    
    this.updateHealthBar();
    
    // 播放受击动画
    const hitedAnimKey = `${this.spritePrefix}_hited`;
    const waitAnimKey = `${this.spritePrefix}_wait`;
    
    this.sprite.play(hitedAnimKey);
    this.sprite.once('animationcomplete', () => {
      if (this.isAlive) {
        this.sprite.play(waitAnimKey);
      }
    });
    
    // 受伤震动
    const originalX = this.sprite.x;
    this.scene.tweens.add({
      targets: this.sprite,
      x: originalX - 10,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.sprite.x = originalX;
      }
    });
  }
  
  /**
   * 死亡
   */
  private die(): void {
    this.isAlive = false;
    
    // 停止当前动画
    this.sprite.stop();
    
    // 死亡动画（倒下）
    this.scene.tweens.add({
      targets: this.sprite,
      angle: 90,
      alpha: 0.5,
      duration: 1000,
      ease: 'Power2'
    });
  }
  
  /**
   * 攻击动画
   * @returns 返回总攻击时间（毫秒），用于同步伤害触发
   */
  public playAttackAnimation(targetX: number, targetY: number, damage: number): number {
    // 播放攻击动画
    const attackAnimKey = `${this.spritePrefix}_attack`;
    const waitAnimKey = `${this.spritePrefix}_wait`;
    
    this.sprite.play(attackAnimKey);
    this.sprite.once('animationcomplete', () => {
      if (this.isAlive) {
        this.sprite.play(waitAnimKey);
      }
    });
    
    // 计算子弹发射起点
    const startX = this.sprite.x + 30;
    const startY = this.sprite.y - 40;
    
    // 计算距离
    const distance = Math.sqrt(
      Math.pow(targetX - startX, 2) + 
      Math.pow(targetY - startY, 2)
    );
    
    // 根据距离和速度动态计算飞行时间（毫秒）
    const flightDuration = (distance / this.BULLET_SPEED) * 1000;
    
    // 总时间 = 发射延迟 + 飞行时间
    const totalTime = this.ATTACK_DELAY + flightDuration;
    
    // 延迟发射魔法弹（等攻击动画播放到一半）
    this.scene.time.delayedCall(this.ATTACK_DELAY, () => {
      // 使用特效精灵创建子弹（使用统一特效图集）
      const bulletEffect = this.characterConfig.bulletEffect;
      const bulletFirstFrame = `${bulletEffect}/${bulletEffect}_01.png`; // 帧名格式：effect_XXX/effect_XXX_XX.png
      
      // 创建子弹精灵（使用统一特效图集，atlas key是'effect'）
      const bullet = this.scene.add.sprite(startX, startY, 'effect', bulletFirstFrame);
      bullet.setScale(this.characterConfig.effectScale || 1.0);
      bullet.setDepth(50); // 显示在角色前面
      
      // 播放子弹动画（循环）
      if (this.scene.anims.exists(bulletEffect)) {
        bullet.play(bulletEffect);
      }
      
      // 设置混合模式，让特效更明亮
      bullet.setBlendMode(Phaser.BlendModes.ADD);
      
      // 计算旋转角度（子弹朝向目标）
      const angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);
      bullet.setRotation(angle);
      
      // 魔法弹飞行动画
      this.scene.tweens.add({
        targets: bullet,
        x: targetX,
        y: targetY,
        duration: flightDuration,
        ease: 'Linear',
        onComplete: () => {
          // 击中时播放爆炸特效
          this.createHitEffect(targetX, targetY);
          
          // 显示伤害数字（使用角色颜色）
          const damageText = this.scene.add.text(targetX, targetY - 30, `-${damage}`, {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: this.characterConfig.color,
            stroke: '#FFFFFF',
            strokeThickness: 4
          });
          damageText.setOrigin(0.5);
          
          // 伤害数字上浮并消失
          this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
              damageText.destroy();
            }
          });
          
          // 销毁子弹
          bullet.destroy();
        }
      });
    });
    
    // 返回总时间（毫秒），用于同步伤害触发
    return totalTime;
  }
  
  /**
   * 创建击中爆炸特效
   */
  private createHitEffect(x: number, y: number): void {
    const hitEffect = this.characterConfig.hitEffect;
    const hitFirstFrame = `${hitEffect}/${hitEffect}_01.png`; // 帧名格式：effect_XXX/effect_XXX_XX.png
    
    // 创建爆炸精灵（使用统一特效图集，atlas key是'effect'）
    const explosion = this.scene.add.sprite(x, y, 'effect', hitFirstFrame);
    explosion.setScale(this.characterConfig.effectScale || 1.0);
    explosion.setDepth(100); // 显示在最前面
    explosion.setBlendMode(Phaser.BlendModes.ADD); // 增亮混合
    
    // 播放爆炸动画
    if (this.scene.anims.exists(hitEffect)) {
      explosion.play(hitEffect);
      explosion.once('animationcomplete', () => {
        explosion.destroy();
      });
    } else {
      // 如果动画不存在，延迟销毁
      this.scene.time.delayedCall(300, () => {
        explosion.destroy();
      });
    }
    
    // 可选：为强力角色添加屏幕震动
    if (this.characterConfig.attackPower >= 120) {
      this.scene.cameras.main.shake(50, 0.003);
    }
  }
  
  /**
   * 治疗
   */
  public heal(amount: number): void {
    if (!this.isAlive) return;
    
    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
    this.updateHealthBar();
  }
  
  /**
   * 更新（每帧调用，用于更新血条位置）
   */
  public update(): void {
    this.updateHealthBar();
  }
}
