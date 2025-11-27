import Phaser from 'phaser';
import AudioManager from '../managers/AudioManager';
import TimerManager from '../managers/TimerManager';
import DataManager from '../managers/DataManager';
import ButtonFactory from '../utils/ButtonFactory';

/**
 * 设置场景 - 统一UI设计（使用ButtonFactory）
 */
export default class SettingsScene extends Phaser.Scene {
  private musicVolumeText!: Phaser.GameObjects.Text;
  private sfxVolumeText!: Phaser.GameObjects.Text;
  private timeLimitText!: Phaser.GameObjects.Text;
  private stars: Phaser.GameObjects.Graphics[] = [];
  
  constructor() {
    super({ key: 'SettingsScene' });
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
    
    // 设置选项
    this.createSettings(width, height);
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
    titleBg.fillRoundedRect(width / 2 - 150, 35, 300, 70, 15);
    
    const title = this.add.text(width / 2, 70, '⚙️ 设置', {
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
   * 创建设置选项（重新设计）
   */
  private createSettings(width: number, height: number): void {
    const startY = 170;
    const spacing = 100;
    
    // 音乐音量
    this.createVolumeSetting(
      width / 2,
      startY,
      '🎵 音乐音量',
      AudioManager.getInstance().getMusicVolume(),
      (value) => {
        AudioManager.getInstance().setMusicVolume(value);
      }
    );
    
    // 音效音量
    this.createVolumeSetting(
      width / 2,
      startY + spacing,
      '🔊 音效音量',
      AudioManager.getInstance().getSFXVolume(),
      (value) => {
        AudioManager.getInstance().setSFXVolume(value);
      }
    );
    
    // 游戏时长设置
    this.createTimeLimitSetting(width / 2, startY + spacing * 2);
    
    // 玩家名字设置
    this.createNameSetting(width / 2, startY + spacing * 3 + 10);
    
    // 重置数据按钮
    this.createResetButton(width / 2, startY + spacing * 4 + 40);
  }
  
  /**
   * 创建音量设置（统一按钮样式）
   */
  private createVolumeSetting(
    x: number,
    y: number,
    label: string,
    initialValue: number,
    onChange: (value: number) => void
  ): void {
    // 背景卡片
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xFFFFFF, 0.2);
    cardBg.fillRoundedRect(x - 350, y - 40, 700, 80, 20);
    
    // 标签
    this.add.text(x - 310, y, label, {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#FF69B4',
      strokeThickness: 3
    }).setOrigin(0, 0.5);
    
    // 值显示
    const valueText = this.add.text(x + 50, y, `${Math.round(initialValue * 100)}%`, {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    });
    valueText.setOrigin(0.5);
    
    // 减少按钮（使用统一的ButtonFactory）
    ButtonFactory.createCircleButton(this, x - 50, y, 25, '−', 0x3498db, () => {
      let newValue = Math.max(0, initialValue - 0.1);
      onChange(newValue);
      valueText.setText(`${Math.round(newValue * 100)}%`);
      initialValue = newValue;
    });
    
    // 增加按钮（使用统一的ButtonFactory）
    ButtonFactory.createCircleButton(this, x + 150, y, 25, '+', 0x3498db, () => {
      let newValue = Math.min(1, initialValue + 0.1);
      onChange(newValue);
      valueText.setText(`${Math.round(newValue * 100)}%`);
      initialValue = newValue;
    });
  }
  
  /**
   * 创建时长设置（统一按钮样式）
   */
  private createTimeLimitSetting(x: number, y: number): void {
    const timerManager = TimerManager.getInstance();
    const currentMinutes = Math.round(timerManager['playTimeLimit'] / 60);
    
    // 背景卡片
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xFFFFFF, 0.2);
    cardBg.fillRoundedRect(x - 350, y - 40, 700, 80, 20);
    
    // 标签
    const timerLabel = this.add.text(x - 310, y, '⏱️ 游戏时长', {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#FF69B4',
      strokeThickness: 3
    });
    timerLabel.setOrigin(0, 0.5);
    timerLabel.setPadding(4, 4, 4, 4);
    
    // 预设时长按钮
    const timeLimits = [10, 15, 20, 30];
    const buttonSpacing = 90;
    const startX = x - 30;
    
    timeLimits.forEach((minutes, index) => {
      const isSelected = currentMinutes === minutes;
      // 使用统一的ButtonFactory
      ButtonFactory.createSelectButton(
        this,
        startX + index * buttonSpacing,
        y,
        70,
        44,
        `${minutes}分`,
        isSelected ? 0x27ae60 : 0x3498db,
        isSelected,
        () => {
          timerManager.saveSettings(minutes, 3);
          this.scene.restart();
        }
      );
    });
  }
  
  /**
   * 创建名字设置（统一样式）
   */
  private createNameSetting(x: number, y: number): void {
    const data = DataManager.getInstance().playerData;
    
    // 背景卡片
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xFFFFFF, 0.2);
    cardBg.fillRoundedRect(x - 350, y - 40, 700, 80, 20);
    
    // 标签
    this.add.text(x - 310, y, '👑 玩家名字', {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#FF69B4',
      strokeThickness: 3
    }).setOrigin(0, 0.5);
    
    // 当前名字
    const nameText = this.add.text(x + 50, y, data.playerName, {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    nameText.setOrigin(0, 0.5);
    
    // 提示（移到卡片外下方）
    const hint = this.add.text(x, y + 55, '(名字需要在浏览器控制台修改)', {
      fontFamily: 'Microsoft YaHei',
      fontSize: '18px',
      color: '#666666'
    });
    hint.setOrigin(0.5);
  }
  
  /**
   * 创建重置按钮（使用统一的ButtonFactory）
   */
  private createResetButton(x: number, y: number): void {
    ButtonFactory.createButton(this, {
      x: x,
      y: y,
      width: 280,
      height: 60,
      text: '重置所有数据',
      icon: '🔄',
      color: 0xe74c3c,
      fontSize: '28px',
      callback: () => {
        // 确认对话框
        const confirmText = '确定要重置所有数据吗？\n这将删除所有进度和记录！';
        if (confirm(confirmText)) {
          DataManager.getInstance().resetAllData();
          alert('数据已重置！游戏将返回主菜单。');
          this.scene.start('MainMenuScene');
        }
      }
    });
  }
}

