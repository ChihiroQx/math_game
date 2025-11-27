import Phaser from 'phaser';
import DataManager from '../managers/DataManager';
import AudioManager from '../managers/AudioManager';
import ButtonFactory from '../utils/ButtonFactory';

/**
 * 主菜单场景 - 全新设计（使用ButtonFactory）
 */
export default class MainMenuScene extends Phaser.Scene {
  private stars: Phaser.GameObjects.Graphics[] = [];
  
  constructor() {
    super({ key: 'MainMenuScene' });
  }
  
  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 背景渐变
    this.createBackground();
    
    // 添加星星装饰
    this.createStars();
    
    // 游戏标题
    this.createTitle(width, height);
    
    // 玩家信息
    this.createPlayerInfo(width, height);
    
    // 菜单按钮
    this.createMenuButtons(width, height);
    
    // 添加底部装饰
    this.createFooter(width, height);
    
    // 播放背景音乐（如果有）
    // AudioManager.getInstance().playMusic('mainMenu');
    
    // 检查是否是首次启动，如果是则提示输入名字
    this.checkFirstLaunch();
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
    // 从天空蓝到粉紫色的柔和渐变
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
  private createStars(): void {
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
   * 创建标题（更华丽的设计）
   */
  private createTitle(width: number, height: number): void {
    // 标题背景装饰
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0xFFFFFF, 0.2);
    titleBg.fillRoundedRect(width / 2 - 350, height * 0.12, 700, 140, 20);
    
    // 主标题
    const title = this.add.text(width / 2, height * 0.15, '数学童话冒险', {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '72px',
      color: '#FFD700',
      stroke: '#FF1493',
      strokeThickness: 10,
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
      duration: 800,
      ease: 'Back.easeOut'
    });
    
    // 浮动动画
    this.tweens.add({
      targets: title,
      y: height * 0.15 + 8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 副标题
    const subtitle = this.add.text(width / 2, height * 0.23, '🏰 公主与森林小动物的冒险 🐰', {
      fontFamily: 'Microsoft YaHei',
      fontSize: '26px',
      color: '#ffffff',
      stroke: '#FF69B4',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    subtitle.setOrigin(0.5);
    subtitle.setAlpha(0);
    subtitle.setPadding(4, 4, 4, 4);
    
    // 延迟入场
    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      y: height * 0.23,
      duration: 600,
      delay: 300,
      ease: 'Power2'
    });
  }
  
  /**
   * 创建玩家信息（带背景卡片）
   */
  private createPlayerInfo(width: number, height: number): void {
    const data = DataManager.getInstance().playerData;
    
    // 左侧玩家名字卡片
    const nameCardBg = this.add.graphics();
    nameCardBg.fillStyle(0xFFFFFF, 0.3);
    nameCardBg.fillRoundedRect(20, 20, 200, 50, 25);
    
    const nameText = this.add.text(30, 45, `👑 ${data.playerName}`, {
      fontFamily: 'Microsoft YaHei',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    nameText.setOrigin(0, 0.5);
    
    // 右侧金币卡片
    const coinCardBg = this.add.graphics();
    coinCardBg.fillStyle(0xFFD700, 0.3);
    coinCardBg.fillRoundedRect(width - 180, 20, 160, 50, 25);
    
    const coinText = this.add.text(width - 90, 45, `💰 ${data.coins}`, {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '24px',
      color: '#FFD700',
      stroke: '#8B4513',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    coinText.setOrigin(0.5);
    coinText.setPadding(4, 4, 4, 4);
    
    // 右侧星星卡片
    const starCardBg = this.add.graphics();
    starCardBg.fillStyle(0xFFA500, 0.3);
    starCardBg.fillRoundedRect(width - 180, 85, 160, 50, 25);
    
    const starText = this.add.text(width - 90, 110, `⭐ ${data.totalStars}`, {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '24px',
      color: '#FFA500',
      stroke: '#8B4513',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    starText.setOrigin(0.5);
  }
  
  /**
   * 创建菜单按钮（使用统一的ButtonFactory）
   */
  private createMenuButtons(width: number, height: number): void {
    const startY = height * 0.42;
    const buttonSpacing = 90;
    
    // 按钮配置（文字、图标、颜色）
    const buttons = [
      { text: '开始冒险', icon: '🎮', color: 0xFF69B4, delay: 0 },
      { text: '皮肤商店', icon: '🎨', color: 0xFF1493, delay: 100 },
      { text: '排行榜', icon: '🏆', color: 0xFFB6C1, delay: 200 },
      { text: '设置', icon: '⚙️', color: 0xFFA0C8, delay: 300 }
    ];
    
    buttons.forEach((config, index) => {
      const y = startY + index * buttonSpacing;
      const callback = index === 0 ? () => this.scene.start('WorldMapScene') :
                       index === 1 ? () => this.showSkinShop() :
                       index === 2 ? () => this.showLeaderboard() :
                                     () => this.showSettings();
      
      // 使用统一的ButtonFactory
      ButtonFactory.createButton(this, {
        x: width / 2,
        y: y,
        width: 250,
        height: 54,
        text: config.text,
        icon: config.icon,
        color: config.color,
        fontSize: '36px',
        strokeThickness: 4,
        delay: config.delay,
        animationDuration: 400,
        callback: () => {
          AudioManager.getInstance().playSFX('click');
          callback();
        }
      });
    });
  }
  
  /**
   * 创建底部装饰
   */
  private createFooter(width: number, height: number): void {
    // 底部装饰条
    const footerBg = this.add.graphics();
    footerBg.fillStyle(0xFFFFFF, 0.2);
    footerBg.fillRect(0, height - 50, width, 50);
    
    // 版本信息
    const versionText = this.add.text(width / 2, height - 25, '专为小朋友设计的数学学习游戏 ❤️', {
      fontFamily: 'Microsoft YaHei',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#FF69B4',
      strokeThickness: 3
    });
    versionText.setOrigin(0.5);
    versionText.setPadding(4, 4, 4, 4);
    
    // 添加可爱的小图标装饰（调整位置，避免被裁切）
    const decorIcons = ['🌟', '🎈', '🦄', '🌈', '🎨', '🎪'];
    decorIcons.forEach((icon, index) => {
      const x = (width / (decorIcons.length + 1)) * (index + 1);
      const iconY = height - 75; // 调整位置，确保完整显示
      const iconText = this.add.text(x, iconY, icon, {
        fontSize: '32px' // 稍微缩小，避免裁切
      });
      iconText.setOrigin(0.5);
      iconText.setPadding(10, 10, 10, 10); // 增加padding防止emoji裁切
      
      // 浮动动画（减小浮动范围，避免裁切）
      this.tweens.add({
        targets: iconText,
        y: iconY - 8,
        duration: 1500 + index * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }
  
  /**
   * 显示皮肤商店
   */
  private showSkinShop(): void {
    this.scene.start('SkinShopScene');
  }
  
  /**
   * 显示排行榜
   */
  private showLeaderboard(): void {
    this.scene.start('LeaderboardScene');
  }
  
  /**
   * 显示设置
   */
  private showSettings(): void {
    this.scene.start('SettingsScene');
  }
  
  /**
   * 检查是否首次启动
   */
  private checkFirstLaunch(): void {
    const isFirstLaunch = localStorage.getItem('game_first_launch');
    if (!isFirstLaunch) {
      // 延迟显示，让主菜单先加载完成
      this.time.delayedCall(500, () => {
        this.showNameInputDialog();
      });
      localStorage.setItem('game_first_launch', 'false');
    }
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
    
    // 对话框背景
    const dialogWidth = 500;
    const dialogHeight = 280;
    const dialogBg = this.add.rectangle(width / 2, height / 2, dialogWidth, dialogHeight, 0xFFFFFF);
    dialogBg.setStrokeStyle(4, 0xFFD700);
    dialogBg.setDepth(101);
    
    // 标题
    const titleText = this.add.text(width / 2, height / 2 - 100, '欢迎来到数学冒险！', {
      fontFamily: 'Microsoft YaHei',
      fontSize: '28px',
      color: '#FF69B4',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);
    titleText.setDepth(102);
    
    // 提示文本
    const promptText = this.add.text(width / 2, height / 2 - 50, '请输入你的名字：', {
      fontFamily: 'Microsoft YaHei',
      fontSize: '22px',
      color: '#333333'
    });
    promptText.setOrigin(0.5);
    promptText.setDepth(102);
    
    // 创建HTML输入框
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = '请输入名字（2-8个字）';
    inputElement.maxLength = 8;
    inputElement.style.position = 'absolute';
    inputElement.style.left = '50%';
    inputElement.style.top = '50%';
    inputElement.style.transform = 'translate(-50%, -50%)';
    inputElement.style.width = '300px';
    inputElement.style.height = '40px';
    inputElement.style.fontSize = '20px';
    inputElement.style.textAlign = 'center';
    inputElement.style.border = '2px solid #FFD700';
    inputElement.style.borderRadius = '10px';
    inputElement.style.outline = 'none';
    inputElement.style.zIndex = '1000';
    inputElement.value = DataManager.getInstance().playerData.playerName;
    document.body.appendChild(inputElement);
    inputElement.focus();
    
    // 确认按钮
    const confirmBtn = ButtonFactory.createButton(this, {
      x: width / 2,
      y: height / 2 + 80,
      width: 200,
      height: 50,
      text: '确认 ✓',
      color: 0x27ae60,
      fontSize: '24px',
      callback: () => {
        const name = inputElement.value.trim();
        if (name.length < 2) {
          alert('名字至少需要2个字哦！');
          return;
        }
        
        // 保存名字
        DataManager.getInstance().playerData.playerName = name;
        DataManager.getInstance().saveData();
        
        // 移除输入框和对话框
        document.body.removeChild(inputElement);
        overlay.destroy();
        dialogBg.destroy();
        titleText.destroy();
        promptText.destroy();
        confirmBtn.destroy();
        
        // 刷新玩家信息显示
        this.scene.restart();
      }
    });
    confirmBtn.setDepth(102);
    
    // 按回车键也可以确认
    inputElement.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        confirmBtn.emit('pointerdown');
      }
    });
  }
}
