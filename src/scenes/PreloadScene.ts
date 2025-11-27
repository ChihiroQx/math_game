import Phaser from 'phaser';
import QuestionManager from '../managers/QuestionManager';
import AudioManager from '../managers/AudioManager';

/**
 * 预加载场景
 * 负责加载所有游戏资源
 */
export default class PreloadScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  
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
      this.progressBar.clear();
      this.progressBar.fillStyle(0xffffff, 1);
      this.progressBar.fillRect(width / 2 - 160, height / 2 - 10, 320 * value, 30);
      this.loadingText.setText(`加载中... ${Math.floor(value * 100)}%`);
    });
    
    this.load.on('complete', () => {
      this.progressBar.destroy();
      this.progressBox.destroy();
      this.loadingText.destroy();
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
   */
  private loadAllCharacters(): void {
    const characters = [
      { id: 'mage_307', folder: '307' },  // 圣骑之星 - 艾莉丝（默认）
      { id: 'mage_119', folder: '119' },  // 暗影刺客 - 莉莉丝
      { id: 'mage_303', folder: '303' },  // 冰霜法师 - 艾莎
      { id: 'mage_311', folder: '311' },  // 魔法少女 - 米娅
      { id: 'mage_335', folder: '335' },  // 星辉术士 - 诺娅
      { id: 'mage_315', folder: '315' }   // 烈焰骑士 - 露娜
    ];
    
    characters.forEach(char => {
      const basePath = `assets/res/player/${char.folder}/`;
      const prefix = char.id;
      
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
    });
  }
  
  /**
   * 加载怪物精灵（8种类型）
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
    
    monsterTypes.forEach((type, difficulty) => {
      const basePath = `assets/res/monster/${type.folder}/`;
      const prefix = type.prefix;
      
      // 加载待机动画
      for (let i = 1; i <= 8; i++) {
        const key = `monster${difficulty + 1}_wait_${i.toString().padStart(3, '0')}`;
        const file = `${prefix}_wait_${i.toString().padStart(3, '0')}.png`;
        this.load.image(key, basePath + file);
      }
      
      // 加载攻击动画
      for (let i = 1; i <= 8; i++) {
        const key = `monster${difficulty + 1}_attack_${i.toString().padStart(3, '0')}`;
        const file = `${prefix}_attack_${i.toString().padStart(3, '0')}.png`;
        this.load.image(key, basePath + file);
      }
      
      // 加载受击动画
      for (let i = 1; i <= 3; i++) {
        const key = `monster${difficulty + 1}_hited_${i.toString().padStart(3, '0')}`;
        const file = `${prefix}_hited_${i.toString().padStart(3, '0')}.png`;
        this.load.image(key, basePath + file);
      }
    });
  }
  
  /**
   * 加载特效精灵
   */
  private loadEffectSprites(): void {
    // 魔法弹特效（攻击）
    const attackPath = 'assets/res/effect/effect_024/';
    for (let i = 1; i <= 17; i++) {
      const key = `magic_bullet_${i.toString().padStart(2, '0')}`;
      const file = `effect_024_${i.toString().padStart(2, '0')}.png`;
      this.load.image(key, attackPath + file);
    }
    
    // 爆炸特效（击中）
    const hitPath = 'assets/res/effect/effect_020h/';
    for (let i = 1; i <= 11; i++) {
      const key = `hit_explosion_${i.toString().padStart(2, '0')}`;
      const file = `effect_020h_${i.toString().padStart(2, '0')}.png`;
      this.load.image(key, hitPath + file);
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
    
    // 创建怪物动画（8种类型）
    for (let difficulty = 1; difficulty <= 8; difficulty++) {
      this.createMonsterAnimations(difficulty);
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
   */
  private createAllCharacterAnimations(): void {
    const prefixes = ['mage_119', 'mage_303', 'mage_307', 'mage_311', 'mage_315', 'mage_335'];
    
    prefixes.forEach(prefix => {
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
   * 创建特效动画
   */
  private createEffectAnimations(): void {
    // 魔法弹特效
    const magicFrames: any[] = [];
    for (let i = 1; i <= 17; i++) {
      magicFrames.push({ 
        key: `magic_bullet_${i.toString().padStart(2, '0')}`,
        frame: 0
      });
    }
    this.anims.create({
      key: 'magic_bullet',
      frames: magicFrames,
      frameRate: 30,
      repeat: -1
    });
    
    // 爆炸特效
    const explosionFrames: any[] = [];
    for (let i = 1; i <= 11; i++) {
      explosionFrames.push({ 
        key: `hit_explosion_${i.toString().padStart(2, '0')}`,
        frame: 0
      });
    }
    this.anims.create({
      key: 'hit_explosion',
      frames: explosionFrames,
      frameRate: 24,
      repeat: 0
    });
  }
  
  /**
   * 创建加载UI
   */
  private createLoadingUI(width: number, height: number): void {
    // 进度条背景
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 2 - 160, height / 2 - 10, 320, 30);
    
    // 进度条
    this.progressBar = this.add.graphics();
    
    // 加载文字
    this.loadingText = this.add.text(width / 2, height / 2 - 50, '加载中... 0%', {
      fontFamily: 'Arial, Microsoft YaHei',
      fontSize: '24px',
      color: '#ffffff'
    });
    this.loadingText.setOrigin(0.5, 0.5);
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
