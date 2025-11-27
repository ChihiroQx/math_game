import Phaser from 'phaser';
import DataManager from '../managers/DataManager';
import ButtonFactory from '../utils/ButtonFactory';

/**
 * 排行榜场景 - 统一UI设计（使用ButtonFactory）
 */
export default class LeaderboardScene extends Phaser.Scene {
  private stars: Phaser.GameObjects.Graphics[] = [];
  
  constructor() {
    super({ key: 'LeaderboardScene' });
  }
  
  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 背景
    this.createBackground();
    
    // 添加星星装饰
    this.createStarDecorations();
    
    // 标题
    this.createTitle(width);
    
    // 返回按钮
    this.createBackButton();
    
    // 排行榜内容
    this.createLeaderboard(width, height);
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
    
    // 随机生成20颗星星
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height * 0.3);
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
   * 创建标题（统一样式）
   */
  private createTitle(width: number): void {
    // 标题背景装饰
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0xFFFFFF, 0.2);
    titleBg.fillRoundedRect(width / 2 - 200, 35, 400, 70, 15);
    
    const title = this.add.text(width / 2, 70, '🏆 排行榜', {
      fontFamily: 'Arial Black, Microsoft YaHei',
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
    title.setPadding(4, 4, 4, 4);
    
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
      y: 70,
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
   * 创建排行榜
   */
  private createLeaderboard(width: number, height: number): void {
    const data = DataManager.getInstance().playerData;
    
    // 排行榜说明
    const infoText = this.add.text(width / 2, 150, '本地排行榜（同一设备上的记录）', {
      fontFamily: 'Microsoft YaHei',
      fontSize: '20px',
      color: '#CCCCCC'
    });
    infoText.setOrigin(0.5);
    
    // 获取或创建排行榜数据
    const leaderboard = this.getLeaderboardData();
    
    // 显示排行榜
    const startY = 220;
    const spacing = 70;
    
    if (leaderboard.length === 0) {
      // 没有数据时显示提示
      const emptyText = this.add.text(width / 2, height / 2, '暂无排名记录\n快去完成关卡吧！', {
        fontFamily: 'Microsoft YaHei',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center'
      });
      emptyText.setOrigin(0.5);
    } else {
      // 显示前5名
      for (let i = 0; i < Math.min(5, leaderboard.length); i++) {
        const entry = leaderboard[i];
        const y = startY + i * spacing;
        
        // 排名
        const rank = i + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
        
        // 背景
        const bgColor = rank === 1 ? 0xFFD700 : rank === 2 ? 0xC0C0C0 : rank === 3 ? 0xCD7F32 : 0x4B0082;
        const bg = this.add.rectangle(width / 2, y, width - 100, 60, bgColor, 0.3);
        bg.setStrokeStyle(2, 0xFFFFFF, 0.5);
        
        // 排名
        const medalText = this.add.text(width * 0.15, y, medal, {
          fontFamily: 'Arial Black',
          fontSize: '32px',
          color: '#ffffff'
        });
        medalText.setOrigin(0.5);
        medalText.setPadding(4, 4, 4, 4);
        
        // 玩家名
        this.add.text(width * 0.35, y, entry.name, {
          fontFamily: 'Microsoft YaHei',
          fontSize: '24px',
          color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        // 星星数
        this.add.text(width * 0.65, y, `⭐ ${entry.stars}`, {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#FFA500'
        }).setOrigin(0.5);
        
        // 金币数
        const coinText1 = this.add.text(width * 0.85, y, `💰 ${entry.coins}`, {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#FFD700'
        });
        coinText1.setOrigin(1, 0.5);
        coinText1.setPadding(4, 4, 4, 4);
      }
    }
    
    // 当前玩家信息
    const playerY = height - 100;
    const playerBg = this.add.rectangle(width / 2, playerY, width - 100, 60, 0xFF69B4, 0.5);
    playerBg.setStrokeStyle(3, 0xFFFFFF);
    
    this.add.text(width * 0.15, playerY, '你', {
      fontFamily: 'Microsoft YaHei',
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(width * 0.35, playerY, data.playerName, {
      fontFamily: 'Microsoft YaHei',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    
    this.add.text(width * 0.65, playerY, `⭐ ${data.totalStars}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#FFA500'
    }).setOrigin(0.5);
    
    const coinText2 = this.add.text(width * 0.85, playerY, `💰 ${data.coins}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#FFD700'
    });
    coinText2.setOrigin(1, 0.5);
    coinText2.setPadding(4, 4, 4, 4);
  }
  
  /**
   * 获取排行榜数据
   */
  private getLeaderboardData(): Array<{name: string, stars: number, coins: number}> {
    // 从localStorage获取所有玩家数据
    const leaderboard: Array<{name: string, stars: number, coins: number}> = [];
    
    // 添加当前玩家
    const currentData = DataManager.getInstance().playerData;
    leaderboard.push({
      name: currentData.playerName,
      stars: currentData.totalStars,
      coins: currentData.coins
    });
    
    // 按星星数排序
    leaderboard.sort((a, b) => {
      if (b.stars !== a.stars) {
        return b.stars - a.stars;
      }
      return b.coins - a.coins;
    });
    
    return leaderboard;
  }
}

