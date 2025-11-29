import Phaser from 'phaser';
import DataManager from '../managers/DataManager';
import AudioManager from '../managers/AudioManager';
import ButtonFactory from '../utils/ButtonFactory';
import DOMUtils from '../utils/DOMUtils';
import { LeaderboardManager } from '../managers/LeaderboardManager';
import { AccountManager } from '../managers/AccountManager';
import NetworkUtils from '../utils/NetworkUtils';
import { getTitleFont, getBodyFont } from '../config/FontConfig';

/**
 * 主菜单场景 - 全新设计（使用ButtonFactory）
 */
export default class MainMenuScene extends Phaser.Scene {
  private stars: Phaser.GameObjects.Graphics[] = [];
  private uiElements: {
    background?: Phaser.GameObjects.Graphics;
    titleBg?: Phaser.GameObjects.Graphics;
    title?: Phaser.GameObjects.Text;
    subtitle?: Phaser.GameObjects.Text;
    nameCardBg?: Phaser.GameObjects.Graphics;
    nameText?: Phaser.GameObjects.Text;
    coinCardBg?: Phaser.GameObjects.Graphics;
    coinText?: Phaser.GameObjects.Text;
    starCardBg?: Phaser.GameObjects.Graphics;
    starText?: Phaser.GameObjects.Text;
    playerCountCardBg?: Phaser.GameObjects.Graphics;
    playerCountText?: Phaser.GameObjects.Text;
    switchAccountBtn?: Phaser.GameObjects.Container;
    menuButtons?: Phaser.GameObjects.Container[];
    footerBg?: Phaser.GameObjects.Graphics;
    versionText?: Phaser.GameObjects.Text;
    footerIcons?: Phaser.GameObjects.Text[];
    offlineHint?: Phaser.GameObjects.Text;
  } = {};
  
  constructor() {
    super({ key: 'MainMenuScene' });
  }
  
  create(): void {
    // 使用游戏世界尺寸（在FIT模式下始终是1280x720）
    const width = this.scale.gameSize.width || this.cameras.main.width || 1280;
    const height = this.scale.gameSize.height || this.cameras.main.height || 720;
    
    // 检查登录状态
    const accountManager = AccountManager.getInstance();
    if (!accountManager.isLoggedIn()) {
      // 未登录，跳转到登录场景
      this.scene.start('LoginScene');
      return;
    }
    
    // 背景渐变
    this.createBackground();
    
    // 添加星星装饰
    this.createStars();
    
    // 游戏标题
    this.createTitle(width, height);
    
    // 玩家信息
    this.createPlayerInfo(width, height);
    
    // 总玩家数量（异步加载，离线模式下不显示）
    this.createTotalPlayerCount(width);
    
    // 切换账号按钮
    this.createSwitchAccountButton(width, height);
    
    // 菜单按钮
    this.createMenuButtons(width, height);
    
    // 添加底部装饰
    this.createFooter(width, height);
    
    // 播放背景音乐（如果有）
    // AudioManager.getInstance().playMusic('mainMenu');
    
    // 监听窗口大小变化
    this.setupResizeListener();
  }
  
  /**
   * 设置窗口大小变化监听
   */
  private setupResizeListener(): void {
    // 监听 Phaser scale 的 resize 事件
    this.scale.on('resize', () => {
      this.handleResize();
    }, this);
  }
  
  /**
   * 处理窗口大小变化
   */
  handleResize(): void {
    // 延迟执行，确保scale完全刷新
    setTimeout(() => {
      // 检查场景是否活跃和摄像头是否已初始化
      if (!this.scene.isActive() || !this.cameras || !this.cameras.main) {
        return;
      }
      
      // 使用游戏世界尺寸（在FIT模式下始终是1280x720）
      const width = this.scale.gameSize?.width || this.cameras.main.width || 1280;
      const height = this.scale.gameSize?.height || this.cameras.main.height || 720;
      
      // 检查宽度和高度是否有效
      if (!width || !height || width <= 0 || height <= 0) {
        return;
      }
      
      // 重新布局所有UI元素
      this.relayoutUI(width, height);
    }, 100);
  }
  
