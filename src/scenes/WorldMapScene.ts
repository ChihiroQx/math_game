import Phaser from 'phaser';
import DataManager from '../managers/DataManager';
import GameManager from '../managers/GameManager';
import ButtonFactory from '../utils/ButtonFactory';
import { getTitleFont } from '../config/FontConfig';

/**
 * 世界地图场景 - 全新设计（使用ButtonFactory）
 * 显示所有关卡
 */
export default class WorldMapScene extends Phaser.Scene {
  private readonly levelsPerWorld = [5, 4, 3]; // 每个世界的关卡数
  private stars: Phaser.GameObjects.Graphics[] = [];
  
  constructor() {
    super({ key: 'WorldMapScene' });
  }
  
  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 背景
    this.createBackground();
    
    // 添加星星装饰
    this.createStars();
    
    // 标题
    this.createTitle(width);
    
    // 返回按钮
    this.createBackButton();
    
    // 创建关卡地图
    this.createLevelMap(width, height);
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
   * 创建背景（更漂亮的渐变）
   */
  private createBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const graphics = this.add.graphics();
    // 从天空蓝到浅绿色的柔和渐变
    graphics.fillGradientStyle(
      0x87CEEB, // 天空蓝
      0x87CEEB, 
      0x98E6B0, // 浅绿色
      0x90EE90, // 淡绿色
      1
    );
    graphics.fillRect(0, 0, width, height);
  }
  
  /**
   * 创建星星装饰
   */
  private createStars(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 随机生成20颗星星
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height * 0.3); // 只在上半部分
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
   * 创建标题（更华丽的设计）
   */
  private createTitle(width: number): void {
    // 标题背景装饰
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0xFFFFFF, 0.2);
    titleBg.fillRoundedRect(width / 2 - 200, 25, 400, 70, 15);
    
    // 标题
    const title = this.add.text(width / 2, 60, '选择关卡', {
      fontFamily: getTitleFont(),
      fontSize: '56px',
      color: '#FFD700',
      stroke: '#FF69B4',
      strokeThickness: 8,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 6,
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
  }
  
  /**
   * 创建返回按钮（使用统一的ButtonFactory）
   */
  private createBackButton(): void {
    ButtonFactory.createButton(this, {
      x: 100,
      y: 60,
      width: 130,
      height: 44,
      text: '返回',
      icon: '←',
      color: 0xFF69B4,
      fontSize: '28px',
      callback: () => {
        this.scene.start('MainMenuScene');
      }
    });
  }
  
  /**
   * 创建关卡地图
   */
  private createLevelMap(width: number, height: number): void {
    const dataManager = DataManager.getInstance();
    
    let yOffset = 150;
    const worldSpacing = 200; // 从180增加到200，给更多空间
    
    // 遍历3个世界
    for (let world = 1; world <= 3; world++) {
      // 世界标题背景卡片
      const titleBg = this.add.graphics();
      titleBg.fillStyle(0xFFFFFF, 0.3);
      titleBg.fillRoundedRect(width / 2 - 180, yOffset - 25, 360, 50, 25);
      
      // 世界标题
      const worldTitle = this.getWorldTitle(world);
      const worldText = this.add.text(width / 2, yOffset, worldTitle, {
        fontFamily: getTitleFont(),
        fontSize: '36px',
        color: '#FFD700',
        stroke: '#FF69B4',
        strokeThickness: 5,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 5,
          fill: true
        }
      });
      worldText.setOrigin(0.5);
      worldText.setAlpha(0);
      worldText.setPadding(4, 4, 4, 4);
      
      // 标题入场动画
      this.tweens.add({
        targets: worldText,
        alpha: 1,
        y: yOffset,
        duration: 500,
        delay: (world - 1) * 300,
        ease: 'Power2'
      });
      
      // 关卡按钮（调整位置，避免遮挡标题）
      const levelCount = this.levelsPerWorld[world - 1];
      const levelSpacing = Math.min(150, (width - 200) / levelCount);
      const startX = (width - (levelCount - 1) * levelSpacing) / 2;
      
      for (let level = 1; level <= levelCount; level++) {
        const x = startX + (level - 1) * levelSpacing;
        const y = yOffset + 90; // 从60改为90，增加30px间距
        
        this.createLevelButton(x, y, world, level, dataManager);
      }
      
      yOffset += worldSpacing;
    }
  }
  
  /**
   * 获取世界标题
   */
  private getWorldTitle(world: number): string {
    switch (world) {
      case 1: return '🌳 世界1：数字森林';
      case 2: return '⛰️ 世界2：魔法山谷';
      case 3: return '🏰 世界3：智慧城堡';
      default: return '';
    }
  }
  
  /**
   * 判断是否是当前挑战关卡（最新可挑战的关卡）
   */
  private isCurrentChallengeLevel(world: number, level: number, dataManager: DataManager): boolean {
    // 遍历所有世界和关卡，找到第一个已解锁但未获得3星的关卡
    for (let w = 1; w <= 3; w++) {
      for (let l = 1; l <= 5; l++) {
        if (dataManager.isLevelUnlocked(w, l)) {
          const stars = dataManager.getLevelStars(w, l);
          if (stars < 3) {
            // 找到第一个未满星的关卡，检查是否就是当前关卡
            return w === world && l === level;
          }
        } else {
          // 遇到未解锁的关卡，停止搜索
          return false;
        }
      }
    }
    // 所有关卡都满星了，不显示动画
    return false;
  }
  
  /**
   * 创建关卡按钮（美化版）
   */
  private createLevelButton(
    x: number,
    y: number,
    world: number,
    level: number,
    dataManager: DataManager
  ): void {
    const isUnlocked = dataManager.isLevelUnlocked(world, level);
    const stars = dataManager.getLevelStars(world, level);
    
    const container = this.add.container(x, y);
    container.setAlpha(0);
    
    // 按钮阴影
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillCircle(0, 0, 50);
    shadow.setPosition(4, 4);
    container.add(shadow);
    
    // 按钮背景（圆形）
    const bg = this.add.graphics();
    const bgColor = isUnlocked ? 0xE8B84D : 0x888888;  // 柔和的金色
    bg.fillStyle(bgColor, 1);
    bg.fillCircle(0, 0, 50);
    bg.lineStyle(5, isUnlocked ? 0xF5E6D3 : 0x666666, 1);  // 柔和的白边
    bg.strokeCircle(0, 0, 50);
    container.add(bg);
    
    // 高光效果（减弱亮度）
    if (isUnlocked) {
      const highlight = this.add.graphics();
      highlight.fillStyle(0xFFFFFF, 0.15);  // 从0.3降至0.15
      highlight.fillCircle(-8, -15, 15);
      container.add(highlight);
    }
    
    // 关卡编号
    const levelText = this.add.text(0, 0, `${level}`, {
      fontFamily: getTitleFont(),
      fontSize: '42px',
      color: isUnlocked ? '#000000' : '#444444',
      stroke: isUnlocked ? '#FFFFFF' : '#222222',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    levelText.setOrigin(0.5);
    container.add(levelText);
    
    // 星星显示（使用图形）
    for (let i = 0; i < 3; i++) {
      const starX = -20 + i * 20;
      const starY = 55;
      const starText = this.add.text(starX, starY, i < stars ? '⭐' : '☆', {
        fontSize: '20px',
        color: i < stars ? '#FFD700' : '#FFFFFF', // 未获得的星星使用白色
        stroke: '#000000',
        strokeThickness: 2,
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: '#000000',
          blur: 2,
          fill: true
        }
      });
      starText.setOrigin(0.5);
      starText.setPadding(4, 4, 4, 4);
      container.add(starText);
    }
    
    // 如果关卡已通关，添加排行榜入口按钮（右上方）
    const isCompleted = dataManager.isLevelCompleted(world, level);
    if (isCompleted) {
      const leaderboardBtn = this.add.text(35, -35, '📊', {
        fontSize: '24px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 2
      });
      leaderboardBtn.setOrigin(0.5);
      leaderboardBtn.setInteractive({ useHandCursor: true });
      leaderboardBtn.setPadding(4, 4, 4, 4);
      
      // 悬停效果
      leaderboardBtn.on('pointerover', () => {
        leaderboardBtn.setScale(1.2);
        leaderboardBtn.setTint(0xFFFFFF);
      });
      leaderboardBtn.on('pointerout', () => {
        leaderboardBtn.setScale(1);
        leaderboardBtn.clearTint();
      });
      
      // 点击打开排行榜
      leaderboardBtn.on('pointerdown', () => {
        this.scene.start('LevelLeaderboardScene', { world, level });
      });
      
      container.add(leaderboardBtn);
    }
    
    // 入场动画（延迟不同时间）
    const delay = (world - 1) * 400 + (level - 1) * 80;
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: y,
      duration: 400,
      delay: delay,
      ease: 'Back.easeOut'
    });
    
    if (isUnlocked) {
      // 添加脉冲动画（最新可挑战关卡）
      const isCurrentChallenge = this.isCurrentChallengeLevel(world, level, dataManager);
      if (isCurrentChallenge) {
        this.tweens.add({
          targets: container,
          scale: 1.05,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
      
      // 设置交互
      const hitArea = new Phaser.Geom.Circle(0, 0, 50);
      container.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
      container.input!.cursor = 'pointer';
      
      container.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0xF5C842, 1); // 悬停变柔和的金黄色
        bg.fillCircle(0, 0, 50);
        bg.lineStyle(5, 0xFFE9B0, 1); // 柔和的边框
        bg.strokeCircle(0, 0, 50);
        
        this.tweens.add({
          targets: container,
          scale: 1.15,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      container.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(bgColor, 1);
        bg.fillCircle(0, 0, 50);
        bg.lineStyle(5, isUnlocked ? 0xF5E6D3 : 0x666666, 1);
        bg.strokeCircle(0, 0, 50);
        
        this.tweens.add({
          targets: container,
          scale: 1,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      container.on('pointerdown', () => {
        this.tweens.add({
          targets: container,
          scale: 0.9,
          duration: 80,
          yoyo: true,
          ease: 'Power2',
          onComplete: () => {
            this.startLevel(world, level);
          }
        });
      });
    } else {
      // 未解锁关卡添加锁图标
      const lockText = this.add.text(0, 0, '🔒', {
        fontSize: '24px'
      });
      lockText.setOrigin(0.5);
      lockText.setPosition(20, -20);
      lockText.setPadding(4, 4, 4, 4); // 添加内边距防止裁剪
      container.add(lockText);
    }
  }
  
  /**
   * 开始关卡
   */
  private startLevel(world: number, level: number): void {
    const dataManager = DataManager.getInstance();
    const isCompleted = dataManager.isLevelCompleted(world, level);
    
    const gameManager = GameManager.getInstance();
    gameManager.startGame(world, level, isCompleted); // 传入是否无限模式
    this.scene.start('GamePlayScene');
  }
}
