import Phaser from 'phaser';
import QuestionManager from '../managers/QuestionManager';
import AudioManager from '../managers/AudioManager';
import { EFFECTS, getEffectConfig } from '../config/EffectConfig';
import { getAllCharacters } from '../config/CharacterConfig';

/**
 * 预加载场景
 * 负责游戏启动前的预加载，只加载必要的资源
 * 游戏过程中的资源加载由 ResourceManager 负责
 */
export default class PreloadScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private progressBg!: Phaser.GameObjects.Graphics;
  private loadingIcon!: Phaser.GameObjects.Container;
  private tipText!: Phaser.GameObjects.Text;
  private stars: Phaser.GameObjects.Graphics[] = [];
  private currentTipIndex: number = 0;
  private tipInterval!: Phaser.Time.TimerEvent;
  
  // 加载提示文字
  private readonly loadingTips = [
    '正在准备魔法世界...',
    '正在加载角色资源...',
    '正在加载怪物数据...',
    '正在准备特效动画...',
    '正在加载题库...',
    '即将完成，请稍候...'
  ];
  
  constructor() {
    super({ key: 'PreloadScene' });
  }
  
  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 创建加载进度UI
    this.createLoadingUI(width, height);
    
    // 监听加载进度
    this.load.on('progress', (value: number) => {
      this.updateProgress(value, width, height);
    });
    
    this.load.on('complete', () => {
      this.onLoadComplete(width, height);
    });
    
    // 加载题库
    this.loadQuestionBank();
    
    // 加载公主角色（法师）
    this.loadPrincessSprites();
    
    // 加载怪物
    this.loadMonsterSprites();
    
    // 加载特效
    this.loadEffectSprites();
    
    // 加载音效（将音效文件放入assets/audio/后，取消下面的注释）
    // this.load.audio('correct', 'assets/audio/correct.mp3');
    // this.load.audio('wrong', 'assets/audio/wrong.mp3');
    // this.load.audio('click', 'assets/audio/click.mp3');
    // this.load.audio('star', 'assets/audio/star.mp3');
    // this.load.audio('coin', 'assets/audio/coin.mp3');
    
    // 加载背景音乐（可选）
    // this.load.audio('bgmMenu', 'assets/audio/bgm_menu.mp3');
    // this.load.audio('bgmGame', 'assets/audio/bgm_game.mp3');
  }
  
  /**
   * 加载公主精灵（法师职业，2号皮肤） - 现已升级为加载所有角色
   */
  private loadPrincessSprites(): void {
    // 加载所有可选角色
    this.loadAllCharacters();
  }
  
  /**
   * 加载所有可选角色（所有法师）
   * 注意：PreloadScene 只负责游戏启动前的预加载
   * 只加载默认角色，其他角色由 ResourceManager 在需要时加载
   */
  private loadAllCharacters(): void {
    // 只加载默认角色，其他角色由 ResourceManager 在需要时加载
    const defaultCharacter = { id: 'mage_307', folder: '307' };
    
    this.loadCharacterSprites(defaultCharacter.id, defaultCharacter.folder);
    
    console.log('已加载默认角色，其他角色将由 ResourceManager 在需要时加载');
  }
  
  /**
   * 加载单个角色的精灵
   */
  private loadCharacterSprites(characterId: string, folder: string): void {
    const basePath = `assets/res/player/${folder}/`;
    const prefix = characterId;
    
    // 加载待机动画（12帧）
    for (let i = 1; i <= 12; i++) {
      const key = `${prefix}_wait_${i.toString().padStart(3, '0')}`;
      const file = `${prefix}_wait_${i.toString().padStart(3, '0')}.png`;
      this.load.image(key, basePath + file);
    }
    
    // 加载攻击动画（12帧）
    for (let i = 1; i <= 12; i++) {
      const key = `${prefix}_attack_${i.toString().padStart(3, '0')}`;
      const file = `${prefix}_attack_${i.toString().padStart(3, '0')}.png`;
      this.load.image(key, basePath + file);
    }
    
    // 加载受击动画（3帧）
    for (let i = 1; i <= 3; i++) {
      const key = `${prefix}_hited_${i.toString().padStart(3, '0')}`;
      const file = `${prefix}_hited_${i.toString().padStart(3, '0')}.png`;
      this.load.image(key, basePath + file);
    }
  }
  
  /**
   * 加载怪物精灵（8种类型）
   * 注意：PreloadScene 只负责游戏启动前的预加载
   * 只加载前3种怪物，其他怪物由 ResourceManager 在需要时加载
   */
  private loadMonsterSprites(): void {
    const monsterTypes = [
      { folder: 'monster', prefix: 'monster' },       // 类型1：基础怪物
      { folder: 'monster1', prefix: 'monster1' },     // 类型2
      { folder: 'monster004', prefix: 'monster004' }, // 类型3
      { folder: 'monster005', prefix: 'monster005' }, // 类型4
      { folder: 'monster006', prefix: 'monster006' }, // 类型5
      { folder: 'monster007', prefix: 'monster007' }, // 类型6
      { folder: 'monster002', prefix: 'monster002' }, // 类型7
      { folder: 'monster009', prefix: 'monster009' }  // 类型8
    ];
    
    // 只加载前3种怪物（前3关），其他延迟加载
    const initialMonsters = monsterTypes.slice(0, 3);
    
    initialMonsters.forEach((type, difficulty) => {
      this.loadMonsterType(difficulty + 1, type.folder, type.prefix);
    });
    
    console.log(`已加载前3种怪物，其他怪物将由 ResourceManager 在需要时加载`);
  }
  
  /**
   * 加载单个怪物类型
   */
  private loadMonsterType(difficulty: number, folder: string, prefix: string): void {
    const basePath = `assets/res/monster/${folder}/`;
    
    // 加载待机动画
    for (let i = 1; i <= 8; i++) {
      const key = `monster${difficulty}_wait_${i.toString().padStart(3, '0')}`;
      const file = `${prefix}_wait_${i.toString().padStart(3, '0')}.png`;
      this.load.image(key, basePath + file);
    }
    
    // 加载攻击动画
    for (let i = 1; i <= 8; i++) {
      const key = `monster${difficulty}_attack_${i.toString().padStart(3, '0')}`;
      const file = `${prefix}_attack_${i.toString().padStart(3, '0')}.png`;
      this.load.image(key, basePath + file);
    }
    
    // 加载受击动画
    for (let i = 1; i <= 3; i++) {
      const key = `monster${difficulty}_hited_${i.toString().padStart(3, '0')}`;
      const file = `${prefix}_hited_${i.toString().padStart(3, '0')}.png`;
      this.load.image(key, basePath + file);
    }
  }
  
  /**
   * 加载特效精灵（按角色需求加载）
   */
  private loadEffectSprites(): void {
    const characters = getAllCharacters();
    const loadedEffects = new Set<string>(); // 避免重复加载
    
    console.log('开始加载角色特效资源...');
    
    characters.forEach(character => {
      // 加载子弹特效
      if (character.bulletEffect && !loadedEffects.has(character.bulletEffect)) {
        console.log(`加载子弹特效: ${character.bulletEffect} (${character.name})`);
        this.loadEffect(character.bulletEffect);
        loadedEffects.add(character.bulletEffect);
      }
      
      // 加载击中特效
      if (character.hitEffect && !loadedEffects.has(character.hitEffect)) {
        console.log(`加载击中特效: ${character.hitEffect} (${character.name})`);
        this.loadEffect(character.hitEffect);
        loadedEffects.add(character.hitEffect);
      }
    });
    
    console.log(`特效加载完成，共加载 ${loadedEffects.size} 个特效`);
  }
  
  /**
   * 加载单个特效的所有帧
   */
  private loadEffect(effectId: string): void {
    const effectData = getEffectConfig(effectId);
    if (!effectData) {
      console.warn(`特效配置不存在: ${effectId}`);
      return;
    }
    
    const basePath = `assets/res/effect/${effectId}/`;
    
    for (let i = 1; i <= effectData.frames; i++) {
      const key = `${effectId}_${i.toString().padStart(2, '0')}`;
      const file = `${effectId}_${i.toString().padStart(2, '0')}.png`;
      this.load.image(key, basePath + file);
    }
  }
  
  create(): void {
    console.log('PreloadScene: 资源加载完成');
    
    // 创建所有动画
    this.createAnimations();
    
    // 设置音频管理器
    AudioManager.getInstance().setScene(this);
    
    // 进入主菜单
    this.scene.start('MainMenuScene');
  }
  
  /**
   * 创建所有动画
   */
  private createAnimations(): void {
    // 创建公主动画
    this.createPrincessAnimations();
    
    // 创建怪物动画（只为已加载的怪物创建，即前3种）
    for (let difficulty = 1; difficulty <= 3; difficulty++) {
      // 检查资源是否存在
      const testKey = `monster${difficulty}_wait_001`;
      if (this.textures.exists(testKey)) {
        this.createMonsterAnimations(difficulty);
      }
    }
    
    // 创建特效动画
    this.createEffectAnimations();
  }
  
  /**
   * 创建公主动画 - 现已升级为创建所有角色动画
   */
  private createPrincessAnimations(): void {
    // 创建所有可选角色的动画
    this.createAllCharacterAnimations();
    
  }
  
  /**
   * 创建所有角色动画
   * 优化：只创建已加载的角色动画
   */
  private createAllCharacterAnimations(): void {
    // 只创建默认角色的动画
    this.createCharacterAnimations('mage_307');
  }
  
  /**
   * 创建单个角色的动画
   */
  private createCharacterAnimations(prefix: string): void {
    // 检查资源是否已加载
    const testKey = `${prefix}_wait_001`;
    if (!this.textures.exists(testKey)) {
      console.warn(`角色资源未加载: ${prefix}`);
      return;
    }
    
    // 待机动画
    const waitFrames: any[] = [];
    for (let i = 1; i <= 12; i++) {
      waitFrames.push({ 
        key: `${prefix}_wait_${i.toString().padStart(3, '0')}`,
        frame: 0
      });
    }
    this.anims.create({
      key: `${prefix}_wait`,
      frames: waitFrames,
      frameRate: 12,
      repeat: -1
    });
    
    // 攻击动画
    const attackFrames: any[] = [];
    for (let i = 1; i <= 12; i++) {
      attackFrames.push({ 
        key: `${prefix}_attack_${i.toString().padStart(3, '0')}`,
        frame: 0
      });
    }
    this.anims.create({
      key: `${prefix}_attack`,
      frames: attackFrames,
      frameRate: 24,
      repeat: 0
    });
    
    // 受击动画
    const hitedFrames: any[] = [];
    for (let i = 1; i <= 3; i++) {
      hitedFrames.push({ 
        key: `${prefix}_hited_${i.toString().padStart(3, '0')}`,
        frame: 0
      });
    }
    this.anims.create({
      key: `${prefix}_hited`,
      frames: hitedFrames,
      frameRate: 12,
      repeat: 0
    });
  }
  
  /**
   * 创建怪物动画
   */
  private createMonsterAnimations(difficulty: number): void {
    // 待机动画
    const waitFrames: any[] = [];
    for (let i = 1; i <= 8; i++) {
      waitFrames.push({ 
        key: `monster${difficulty}_wait_${i.toString().padStart(3, '0')}`,
        frame: 0
      });
    }
    this.anims.create({
      key: `monster${difficulty}_wait`,
      frames: waitFrames,
      frameRate: 8,
      repeat: -1
    });
    
    // 攻击动画
    const attackFrames: any[] = [];
    for (let i = 1; i <= 8; i++) {
      attackFrames.push({ 
        key: `monster${difficulty}_attack_${i.toString().padStart(3, '0')}`,
        frame: 0
      });
    }
    this.anims.create({
      key: `monster${difficulty}_attack`,
      frames: attackFrames,
      frameRate: 16,
      repeat: 0
    });
    
    // 受击动画
    const hitedFrames: any[] = [];
    for (let i = 1; i <= 3; i++) {
      hitedFrames.push({ 
        key: `monster${difficulty}_hited_${i.toString().padStart(3, '0')}`,
        frame: 0
      });
    }
    this.anims.create({
      key: `monster${difficulty}_hited`,
      frames: hitedFrames,
      frameRate: 12,
      repeat: 0
    });
  }
  
  /**
   * 创建特效动画（按角色需求创建）
   */
  private createEffectAnimations(): void {
    const characters = getAllCharacters();
    const createdAnims = new Set<string>();
    
    console.log('开始创建特效动画...');
    
    characters.forEach(character => {
      // 创建子弹动画
      if (character.bulletEffect && !createdAnims.has(character.bulletEffect)) {
        this.createEffectAnimation(character.bulletEffect, true); // true = 循环
        createdAnims.add(character.bulletEffect);
      }
      
      // 创建击中动画
      if (character.hitEffect && !createdAnims.has(character.hitEffect)) {
        this.createEffectAnimation(character.hitEffect, false); // false = 不循环
        createdAnims.add(character.hitEffect);
      }
    });
    
    console.log(`特效动画创建完成，共创建 ${createdAnims.size} 个动画`);
  }
  
  /**
   * 创建单个特效动画
   */
  private createEffectAnimation(effectId: string, repeat: boolean): void {
    const effectData = getEffectConfig(effectId);
    if (!effectData) {
      console.warn(`特效配置不存在: ${effectId}`);
      return;
    }
    
    const frames: any[] = [];
    for (let i = 1; i <= effectData.frames; i++) {
      frames.push({
        key: `${effectId}_${i.toString().padStart(2, '0')}`,
        frame: 0
      });
    }
    
    this.anims.create({
      key: effectId,
      frames: frames,
      frameRate: effectData.frameRate,
      repeat: repeat ? -1 : 0  // -1循环，0播放一次
    });
    
    console.log(`创建动画: ${effectId} (${effectData.frames}帧, ${effectData.frameRate}fps, ${repeat ? '循环' : '单次'})`);
  }
  
  /**
   * 创建加载UI
   */
  private createLoadingUI(width: number, height: number): void {
    // 创建渐变背景
    this.createGradientBackground(width, height);
    
    // 创建星星装饰
    this.createStarDecorations(width, height);
    
    // 创建加载图标（旋转的魔法球）
    this.createLoadingIcon(width, height);
    
    // 创建标题
    this.createTitle(width, height);
    
    // 创建进度条容器
    const progressY = height / 2 + 40;
    const progressWidth = 400;
    const progressHeight = 20;
    
    // 进度条外层背景（发光效果）
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0x000000, 0.5);
    this.progressBg.fillRoundedRect(
      width / 2 - progressWidth / 2 - 4,
      progressY - progressHeight / 2 - 4,
      progressWidth + 8,
      progressHeight + 8,
      12
    );
    
    // 进度条背景（圆角矩形）
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x2C2C2C, 0.9);
    this.progressBox.fillRoundedRect(
      width / 2 - progressWidth / 2,
      progressY - progressHeight / 2,
      progressWidth,
      progressHeight,
      10
    );
    
    // 进度条（带渐变效果）
    this.progressBar = this.add.graphics();
    
    // 加载百分比文字
    this.loadingText = this.add.text(width / 2, progressY + 35, '0%', {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '28px',
      color: '#FFD700',
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
    this.loadingText.setOrigin(0.5, 0.5);
    
    // 提示文字
    this.tipText = this.add.text(width / 2, progressY + 70, this.loadingTips[0], {
      fontFamily: 'Arial, Microsoft YaHei',
      fontSize: '20px',
      color: '#87CEEB',
      fontStyle: 'italic',
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#000000',
        blur: 3,
        fill: true
      }
    });
    this.tipText.setOrigin(0.5, 0.5);
    
    // 启动提示文字轮播
    this.startTipRotation();
  }
  
  /**
   * 创建渐变背景
   */
  private createGradientBackground(width: number, height: number): void {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      0x1a1a2e,  // 深蓝紫
      0x1a1a2e,
      0x16213e,  // 深蓝
      0x0f3460,  // 深蓝灰
      1
    );
    graphics.fillRect(0, 0, width, height);
  }
  
  /**
   * 创建星星装饰
   */
  private createStarDecorations(width: number, height: number): void {
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.3, 0.8);
      
      const star = this.add.graphics();
      star.fillStyle(0xFFFFFF, alpha);
      star.fillCircle(x, y, size);
      
      this.stars.push(star);
      
      // 星星闪烁动画
      this.tweens.add({
        targets: star,
        alpha: { from: alpha, to: alpha * 0.3 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 100
      });
    }
  }
  
  /**
   * 创建加载图标（旋转的魔法球）
   */
  private createLoadingIcon(width: number, height: number): void {
    const iconY = height / 2 - 80;
    
    // 外层光晕
    const outerGlow = this.add.graphics();
    outerGlow.fillStyle(0x4A90E2, 0.3);
    outerGlow.fillCircle(width / 2, iconY, 50);
    
    // 中层光晕
    const midGlow = this.add.graphics();
    midGlow.fillStyle(0x87CEEB, 0.5);
    midGlow.fillCircle(width / 2, iconY, 35);
    
    // 核心魔法球
    const core = this.add.graphics();
    core.fillGradientStyle(
      0xFFFFFF,
      0xFFFFFF,
      0x87CEEB,
      0x4A90E2,
      1
    );
    core.fillCircle(width / 2, iconY, 25);
    
    // 添加发光效果
    const sparkle = this.add.graphics();
    sparkle.fillStyle(0xFFFFFF, 0.8);
    sparkle.fillCircle(width / 2, iconY - 10, 8);
    
    this.loadingIcon = this.add.container(width / 2, iconY, [
      outerGlow,
      midGlow,
      core,
      sparkle
    ]);
    
    // 旋转动画
    this.tweens.add({
      targets: this.loadingIcon,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });
    
    // 闪烁动画
    this.tweens.add({
      targets: [outerGlow, midGlow],
      alpha: { from: 0.3, to: 0.6 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  /**
   * 创建标题
   */
  private createTitle(width: number, height: number): void {
    const title = this.add.text(width / 2, height / 2 - 180, '数学冒险', {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '64px',
      color: '#FFD700',
      stroke: '#FF69B4',
      strokeThickness: 6,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000000',
        blur: 8,
        fill: true
      }
    });
    title.setOrigin(0.5, 0.5);
    
    // 标题动画
    title.setAlpha(0);
    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    });
    
    // 轻微浮动效果
    this.tweens.add({
      targets: title,
      y: title.y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  /**
   * 启动提示文字轮播
   */
  private startTipRotation(): void {
    this.tipInterval = this.time.addEvent({
      delay: 2000, // 每2秒切换一次
      callback: () => {
        this.currentTipIndex = (this.currentTipIndex + 1) % this.loadingTips.length;
        this.tweens.add({
          targets: this.tipText,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.tipText.setText(this.loadingTips[this.currentTipIndex]);
            this.tweens.add({
              targets: this.tipText,
              alpha: 1,
              duration: 300
            });
          }
        });
      },
      loop: true
    });
  }
  
  /**
   * 更新加载进度
   */
  private updateProgress(value: number, width: number, height: number): void {
    const progressY = height / 2 + 40;
    const progressWidth = 400;
    const progressHeight = 20;
    const currentWidth = progressWidth * value;
    
    // 清除旧的进度条
    this.progressBar.clear();
    
    // 根据进度值计算颜色（从蓝色到金色）
    let color: number;
    if (value < 0.5) {
      // 前半段：蓝色到天蓝色
      const ratio = value * 2;
      const colorObj = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x4A90E2),
        Phaser.Display.Color.ValueToColor(0x87CEEB),
        100,
        ratio * 100
      );
      color = Phaser.Display.Color.GetColor(colorObj.r, colorObj.g, colorObj.b);
    } else {
      // 后半段：天蓝色到金色
      const ratio = (value - 0.5) * 2;
      const colorObj = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x87CEEB),
        Phaser.Display.Color.ValueToColor(0xFFD700),
        100,
        ratio * 100
      );
      color = Phaser.Display.Color.GetColor(colorObj.r, colorObj.g, colorObj.b);
    }
    
    // 绘制进度条（带圆角）
    this.progressBar.fillStyle(color, 1);
    this.progressBar.fillRoundedRect(
      width / 2 - progressWidth / 2,
      progressY - progressHeight / 2,
      currentWidth,
      progressHeight,
      10
    );
    
    // 添加发光效果（进度条末端）
    if (currentWidth > 10) {
      this.progressBar.fillStyle(0xFFFFFF, 0.6);
      this.progressBar.fillCircle(
        width / 2 - progressWidth / 2 + currentWidth,
        progressY,
        12
      );
    }
    
    // 更新百分比文字
    const percent = Math.floor(value * 100);
    this.loadingText.setText(`${percent}%`);
    
    // 根据进度更新提示文字
    const tipIndex = Math.floor(value * (this.loadingTips.length - 1));
    if (tipIndex !== this.currentTipIndex && tipIndex < this.loadingTips.length) {
      this.currentTipIndex = tipIndex;
      this.tipText.setText(this.loadingTips[this.currentTipIndex]);
    }
  }
  
  /**
   * 加载完成处理
   */
  private onLoadComplete(width: number, height: number): void {
    // 停止提示轮播
    if (this.tipInterval) {
      this.tipInterval.remove();
    }
    
    // 更新为完成状态
    this.loadingText.setText('100%');
    this.tipText.setText('加载完成！');
    this.tipText.setColor('#00FF00');
    
    // 进度条填满动画
    const progressY = height / 2 + 40;
    const progressWidth = 400;
    const progressHeight = 20;
    
    // 确保进度条填满
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00FF00, 1);
    this.progressBar.fillRoundedRect(
      width / 2 - progressWidth / 2,
      progressY - progressHeight / 2,
      progressWidth,
      progressHeight,
      10
    );
    
    // 加载图标闪烁效果
    if (this.loadingIcon) {
      this.tweens.add({
        targets: this.loadingIcon,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        yoyo: true,
        repeat: 1
      });
    }
    
    // 延迟后进入主菜单
    this.time.delayedCall(800, () => {
      // 淡出效果
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });
  }
  
  /**
   * 加载题库
   */
  private async loadQuestionBank(): Promise<void> {
    try {
      await QuestionManager.getInstance().loadQuestionBank();
    } catch (error) {
      console.error('题库加载失败', error);
    }
  }
}
