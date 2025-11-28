import Phaser from 'phaser';
import AudioManager from '../managers/AudioManager';
import TimerManager from '../managers/TimerManager';
import DataManager from '../managers/DataManager';
import { AccountManager } from '../managers/AccountManager';
import ButtonFactory from '../utils/ButtonFactory';
import DOMUtils from '../utils/DOMUtils';
import { LeaderboardManager } from '../managers/LeaderboardManager';
import NetworkUtils from '../utils/NetworkUtils';
import { getTitleFont, getBodyFont, getNumberFont } from '../config/FontConfig';

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
      fontFamily: getTitleFont(),
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#FF69B4',
      strokeThickness: 3
    }).setOrigin(0, 0.5);
    
    // 值显示
    const valueText = this.add.text(x + 50, y, `${Math.round(initialValue * 100)}%`, {
      fontFamily: getNumberFont(),
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
      fontFamily: getTitleFont(),
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
      fontFamily: getTitleFont(),
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#FF69B4',
      strokeThickness: 3
    }).setOrigin(0, 0.5);
    
    // 当前名字（从账号获取）
    const accountManager = AccountManager.getInstance();
    const currentPlayerName = accountManager.getPlayerName() || '未设置';
    const nameText = this.add.text(x + 10, y, currentPlayerName, {
      fontFamily: getTitleFont(),
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    nameText.setOrigin(0, 0.5);
    
    // 修改按钮
    ButtonFactory.createButton(this, {
      x: x + 220,
      y: y,
      width: 100,
      height: 44,
      text: '修改',
      icon: '✏️',
      color: 0x9b59b6,
      fontSize: '24px',
      callback: () => {
        this.showNameInputDialog();
      }
    });
  }
  
  /**
   * 显示名字输入对话框
   */
  private showNameInputDialog(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 半透明遮罩
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);
    overlay.setDepth(100);
    // 设置遮罩层不可交互，防止点击遮罩层时触发事件
    overlay.setInteractive({ useHandCursor: false });
    // 点击遮罩层时不关闭对话框（因为输入框在遮罩层上方）
    
    // 对话框背景
    const dialogWidth = 500;
    const dialogHeight = 280;
    const dialogBg = this.add.rectangle(width / 2, height / 2, dialogWidth, dialogHeight, 0xFFFFFF);
    dialogBg.setStrokeStyle(4, 0xFFD700);
    dialogBg.setDepth(101);
    // 对话框背景不可交互，防止点击时触发事件
    dialogBg.setInteractive({ useHandCursor: false });
    
    // 标题
    const titleText = this.add.text(width / 2, height / 2 - 100, '修改名字', {
      fontFamily: getTitleFont(),
      fontSize: '28px',
      color: '#FF69B4',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);
    titleText.setDepth(102);
    
    // 提示文本
    const promptText = this.add.text(width / 2, height / 2 - 50, '请输入你的新名字：', {
      fontFamily: getBodyFont(),
      fontSize: '22px',
      color: '#333333'
    });
    promptText.setOrigin(0.5);
    promptText.setDepth(102);
    
    // 创建HTML输入框（相对于画布定位）
    const inputElement = DOMUtils.createPositionedInput(
      width / 2,
      height / 2,
      width,
      height,
      Math.min(300, width * 0.6), // 响应式宽度
      Math.max(40, height * 0.06)   // 响应式高度
    );
    inputElement.type = 'text';
    inputElement.placeholder = '请输入名字（2-8个字）';
    inputElement.maxLength = 8;
    inputElement.style.fontSize = `${Math.max(16, Math.min(20, width * 0.016))}px`;
    inputElement.style.textAlign = 'center';
    inputElement.style.border = '2px solid #FFD700';
    inputElement.style.borderRadius = '10px';
    inputElement.style.outline = 'none';
    inputElement.style.padding = '0 10px';
    inputElement.style.boxSizing = 'border-box';
    const accountManager = AccountManager.getInstance();
    inputElement.value = accountManager.getPlayerName() || '';
    
    // 阻止输入框的所有事件冒泡，防止触发 Phaser 事件导致对话框消失
    const stopPropagation = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };
    
    inputElement.addEventListener('mousedown', stopPropagation, true);
    inputElement.addEventListener('mouseup', stopPropagation, true);
    inputElement.addEventListener('click', stopPropagation, true);
    inputElement.addEventListener('focus', stopPropagation, true);
    inputElement.addEventListener('focusin', stopPropagation, true);
    inputElement.addEventListener('touchstart', stopPropagation, true);
    inputElement.addEventListener('touchend', stopPropagation, true);
    
    document.body.appendChild(inputElement);
    
    // 延迟聚焦，确保对话框已经完全渲染
    setTimeout(() => {
      inputElement.focus();
      inputElement.select();
    }, 100);
    
    // 监听窗口大小变化，更新输入框位置
    const updateInputPosition = () => {
      DOMUtils.updateInputPosition(inputElement, width / 2, height / 2, width, height);
    };
    window.addEventListener('resize', updateInputPosition);
    window.addEventListener('orientationchange', updateInputPosition);
    
    // 确认按钮
    const confirmBtn = ButtonFactory.createButton(this, {
      x: width / 2 - 80,
      y: height / 2 + 80,
      width: 120,
      height: 50,
      text: '确认 ✓',
      color: 0x27ae60,
      fontSize: '24px',
      callback: async () => {
        const name = inputElement.value.trim();
        if (name.length < 2) {
          alert('名字至少需要2个字哦！');
          return;
        }
        
        // 使用 AccountManager 更新账号名字
        const accountManager = AccountManager.getInstance();
        const result = await accountManager.updatePlayerName(name);
        
        if (!result.success) {
          alert(result.message);
          return;
        }
        
        // 移除事件监听和输入框
        window.removeEventListener('resize', updateInputPosition);
        window.removeEventListener('orientationchange', updateInputPosition);
        if (inputElement.parentNode) {
          document.body.removeChild(inputElement);
        }
        overlay.destroy();
        dialogBg.destroy();
        titleText.destroy();
        promptText.destroy();
        confirmBtn.destroy();
        cancelBtn.destroy();
        
        // 刷新设置界面
        this.scene.restart();
      }
    });
    confirmBtn.setDepth(102);
    
    // 取消按钮
    const cancelBtn = ButtonFactory.createButton(this, {
      x: width / 2 + 80,
      y: height / 2 + 80,
      width: 120,
      height: 50,
      text: '取消',
      color: 0x95a5a6,
      fontSize: '24px',
      callback: () => {
        // 移除事件监听和输入框
        window.removeEventListener('resize', updateInputPosition);
        window.removeEventListener('orientationchange', updateInputPosition);
        if (inputElement.parentNode) {
          document.body.removeChild(inputElement);
        }
        overlay.destroy();
        dialogBg.destroy();
        titleText.destroy();
        promptText.destroy();
        confirmBtn.destroy();
        cancelBtn.destroy();
      }
    });
    cancelBtn.setDepth(102);
    
    // 按回车键确认
    inputElement.addEventListener('keypress', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        confirmBtn.emit('pointerdown');
      }
    });
    
    // 按ESC键取消
    inputElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancelBtn.emit('pointerdown');
      }
    });
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

