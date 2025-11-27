import Phaser from 'phaser';
import DataManager from '../managers/DataManager';
import ButtonFactory from '../utils/ButtonFactory';

/**
 * 游戏结算场景 - 统一UI设计（使用ButtonFactory）
 */
export default class GameOverScene extends Phaser.Scene {
  private stars: Phaser.GameObjects.Graphics[] = [];
  
  constructor() {
    super({ key: 'GameOverScene' });
  }
  
  create(data: { victory: boolean; stars: number; score: number; correct: number; total: number }): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 背景
    this.createBackground();
    
    // 添加星星装饰
    this.createStarDecorations();
    
    // 标题（根据胜负显示不同文字和颜色）
    const titleText = data.victory ? '关卡完成！' : '关卡失败！';
    const titleColor = data.victory ? '#FFD700' : '#FF6347';
    const strokeColor = data.victory ? '#FF69B4' : '#8B0000';
    
    // 标题背景装饰
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0xFFFFFF, 0.2);
    titleBg.fillRoundedRect(width / 2 - 250, height * 0.12, 500, 100, 20);
    
    const title = this.add.text(width / 2, height * 0.15, titleText, {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '64px',
      color: titleColor,
      stroke: strokeColor,
      strokeThickness: 8,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000000',
        blur: 8,
        fill: true
      }
    });
    title.setOrigin(0.5);
    title.setAlpha(0);
    
    // 入场动画
    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 600,
      ease: 'Back.easeOut'
    });
    
    // 星星显示（只在胜利时显示）
    if (data.victory) {
      this.createStars(width, height * 0.3, data.stars);
    }
    
    // 得分
    const scoreY = data.victory ? height * 0.5 : height * 0.35;
    const scoreText = this.add.text(width / 2, scoreY, `得分: ${data.score}`, {
      fontFamily: 'Microsoft YaHei',
      fontSize: '36px',
      color: '#ffffff'
    });
    scoreText.setOrigin(0.5);
    
    // 正确率（修复NaN问题）
    const accuracy = data.total > 0 ? (data.correct / data.total * 100).toFixed(1) : '0.0';
    const accuracyText = this.add.text(
      width / 2,
      scoreY + 60,
      `正确率: ${accuracy}% (${data.correct}/${data.total})`,
      {
        fontFamily: 'Microsoft YaHei',
        fontSize: '28px',
        color: '#ffffff'
      }
    );
    accuracyText.setOrigin(0.5);
    
    // 金币奖励
    const coinsText = this.add.text(width / 2, scoreY + 120, `💰 +${data.score} 金币`, {
      fontFamily: 'Microsoft YaHei',
      fontSize: '32px',
      color: '#FFD700'
    });
    coinsText.setOrigin(0.5);
    coinsText.setPadding(4, 4, 4, 4);
    
    // 按钮
    this.createButtons(width, height, data.victory);
  }
  
  update(): void {
    // 星星闪烁动画
    this.stars.forEach((star, index) => {
      const time = this.time.now / 1000;
      const alpha = 0.3 + Math.sin(time * 2 + index) * 0.3;
      star.setAlpha(alpha);
    });
  }
  
  /**
   * 创建背景（统一风格）
   */
  private createBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const graphics = this.add.graphics();
    // 使用和主菜单一致的渐变
    graphics.fillGradientStyle(
      0x87CEEB, // 天空蓝
      0x87CEEB, 
      0xE6B0FF, // 淡紫色
      0xFFB6E1, // 粉红色
      1
    );
    graphics.fillRect(0, 0, width, height);
  }
  
  /**
   * 创建星星装饰
   */
  private createStarDecorations(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 随机生成30颗星星
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      const size = Phaser.Math.Between(2, 4);
      
      const star = this.add.graphics();
      star.fillStyle(0xFFFFFF, 1);
      star.fillCircle(x, y, size);
      
      this.stars.push(star);
      
      // 添加闪烁动画
      this.tweens.add({
        targets: star,
        alpha: 0.3,
        duration: Phaser.Math.Between(1000, 2000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  /**
   * 创建星星
   */
  private createStars(centerX: number, centerY: number, starCount: number): void {
    const spacing = 100;
    
    for (let i = 0; i < 3; i++) {
      // 计算位置：让3个星星居中对齐
      // i=0: centerX - spacing (左边)
      // i=1: centerX (中间)
      // i=2: centerX + spacing (右边)
      const x = centerX + (i - 1) * spacing;
      const filled = i < starCount;
      
      const star = this.add.text(x, centerY, filled ? '⭐' : '☆', {
        fontSize: '80px'
      });
      star.setOrigin(0.5);
      star.setAlpha(0);
      star.setScale(0);
      
      // 延迟显示动画
      this.time.delayedCall(i * 300 + 500, () => {
        this.tweens.add({
          targets: star,
          alpha: 1,
          scale: 1.2,
          duration: 300,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: star,
              scale: 1,
              duration: 200
            });
          }
        });
      });
    }
  }
  
  /**
   * 创建按钮（使用统一的ButtonFactory）
   */
  private createButtons(width: number, height: number, victory: boolean): void {
    const buttonY = height * 0.8;
    
    // 下一关按钮（只在胜利时显示）
    if (victory) {
      ButtonFactory.createButton(this, {
        x: width / 2 - 150,
        y: buttonY,
        width: 220,
        height: 54,
        text: '下一关',
        icon: '▶️',
        color: 0xFF69B4,
        callback: () => {
          // 重置游戏管理器数据
          const GameManager = require('../managers/GameManager').default;
          GameManager.getInstance().resetGameStats();
          this.scene.start('WorldMapScene');
        }
      });
    }
    
    // 重新挑战按钮
    const retryX = victory ? width / 2 + 150 : width / 2;
    ButtonFactory.createButton(this, {
      x: retryX,
      y: buttonY,
      width: 220,
      height: 54,
      text: '重新挑战',
      icon: '🔄',
      color: 0xFF69B4,
      callback: () => {
        // 重置游戏管理器数据
        const GameManager = require('../managers/GameManager').default;
        GameManager.getInstance().resetGameStats();
        this.scene.start('GamePlayScene');
      }
    });
  }
}
