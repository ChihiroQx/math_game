import Phaser from 'phaser';
import DataManager from '../managers/DataManager';
import { LeaderboardManager, InfiniteModeRecord } from '../managers/LeaderboardManager';
import ButtonFactory from '../utils/ButtonFactory';
import { getTitleFont, getBodyFont, getNumberFont } from '../config/FontConfig';

/**
 * 关卡排行榜场景
 * 显示指定关卡的无限模式排行榜
 */
export default class LevelLeaderboardScene extends Phaser.Scene {
  private stars: Phaser.GameObjects.Graphics[] = [];
  private world: number = 1;
  private level: number = 1;
  private uiElements: { [key: string]: any } = {};
  
  constructor() {
    super({ key: 'LevelLeaderboardScene' });
  }
  
  init(data: { world: number; level: number }): void {
    this.world = data.world || 1;
    this.level = data.level || 1;
  }
  
  async create(): Promise<void> {
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
    
    // 排行榜内容（异步加载）
    await this.createLeaderboard(width, height);
    
    // 监听窗口大小变化
    this.scale.on('resize', this.handleResize, this);
  }
  
  /**
   * 处理窗口大小变化
   */
  handleResize(): void {
    // 检查场景和摄像头是否已初始化
    if (!this.scene || !this.cameras || !this.cameras.main) {
      return;
    }
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 检查宽度和高度是否有效
    if (!width || !height || width <= 0 || height <= 0) {
      return;
    }
    
    this.relayoutUI(width, height);
  }
  
  /**
   * 重新布局UI元素
   */
  private relayoutUI(width: number, height: number): void {
    if (this.uiElements.background) {
      this.uiElements.background.clear();
      this.uiElements.background.fillGradientStyle(
        0x87CEEB, 0x87CEEB, 0x98D8C8, 0x98D8C8, 1
      );
      this.uiElements.background.fillRect(0, 0, width, height);
    }
  }
  
  /**
   * 场景销毁时清理
   */
  shutdown(): void {
    if (this.scale) {
      this.scale.off('resize', this.handleResize, this);
    }
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
   * 创建背景
   */
  private createBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 渐变背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98D8C8, 0x98D8C8, 1);
    bg.fillRect(0, 0, width, height);
    this.uiElements.background = bg;
  }
  
  /**
   * 创建星星装饰
   */
  private createStarDecorations(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      
      const star = this.add.graphics();
      star.fillStyle(0xFFFFFF, 0.6);
      star.fillCircle(0, 0, size);
      star.setPosition(x, y);
      
      this.stars.push(star);
    }
  }
  
  /**
   * 创建标题
   */
  private createTitle(width: number): void {
    const titleText = `世界${this.world}-关卡${this.level} 无限模式排行榜`;
    const title = this.add.text(width / 2, 60, titleText, {
      fontFamily: getTitleFont(),
      fontSize: '36px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 5,
        fill: true
      }
    });
    title.setOrigin(0.5);
  }
  
  /**
   * 创建返回按钮
   */
  private createBackButton(): void {
    const backButton = this.add.text(50, 50, '← 返回', {
      fontFamily: getTitleFont(),
      fontSize: '24px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    backButton.setOrigin(0, 0);
    backButton.setInteractive({ useHandCursor: true });
    
    backButton.on('pointerover', () => {
      backButton.setTint(0xFFD700);
      backButton.setScale(1.1);
    });
    
    backButton.on('pointerout', () => {
      backButton.clearTint();
      backButton.setScale(1);
    });
    
    backButton.on('pointerdown', () => {
      this.scene.start('WorldMapScene');
    });
  }
  
  /**
   * 创建排行榜内容
   */
  private async createLeaderboard(width: number, height: number): Promise<void> {
    // 从远端数据库获取排行榜
    let records: InfiniteModeRecord[] = [];
    
    if (LeaderboardManager.isConfigured()) {
      const leaderboardManager = LeaderboardManager.getInstance();
      records = await leaderboardManager.getInfiniteModeLeaderboard(this.world, this.level, 50);
    } else {
      // 如果未配置 Supabase，降级到本地存储
      console.warn('⚠️ Supabase 未配置，使用本地存储');
      const dataManager = DataManager.getInstance();
      const localRecords = dataManager.getInfiniteModeLeaderboard(this.world, this.level);
      // 转换本地记录格式为远端格式
      records = localRecords.map(r => ({
        world: r.world,
        level: r.level,
        player_name: r.playerName,
        kill_count: r.killCount,
        survival_time: r.survivalTime
      }));
    }
    
    // 表头
    const headerY = 140;
    const headerStyle = {
      fontFamily: getTitleFont(),
      fontSize: '24px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    };
    
    this.add.text(width / 2 - 300, headerY, '排名', headerStyle).setOrigin(0.5);
    this.add.text(width / 2 - 150, headerY, '玩家', headerStyle).setOrigin(0.5);
    this.add.text(width / 2 + 50, headerY, '击杀数', headerStyle).setOrigin(0.5);
    this.add.text(width / 2 + 250, headerY, '存活时间', headerStyle).setOrigin(0.5);
    
    // 如果没有记录
    if (records.length === 0) {
      const noRecordText = this.add.text(width / 2, height / 2, '暂无记录\n快去挑战吧！', {
        fontFamily: getBodyFont(),
        fontSize: '32px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      });
      noRecordText.setOrigin(0.5);
      return;
    }
    
    // 显示记录（最多显示20条）
    const displayCount = Math.min(records.length, 20);
    const startY = headerY + 50;
    const rowHeight = 40;
    
    for (let i = 0; i < displayCount; i++) {
      const record = records[i];
      const y = startY + i * rowHeight;
      
      // 排名
      const rankText = this.add.text(width / 2 - 300, y, `${i + 1}`, {
        fontFamily: getNumberFont(),
        fontSize: '20px',
        color: i < 3 ? '#FFD700' : '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3
      });
      rankText.setOrigin(0.5);
      
      // 玩家名
      const nameText = this.add.text(width / 2 - 150, y, record.player_name, {
        fontFamily: getBodyFont(),
        fontSize: '20px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3
      });
      nameText.setOrigin(0.5);
      
      // 击杀数
      const killText = this.add.text(width / 2 + 50, y, record.kill_count.toString(), {
        fontFamily: getNumberFont(),
        fontSize: '20px',
        color: '#FF6B6B',
        stroke: '#000000',
        strokeThickness: 3
      });
      killText.setOrigin(0.5);
      
      // 存活时间（格式化为 分:秒）
      const minutes = Math.floor(record.survival_time / 60);
      const seconds = Math.floor(record.survival_time % 60);
      const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      const timeDisplay = this.add.text(width / 2 + 250, y, timeText, {
        fontFamily: getNumberFont(),
        fontSize: '20px',
        color: '#4ECDC4',
        stroke: '#000000',
        strokeThickness: 3
      });
      timeDisplay.setOrigin(0.5);
    }
  }
}

