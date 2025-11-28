import Phaser from 'phaser';
import DataManager from '../managers/DataManager';
import { AccountManager } from '../managers/AccountManager';
import ButtonFactory from '../utils/ButtonFactory';
import { LeaderboardManager } from '../managers/LeaderboardManager';
import { getTitleFont, getBodyFont } from '../config/FontConfig';

/**
 * 游戏结算场景 - 统一UI设计（使用ButtonFactory）
 */
export default class GameOverScene extends Phaser.Scene {
  private stars: Phaser.GameObjects.Graphics[] = [];
  
  constructor() {
    super({ key: 'GameOverScene' });
  }
  
  async create(data: { 
    victory: boolean; 
    stars: number; 
    score: number; 
    correct: number; 
    total: number;
    isInfiniteMode?: boolean;
    killCount?: number;
    survivalTime?: number;
    coinsEarned?: number;
  }): Promise<void> {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 如果配置了在线排行榜且玩家获胜，上传分数
    if (data.victory && LeaderboardManager.isConfigured()) {
      const dataManager = DataManager.getInstance();
      const playerData = dataManager.playerData;
      
      // 使用已保存的总星数和总金币（saveLevelProgress已经更新了这些值）
      const totalStars = playerData.totalStars;
      const totalCoins = playerData.coins;
      let maxWorld = 0;
      let maxLevel = 0;
      
      // 找出最大通关数
      for (let world = 1; world <= 3; world++) {
        for (let level = 1; level <= 5; level++) {
          const stars = dataManager.getLevelStars(world, level);
          
          // 如果这关有星星（已通关），更新最大通关
          if (stars > 0) {
            maxWorld = world;
            maxLevel = level;
          }
        }
      }
      
      // 计算最大通关数：世界×100 + 关卡（例如：102 = 世界1第2关）
      const maxLevelCompleted = maxWorld * 100 + maxLevel;
      
      console.log('准备上传到排行榜:', {
        playerName: AccountManager.getInstance().getPlayerName() || '勇敢的小朋友',
        totalStars,
        totalCoins,
        maxLevelCompleted,
        maxLevelText: `世界${maxWorld}-关卡${maxLevel}`
      });
      
      // 异步上传分数（不阻塞UI）
      LeaderboardManager.getInstance().submitScore(
        AccountManager.getInstance().getPlayerName() || '勇敢的小朋友',
        totalStars,
        totalCoins,
        maxLevelCompleted
      ).then(success => {
        if (success) {
          console.log('✅ 排行榜数据上传成功！');
        } else {
          console.warn('❌ 排行榜数据上传失败');
        }
      }).catch(err => {
        console.error('❌ 上传分数失败:', err);
      });
    }
    
    // 背景
    this.createBackground();
    
    // 添加星星装饰
    this.createStarDecorations();
    
    // 标题（根据胜负和模式显示不同文字和颜色）
    let titleText: string;
    let titleColor: string;
    let strokeColor: string;
    
    if (data.isInfiniteMode) {
      titleText = '提前结算';
      titleColor = '#FFD700';
      strokeColor = '#FF69B4';
    } else {
      titleText = data.victory ? '关卡完成！' : '关卡失败！';
      titleColor = data.victory ? '#FFD700' : '#FF6347';
      strokeColor = data.victory ? '#FF69B4' : '#8B0000';
    }
    
    // 标题背景装饰
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0xFFFFFF, 0.2);
    titleBg.fillRoundedRect(width / 2 - 250, height * 0.12, 500, 100, 20);
    
    const title = this.add.text(width / 2, height * 0.15, titleText, {
      fontFamily: getTitleFont(),
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
      this.createStars(width / 2, height * 0.32, data.stars);
    }
    
    // 无限模式结算显示
    if (data.isInfiniteMode) {
      const infoY = height * 0.35;
      
      // 击杀数
      const killText = this.add.text(width / 2, infoY, `🎯 击杀怪物: ${data.killCount || 0} 只`, {
        fontFamily: getBodyFont(),
        fontSize: '36px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 4
      });
      killText.setOrigin(0.5);
      
      // 存活时间
      const minutes = Math.floor((data.survivalTime || 0) / 60);
      const seconds = Math.floor((data.survivalTime || 0) % 60);
      const timeText = `⏱️ 存活时间: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      const survivalText = this.add.text(width / 2, infoY + 60, timeText, {
        fontFamily: getBodyFont(),
        fontSize: '32px',
        color: '#4ECDC4',
        stroke: '#000000',
        strokeThickness: 4
      });
      survivalText.setOrigin(0.5);
      
      // 获得金币（已在击杀时获得，这里只显示）
      const coinsText = this.add.text(width / 2, infoY + 120, `💰 获得金币: ${data.coinsEarned || 0}`, {
        fontFamily: getBodyFont(),
        fontSize: '32px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 4
      });
      coinsText.setOrigin(0.5);
    } else {
      // 普通模式结算显示
      const scoreY = data.victory ? height * 0.48 : height * 0.35;
      // 得分就是金币数，显示为获得金币奖励
      const coinsText = this.add.text(width / 2, scoreY, `💰 获得金币奖励: ${data.score}`, {
        fontFamily: getBodyFont(),
        fontSize: '36px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 4
      });
      coinsText.setOrigin(0.5);
      
      // 正确率（修复NaN问题）
      const accuracy = data.total > 0 ? (data.correct / data.total * 100).toFixed(1) : '0.0';
      const accuracyText = this.add.text(
        width / 2,
        scoreY + 60,
        `正确率: ${accuracy}% (${data.correct}/${data.total})`,
        {
          fontFamily: getBodyFont(),
          fontSize: '28px',
          color: '#ffffff'
        }
      );
      accuracyText.setOrigin(0.5);
      
      // 金币奖励（普通模式不再显示，因为金币已在击杀时获得）
      // 注：普通模式的金币在击杀怪物时已获得，无需额外显示
    }
    
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
      star.setPadding(8, 8, 8, 8);
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
    
    if (victory) {
      // 胜利时显示：下一关 + 重新挑战
      // 下一关按钮
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
      
      // 重新挑战按钮
      ButtonFactory.createButton(this, {
        x: width / 2 + 150,
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
    } else {
      // 失败时显示：重新挑战 + 返回主菜单
      // 重新挑战按钮
      ButtonFactory.createButton(this, {
        x: width / 2 - 150,
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
      
      // 返回主菜单按钮
      ButtonFactory.createButton(this, {
        x: width / 2 + 150,
        y: buttonY,
        width: 220,
        height: 54,
        text: '返回主菜单',
        icon: '🏠',
        color: 0x3498db,
        callback: () => {
          // 重置游戏管理器数据
          const GameManager = require('../managers/GameManager').default;
          GameManager.getInstance().resetGameStats();
          this.scene.start('MainMenuScene');
        }
      });
    }
  }
}
