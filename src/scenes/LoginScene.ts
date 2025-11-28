/**
 * 登录场景
 * 负责用户登录和注册
 */

import Phaser from 'phaser';
import { AccountManager } from '../managers/AccountManager';
import ButtonFactory from '../utils/ButtonFactory';
import DOMUtils from '../utils/DOMUtils';
import { getTitleFont, getBodyFont } from '../config/FontConfig';

export default class LoginScene extends Phaser.Scene {
  private isOfflineMode: boolean = false;
  private loginContainer!: Phaser.GameObjects.Container;
  private registerContainer!: Phaser.GameObjects.Container;
  private currentMode: 'login' | 'register' = 'login';
  private loginInputs: HTMLInputElement[] = [];
  private registerInputs: HTMLInputElement[] = [];
  private loginInputPositions: Array<{ x: number; y: number }> = [];
  private registerInputPositions: Array<{ x: number; y: number }> = [];
  private gameWidth: number = 1280;
  private gameHeight: number = 720;
  private resizeHandler?: () => void;

  constructor() {
    super({ key: 'LoginScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.gameWidth = width;
    this.gameHeight = height;

    // 检查网络状态
    const accountManager = AccountManager.getInstance();
    accountManager.updateOfflineMode();
    this.isOfflineMode = accountManager.isOffline();

    // 背景
    this.createBackground();

    // 标题
    this.createTitle(width);

    // 如果离线模式，显示提示
    if (this.isOfflineMode) {
      this.showOfflineMode();
      // 尝试自动登录
      this.attemptAutoLogin();
      return;
    }

    // 创建登录界面
    this.createLoginUI(width, height);

    // 添加窗口大小变化监听
    this.setupResizeListener();

    // 尝试自动登录
    this.attemptAutoLogin();
  }

  /**
   * 设置窗口大小变化监听
   */
  private setupResizeListener(): void {
    // 移除旧的监听器（如果存在）
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      window.removeEventListener('orientationchange', this.resizeHandler);
      document.removeEventListener('fullscreenchange', this.resizeHandler);
      document.removeEventListener('webkitfullscreenchange', this.resizeHandler);
      document.removeEventListener('mozfullscreenchange', this.resizeHandler);
      document.removeEventListener('MSFullscreenChange', this.resizeHandler);
    }

    // 创建新的监听器
    this.resizeHandler = () => {
      // 延迟更新，等待布局完成
      setTimeout(() => {
        // 检查场景是否仍然活跃
        if (this.scene && this.scene.isActive()) {
          this.updateInputPositions();
        }
      }, 100);
    };

    // 添加各种事件监听
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('orientationchange', this.resizeHandler);
    document.addEventListener('fullscreenchange', this.resizeHandler);
    document.addEventListener('webkitfullscreenchange', this.resizeHandler);
    document.addEventListener('mozfullscreenchange', this.resizeHandler);
    document.addEventListener('MSFullscreenChange', this.resizeHandler);
  }

  /**
   * 更新所有输入框的位置
   */
  private updateInputPositions(): void {
    // 检查场景是否已初始化
    if (!this.cameras || !this.cameras.main) {
      console.warn('场景未初始化，跳过输入框位置更新');
      return;
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.gameWidth = width;
    this.gameHeight = height;

    // 更新登录输入框位置
    this.loginInputs.forEach((input, index) => {
      if (input && input.parentNode && this.loginInputPositions[index]) {
        const pos = this.loginInputPositions[index];
        DOMUtils.updateInputPosition(input, pos.x, pos.y, width, height);
      }
    });

    // 更新注册输入框位置
    this.registerInputs.forEach((input, index) => {
      if (input && input.parentNode && this.registerInputPositions[index]) {
        const pos = this.registerInputPositions[index];
        DOMUtils.updateInputPosition(input, pos.x, pos.y, width, height);
      }
    });
  }

  /**
   * 创建背景
   */
  private createBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const graphics = this.add.graphics();
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
   * 创建标题
   */
  private createTitle(width: number): void {
    const title = this.add.text(width / 2, 100, '数学童话冒险', {
      fontFamily: getTitleFont(),
      fontSize: '64px',
      color: '#FFD700',
      stroke: '#FF69B4',
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
  }

  /**
   * 显示离线模式提示
   */
  private showOfflineMode(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const offlineText = this.add.text(width / 2, height / 2 - 100, '离线模式', {
      fontFamily: getTitleFont(),
      fontSize: '48px',
      color: '#FF6347',
      stroke: '#000000',
      strokeThickness: 6
    });
    offlineText.setOrigin(0.5);

    const hintText = this.add.text(width / 2, height / 2, '网络不可用，将使用本地数据\n部分功能可能无法使用', {
      fontFamily: getBodyFont(),
      fontSize: '24px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    });
    hintText.setOrigin(0.5);

      // 继续按钮
      const continueBtn = ButtonFactory.createButton(this, {
        x: width / 2,
        y: height / 2 + 150,
        width: 200,
        height: 60,
        text: '继续游戏',
        color: 0x4CAF50,
        callback: () => {
          this.scene.start('PreloadScene');
        }
      });
  }

  /**
   * 创建登录界面
   */
  private createLoginUI(width: number, height: number): void {
    // 登录容器
    this.loginContainer = this.add.container(width / 2, height / 2);
    this.createLoginForm(width, height);

    // 注册容器（初始隐藏）
    this.registerContainer = this.add.container(width / 2, height / 2);
    this.registerContainer.setVisible(false);
    this.createRegisterForm(width, height);
  }

  /**
   * 创建登录表单
   */
  private createLoginForm(width: number, height: number): void {
    const container = this.loginContainer;
    
    // 清空之前的输入框
    this.cleanupInputs();

    // 标题
    const title = this.add.text(0, -200, '登录', {
      fontFamily: getTitleFont(),
      fontSize: '48px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);

    // 用户名输入提示（标签在容器内，相对于容器中心）
    const usernameLabel = this.add.text(-200, -100, '用户名:', {
      fontFamily: getBodyFont(),
      fontSize: '24px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    usernameLabel.setOrigin(0, 0.5);

    // 密码输入提示
    const passwordLabel = this.add.text(-200, -20, '密码:', {
      fontFamily: getBodyFont(),
      fontSize: '24px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    passwordLabel.setOrigin(0, 0.5);

    // 创建输入框（使用DOMUtils正确处理坐标转换）
    // 标签位置：容器中心 (width/2, height/2) + (-200, -100) = (width/2 - 200, height/2 - 100)
    // 标签宽度约100px（"用户名:"），所以标签右边缘在 width/2 - 200 + 100 = width/2 - 100
    // 输入框应该在标签右侧，间距20px，所以输入框左边缘在 width/2 - 100 + 20 = width/2 - 80
    // 输入框宽度300px，所以输入框中心应该在 width/2 - 80 + 150 = width/2 + 70
    const inputX = width / 2 + 70; // 输入框中心位置
    const inputY1 = height / 2 - 100; // 用户名输入框Y坐标
    const inputY2 = height / 2 - 20; // 密码输入框Y坐标
    
    // 保存输入框的游戏坐标（用于窗口大小变化时更新位置）
    this.loginInputPositions = [
      { x: inputX, y: inputY1 },
      { x: inputX, y: inputY2 }
    ];
    
    const usernameInput = DOMUtils.createPositionedInput(inputX, inputY1, width, height, 300, 40);
    usernameInput.type = 'text';
    usernameInput.placeholder = '请输入用户名';
    this.styleInputElement(usernameInput);
    
    const passwordInput = DOMUtils.createPositionedInput(inputX, inputY2, width, height, 300, 40);
    passwordInput.type = 'tel'; // 使用 tel 类型以在移动端显示数字键盘
    passwordInput.placeholder = '请输入6位数字密码';
    passwordInput.maxLength = 6;
    passwordInput.pattern = '[0-9]{6}';
    passwordInput.inputMode = 'numeric';
    // 只允许输入数字
    passwordInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      target.value = target.value.replace(/[^0-9]/g, '');
    });
    this.styleInputElement(passwordInput);
    
    // 保存输入框引用
    this.loginInputs = [usernameInput, passwordInput];

    // 登录按钮
    const loginBtn = ButtonFactory.createButton(this, {
      x: 0,
      y: 80,
      width: 200,
      height: 60,
      text: '登录',
      color: 0x4CAF50,
      callback: async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username) {
          alert('请输入用户名');
          return;
        }

        if (!password) {
          alert('请输入密码');
          return;
        }

        if (password.length !== 6 || !/^\d{6}$/.test(password)) {
          alert('密码必须是6位数字');
          return;
        }

        const accountManager = AccountManager.getInstance();
        const result = await accountManager.login(username, password);

        if (result.success) {
          // 登录成功，清理输入框并进入预加载场景
          this.cleanupInputs();
          this.scene.start('PreloadScene');
        } else {
          alert(result.message);
        }
      }
    });

    // 注册按钮
    const registerBtn = ButtonFactory.createButton(this, {
      x: 0,
      y: 160,
      width: 200,
      height: 60,
      text: '注册账号',
      color: 0x2196F3,
      callback: () => {
        this.switchToRegister();
      }
    });

    container.add([title, usernameLabel, passwordLabel, loginBtn, registerBtn]);
  }

  /**
   * 创建注册表单
   */
  private createRegisterForm(width: number, height: number): void {
    const container = this.registerContainer;

    // 标题
    const title = this.add.text(0, -200, '注册', {
      fontFamily: getTitleFont(),
      fontSize: '48px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);

    // 用户名输入提示
    const usernameLabel = this.add.text(-200, -120, '用户名:', {
      fontFamily: getBodyFont(),
      fontSize: '24px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    usernameLabel.setOrigin(0, 0.5);

    // 密码输入提示
    const passwordLabel = this.add.text(-200, -40, '密码:', {
      fontFamily: getBodyFont(),
      fontSize: '24px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    passwordLabel.setOrigin(0, 0.5);

    // 玩家名字输入提示
    const playerNameLabel = this.add.text(-200, 40, '游戏名字:', {
      fontFamily: getBodyFont(),
      fontSize: '24px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    playerNameLabel.setOrigin(0, 0.5);

    // 创建输入框（使用DOMUtils，与登录表单对齐）
    // 标签位置：容器中心 (width/2, height/2) + (-200, y)
    // 标签宽度："用户名:"约100px，"密码:"约80px，"游戏名字:"约120px
    // 为了统一对齐，使用最长的标签"游戏名字:"来计算
    // 标签右边缘：width/2 - 200 + 120 = width/2 - 80
    // 输入框左边缘：width/2 - 80 + 20 = width/2 - 60（间距20px）
    // 输入框中心：width/2 - 60 + 150 = width/2 + 90
    const inputX = width / 2 + 90; // 输入框中心位置（考虑最长标签）
    const inputY1 = height / 2 - 120; // 用户名输入框Y坐标
    const inputY2 = height / 2 - 40; // 密码输入框Y坐标
    const inputY3 = height / 2 + 40; // 游戏名字输入框Y坐标
    
    // 保存输入框的游戏坐标（用于窗口大小变化时更新位置）
    this.registerInputPositions = [
      { x: inputX, y: inputY1 },
      { x: inputX, y: inputY2 },
      { x: inputX, y: inputY3 }
    ];
    
    const usernameInput = DOMUtils.createPositionedInput(inputX, inputY1, width, height, 300, 40);
    usernameInput.type = 'text';
    usernameInput.placeholder = '请输入用户名';
    this.styleInputElement(usernameInput);
    
    const passwordInput = DOMUtils.createPositionedInput(inputX, inputY2, width, height, 300, 40);
    passwordInput.type = 'tel'; // 使用 tel 类型以在移动端显示数字键盘
    passwordInput.placeholder = '请输入6位数字密码';
    passwordInput.maxLength = 6;
    passwordInput.pattern = '[0-9]{6}';
    passwordInput.inputMode = 'numeric';
    // 只允许输入数字
    passwordInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      target.value = target.value.replace(/[^0-9]/g, '');
    });
    this.styleInputElement(passwordInput);
    
    const playerNameInput = DOMUtils.createPositionedInput(inputX, inputY3, width, height, 300, 40);
    playerNameInput.type = 'text';
    playerNameInput.placeholder = '请输入游戏名字';
    this.styleInputElement(playerNameInput);
    
    // 保存输入框引用，初始隐藏（因为注册表单初始是隐藏的）
    this.registerInputs = [usernameInput, passwordInput, playerNameInput];
    this.registerInputs.forEach(input => {
      input.style.display = 'none';
    });

    // 注册按钮
    const registerBtn = ButtonFactory.createButton(this, {
      x: 0,
      y: 140,
      width: 200,
      height: 60,
      text: '注册',
      color: 0x4CAF50,
      callback: async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const playerName = playerNameInput.value.trim();

        if (!username || !playerName) {
          alert('请填写用户名和游戏名字');
          return;
        }

        if (!password) {
          alert('请输入密码');
          return;
        }

        if (password.length !== 6 || !/^\d{6}$/.test(password)) {
          alert('密码必须是6位数字');
          return;
        }

        if (playerName.length < 2) {
          alert('游戏名字至少需要2个字');
          return;
        }

        const accountManager = AccountManager.getInstance();
        const result = await accountManager.register(username, password, playerName);

        if (result.success) {
          // 注册成功，清理输入框并进入预加载场景
          this.cleanupInputs();
          this.scene.start('PreloadScene');
        } else {
          alert(result.message);
        }
      }
    });

    // 返回登录按钮
    const backBtn = ButtonFactory.createButton(this, {
      x: 0,
      y: 220,
      width: 200,
      height: 60,
      text: '返回登录',
      color: 0x757575,
      callback: () => {
        this.switchToLogin();
      }
    });

    container.add([title, usernameLabel, passwordLabel, playerNameLabel, registerBtn, backBtn]);
  }

  /**
   * 设置输入框样式
   */
  private styleInputElement(input: HTMLInputElement): void {
    input.style.fontSize = '20px';
    input.style.padding = '5px 10px';
    input.style.border = '2px solid #FFFFFF';
    input.style.borderRadius = '5px';
    input.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    input.style.textAlign = 'left';
    input.style.outline = 'none';
    input.style.boxSizing = 'border-box';
    document.body.appendChild(input);
  }

  /**
   * 切换到注册界面
   */
  private switchToRegister(): void {
    this.currentMode = 'register';
    this.loginContainer.setVisible(false);
    // 隐藏登录输入框
    this.loginInputs.forEach(input => {
      if (input && input.parentNode) {
        input.style.display = 'none';
      }
    });
    // 显示注册输入框
    this.registerInputs.forEach(input => {
      if (input && input.parentNode) {
        input.style.display = 'block';
      }
    });
    this.registerContainer.setVisible(true);
  }

  /**
   * 切换到登录界面
   */
  private switchToLogin(): void {
    this.currentMode = 'login';
    this.registerContainer.setVisible(false);
    // 隐藏注册输入框
    this.registerInputs.forEach(input => {
      if (input && input.parentNode) {
        input.style.display = 'none';
      }
    });
    // 显示登录输入框
    this.loginInputs.forEach(input => {
      if (input && input.parentNode) {
        input.style.display = 'block';
      }
    });
    this.loginContainer.setVisible(true);
  }

  /**
   * 清理所有输入框
   */
  private cleanupInputs(): void {
    [...this.loginInputs, ...this.registerInputs].forEach(input => {
      if (input && input.parentNode) {
        input.remove();
      }
    });
    this.loginInputs = [];
    this.registerInputs = [];
    this.loginInputPositions = [];
    this.registerInputPositions = [];
    
    // 移除窗口大小变化监听
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      window.removeEventListener('orientationchange', this.resizeHandler);
      document.removeEventListener('fullscreenchange', this.resizeHandler);
      document.removeEventListener('webkitfullscreenchange', this.resizeHandler);
      document.removeEventListener('mozfullscreenchange', this.resizeHandler);
      document.removeEventListener('MSFullscreenChange', this.resizeHandler);
      this.resizeHandler = undefined;
    }
  }

  /**
   * 尝试自动登录
   */
  private async attemptAutoLogin(): Promise<void> {
    const accountManager = AccountManager.getInstance();
    const result = await accountManager.autoLogin();

    if (result.success) {
      // 自动登录成功，清理输入框
      this.cleanupInputs();
      // 延迟一下再跳转（让用户看到界面）
      this.time.delayedCall(500, () => {
        this.scene.start('PreloadScene');
      });
    }
    // 如果自动登录失败，显示登录界面
  }

  /**
   * 场景销毁时清理
   */
  shutdown(): void {
    this.cleanupInputs();
  }
}