  /**
   * 重新布局UI元素
   */
  private relayoutUI(width: number, height: number): void {
    // 在FIT模式下，游戏世界尺寸始终是1280x720
    // 在RESIZE模式下，游戏世界尺寸会动态变化
    // Phaser会自动缩放画布以适应容器，我们只需要按当前游戏世界尺寸重新布局元素
    
    // 确保尺寸有效
    if (!width || !height || width <= 0 || height <= 0) {
      return;
    }
    
    // 重新创建背景
    if (this.uiElements.background) {
      this.uiElements.background.clear();
      this.uiElements.background.fillGradientStyle(
        0x87CEEB, 0x87CEEB, 0xE6B0FF, 0xFFB6E1, 1
      );
      this.uiElements.background.fillRect(0, 0, width, height);
      // 确保背景可见
      this.uiElements.background.setVisible(true);
    }
    
    // 重新布局标题（使用原始尺寸）
    if (this.uiElements.titleBg) {
      this.uiElements.titleBg.clear();
      this.uiElements.titleBg.fillStyle(0xFFFFFF, 0.2);
      this.uiElements.titleBg.fillRoundedRect(width / 2 - 350, height * 0.12, 700, 140, 20);
    }
    if (this.uiElements.title) {
      this.uiElements.title.setPosition(width / 2, height * 0.15);
      this.uiElements.title.setVisible(true);
    }
    if (this.uiElements.subtitle) {
      this.uiElements.subtitle.setPosition(width / 2, height * 0.23);
      this.uiElements.subtitle.setVisible(true);
    }
    
    // 重新布局玩家信息（左侧，使用原始尺寸）
    if (this.uiElements.nameCardBg) {
      this.uiElements.nameCardBg.clear();
      this.uiElements.nameCardBg.fillStyle(0xFFFFFF, 0.3);
      this.uiElements.nameCardBg.fillRoundedRect(20, 20, 200, 50, 25);
    }
    if (this.uiElements.nameText) {
      this.uiElements.nameText.setPosition(30, 45);
      this.uiElements.nameText.setVisible(true);
    }
    
    // 重新布局右侧卡片（使用原始尺寸）
    const rightCardX = width - 180;
    
    if (this.uiElements.coinCardBg) {
      this.uiElements.coinCardBg.clear();
      this.uiElements.coinCardBg.fillStyle(0xFFD700, 0.3);
      this.uiElements.coinCardBg.fillRoundedRect(rightCardX, 20, 160, 50, 25);
    }
    if (this.uiElements.coinText) {
      this.uiElements.coinText.setPosition(width - 90, 45);
      this.uiElements.coinText.setVisible(true);
      // 更新金币数量
      const data = DataManager.getInstance().playerData;
      this.uiElements.coinText.setText(`💰 ${data.coins}`);
    }
    
    if (this.uiElements.starCardBg) {
      this.uiElements.starCardBg.clear();
      this.uiElements.starCardBg.fillStyle(0xFFA500, 0.3);
      this.uiElements.starCardBg.fillRoundedRect(rightCardX, 85, 160, 50, 25);
      this.uiElements.starCardBg.setVisible(true);
    }
    if (this.uiElements.starText) {
      this.uiElements.starText.setPosition(width - 90, 110);
      this.uiElements.starText.setVisible(true);
      // 更新星星数量
      const data = DataManager.getInstance().playerData;
      this.uiElements.starText.setText(`⭐ ${data.totalStars}`);
    }
    
    // 重新布局总玩家数量（使用原始尺寸）
    if (this.uiElements.playerCountCardBg) {
      this.uiElements.playerCountCardBg.clear();
      this.uiElements.playerCountCardBg.fillStyle(0x9B59B6, 0.3);
      this.uiElements.playerCountCardBg.fillRoundedRect(rightCardX, 150, 160, 50, 25);
    }
    if (this.uiElements.playerCountText) {
      this.uiElements.playerCountText.setPosition(width - 90, 175);
      this.uiElements.playerCountText.setVisible(true);
    }
    
    // 重新布局切换账号按钮（使用原始尺寸）
    if (this.uiElements.switchAccountBtn) {
      this.uiElements.switchAccountBtn.setPosition(20 + 100, 20 + 50 + 10 + 22.5);
      this.uiElements.switchAccountBtn.setScale(1);
      this.uiElements.switchAccountBtn.setVisible(true);
    }
    
    // 重新布局菜单按钮（使用原始尺寸）
    if (this.uiElements.menuButtons && this.uiElements.menuButtons.length > 0) {
      const startY = height * 0.42;
      const buttonSpacing = 90;
      this.uiElements.menuButtons.forEach((button, index) => {
        const y = startY + index * buttonSpacing;
        button.setPosition(width / 2, y);
        button.setScale(1);
        button.setVisible(true);
      });
    }
    
    // 重新布局底部（使用原始尺寸）
    if (this.uiElements.footerBg) {
      this.uiElements.footerBg.clear();
      this.uiElements.footerBg.fillStyle(0xFFFFFF, 0.2);
      this.uiElements.footerBg.fillRect(0, height - 50, width, 50);
    }
    if (this.uiElements.versionText) {
      this.uiElements.versionText.setPosition(width / 2, height - 25);
    }
    if (this.uiElements.footerIcons && this.uiElements.footerIcons.length > 0) {
      const decorIcons = ['🌟', '🎈', '🦄', '🌈', '🎨', '🎪'];
      this.uiElements.footerIcons.forEach((icon, index) => {
        const x = (width / (decorIcons.length + 1)) * (index + 1);
        const iconY = height - 75;
        icon.setPosition(x, iconY);
      });
    }
    if (this.uiElements.offlineHint) {
      this.uiElements.offlineHint.setPosition(width / 2, height - 100);
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
   * 创建背景（更漂亮的渐变）
   */
  private createBackground(): void {
    // 使用游戏世界尺寸（在FIT模式下始终是1280x720）
    const width = this.scale.gameSize.width || this.cameras.main.width || 1280;
    const height = this.scale.gameSize.height || this.cameras.main.height || 720;
    
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
    this.uiElements.background = graphics;
  }
  
  /**
   * 创建星星装饰
   */
  private createStars(): void {
    // 使用游戏世界尺寸（在FIT模式下始终是1280x720）
    const width = this.scale.gameSize.width || this.cameras.main.width || 1280;
    const height = this.scale.gameSize.height || this.cameras.main.height || 720;
    
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
    this.uiElements.titleBg = titleBg;
    
    // 主标题
    const title = this.add.text(width / 2, height * 0.15, '数学童话冒险', {
      fontFamily: getTitleFont(),
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
    this.uiElements.title = title;
    
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
    const subtitle = this.add.text(width / 2, height * 0.23, '🎮 通过答题击败怪物，保卫你的角色！⚔️', {
      fontFamily: getBodyFont(),
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
    this.uiElements.subtitle = subtitle;
    
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
    this.uiElements.nameCardBg = nameCardBg;
    
    const accountManager = AccountManager.getInstance();
    const displayName = accountManager.getPlayerName() || '未设置';
    const nameText = this.add.text(30, 45, `👑 ${displayName}`, {
      fontFamily: getBodyFont(),
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
    this.uiElements.nameText = nameText;
    
    // 右侧金币卡片
    const coinCardBg = this.add.graphics();
    coinCardBg.fillStyle(0xFFD700, 0.3);
    coinCardBg.fillRoundedRect(width - 180, 20, 160, 50, 25);
    this.uiElements.coinCardBg = coinCardBg;
    
    const coinText = this.add.text(width - 90, 45, `💰 ${data.coins}`, {
      fontFamily: getTitleFont(),
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
    this.uiElements.coinText = coinText;
    
    // 右侧星星卡片
    const starCardBg = this.add.graphics();
    starCardBg.fillStyle(0xFFA500, 0.3);
    starCardBg.fillRoundedRect(width - 180, 85, 160, 50, 25);
    this.uiElements.starCardBg = starCardBg;
    
    const starText = this.add.text(width - 90, 110, `⭐ ${data.totalStars}`, {
      fontFamily: getTitleFont(),
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
    this.uiElements.starText = starText;
  }
  
  /**
   * 创建总玩家数量显示（右上角）
   */
  private async createTotalPlayerCount(width: number): Promise<void> {
    // 如果未配置 Supabase，不显示
    if (!LeaderboardManager.isConfigured()) {
      return;
    }
    
    // 右侧总玩家数量卡片（放在星星卡片下方）
    const playerCountCardBg = this.add.graphics();
    playerCountCardBg.fillStyle(0x9B59B6, 0.3); // 紫色背景
    playerCountCardBg.fillRoundedRect(width - 180, 150, 160, 50, 25);
    this.uiElements.playerCountCardBg = playerCountCardBg;
    
    // 先显示加载中
    // 使用系统字体作为回退，避免字体未加载完成时的错误
    const playerCountText = this.add.text(width - 90, 175, `👥 加载中...`, {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif', // 使用系统字体作为回退
      fontSize: '22px',
      color: '#FFFFFF',
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
    playerCountText.setOrigin(0.5);
    this.uiElements.playerCountText = playerCountText;
    
    // 安全的文本更新函数
    const safeSetText = (text: string) => {
      try {
        if (playerCountText && playerCountText.active) {
          playerCountText.setText(text);
        }
      } catch (error) {
        // 更新文本时出错，忽略
      }
    };
    
    // 异步获取总玩家数量
    try {
      if (!NetworkUtils.isOnline()) {
        safeSetText(`👥 离线`);
        return;
      }
      
      const leaderboardManager = LeaderboardManager.getInstance();
      const totalCount = await leaderboardManager.getTotalPlayerCount();
      
      // 更新显示
      if (totalCount > 0) {
        safeSetText(`👥 ${totalCount} 玩家`);
        // 总玩家数量已更新
      } else {
        safeSetText(`👥 --`);
      }
    } catch (error) {
      NetworkUtils.logNetworkError('获取总玩家数量', error);
      safeSetText(`👥 --`);
    }
  }
  
  /**
   * 创建切换账号按钮
   */
  private createSwitchAccountButton(width: number, height: number): void {
    const accountManager = AccountManager.getInstance();
    
    // 切换账号按钮（左上角，在玩家名字卡片下方）
    // 玩家名字卡片：X=20, Y=20, 宽度=200, 高度=50
    // 按钮中心与卡片中心对齐，放在卡片下方
    const switchAccountBtn = ButtonFactory.createButton(this, {
      x: 20 + 100, // 玩家名字卡片中心 X (20 + 200/2)
      y: 20 + 50 + 10 + 22.5, // 玩家名字卡片底部 + 间距 + 按钮高度的一半
      width: 160,
      height: 45,
      text: '切换账号',
      icon: '🔄',
      color: 0x6C5CE7, // 紫色
      fontSize: '24px',
      strokeThickness: 3,
      callback: async () => {
        AudioManager.getInstance().playSFX('click');
        // 确认对话框
        const confirmed = confirm('确定要切换账号吗？当前账号数据将保存。');
        if (confirmed) {
          // 先保存当前账号数据到服务器
          if (!accountManager.isOffline()) {
            await accountManager.saveGameDataToServer();
          }
          // 登出当前账号
          accountManager.logout();
          // 跳转到登录界面
          this.scene.start('LoginScene');
        }
      }
    });
    this.uiElements.switchAccountBtn = switchAccountBtn;
    
    // 添加悬停效果
    switchAccountBtn.on('pointerover', () => {
      switchAccountBtn.setScale(1.05);
    });
    switchAccountBtn.on('pointerout', () => {
      switchAccountBtn.setScale(1);
    });
  }
  
  /**
   * 创建菜单按钮（使用统一的ButtonFactory）
   */
  private createMenuButtons(width: number, height: number): void {
    const startY = height * 0.42;
    const buttonSpacing = 90;
    
    const accountManager = AccountManager.getInstance();
    const isOffline = accountManager.isOffline();
    
    // 按钮配置（文字、图标、颜色）
    const buttons = [
      { text: '开始冒险', icon: '🎮', color: 0xFF69B4, delay: 0, disabled: false },
      { text: '皮肤商店', icon: '🎨', color: 0xFF1493, delay: 100, disabled: false },
      { text: '排行榜', icon: '🏆', color: 0xFFB6C1, delay: 200, disabled: isOffline },
      { text: '设置', icon: '⚙️', color: 0xFFA0C8, delay: 300, disabled: false }
    ];
    
    if (!this.uiElements.menuButtons) {
      this.uiElements.menuButtons = [];
    }
    buttons.forEach((config, index) => {
      const y = startY + index * buttonSpacing;
      const callback = index === 0 ? () => this.scene.start('WorldMapScene') :
                       index === 1 ? () => this.showSkinShop() :
                       index === 2 ? () => this.showLeaderboard() :
                                     () => this.showSettings();
      
      // 使用统一的ButtonFactory
      const button = ButtonFactory.createButton(this, {
        x: width / 2,
        y: y,
        width: 250,
        height: 54,
        text: config.disabled ? `${config.text} (离线不可用)` : config.text,
        icon: config.icon,
        color: config.disabled ? 0x757575 : config.color, // 禁用时使用灰色
        fontSize: '36px',
        strokeThickness: 4,
        delay: config.delay,
        animationDuration: 400,
        callback: () => {
          if (config.disabled) {
            alert('此功能需要网络连接，当前处于离线模式');
            return;
          }
          AudioManager.getInstance().playSFX('click');
          callback();
        }
      });
      
      // 如果禁用，降低透明度
      if (config.disabled) {
        button.setAlpha(0.5);
      }
      
      if (this.uiElements.menuButtons) {
        this.uiElements.menuButtons.push(button);
      }
    });
    
    // 如果离线模式，显示提示
    if (isOffline) {
      const offlineHint = this.add.text(width / 2, height - 100, '⚠️ 离线模式：部分功能不可用', {
        fontFamily: getBodyFont(),
        fontSize: '20px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 4
      });
      offlineHint.setOrigin(0.5);
      this.uiElements.offlineHint = offlineHint;
    }
  }
  
  /**
   * 创建底部装饰
   */
  private createFooter(width: number, height: number): void {
    // 底部装饰条
    const footerBg = this.add.graphics();
    footerBg.fillStyle(0xFFFFFF, 0.2);
    footerBg.fillRect(0, height - 50, width, 50);
    this.uiElements.footerBg = footerBg;
    
    // 版本信息
    const versionText = this.add.text(width / 2, height - 25, '专为小朋友设计的数学学习游戏 ❤️', {
      fontFamily: getBodyFont(),
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#FF69B4',
      strokeThickness: 3
    });
    versionText.setOrigin(0.5);
    versionText.setPadding(4, 4, 4, 4);
    this.uiElements.versionText = versionText;
    
    // 添加可爱的小图标装饰（调整位置，避免被裁切）
    const decorIcons = ['🌟', '🎈', '🦄', '🌈', '🎨', '🎪'];
    if (!this.uiElements.footerIcons) {
      this.uiElements.footerIcons = [];
    }
    decorIcons.forEach((icon, index) => {
      const x = (width / (decorIcons.length + 1)) * (index + 1);
      const iconY = height - 75; // 调整位置，确保完整显示
      const iconText = this.add.text(x, iconY, icon, {
        fontSize: '32px' // 稍微缩小，避免裁切
      });
      iconText.setOrigin(0.5);
      iconText.setPadding(10, 10, 10, 10); // 增加padding防止emoji裁切
      if (this.uiElements.footerIcons) {
        this.uiElements.footerIcons.push(iconText);
      }
      
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
   * 场景销毁时清理
   */
  shutdown(): void {
    // 移除 resize 监听器
    if (this.scale) {
      this.scale.off('resize', this.handleResize, this);
    }
  }
  
}
