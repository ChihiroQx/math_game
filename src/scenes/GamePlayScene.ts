import Phaser from 'phaser';
import GameManager from '../managers/GameManager';
import QuestionManager, { QuestionData } from '../managers/QuestionManager';
import AudioManager from '../managers/AudioManager';
import DataManager from '../managers/DataManager';
import TimerManager from '../managers/TimerManager';
import { Monster } from '../entities/Monster';
import { Princess } from '../entities/Princess';
import ButtonFactory from '../utils/ButtonFactory';

/**
 * 游戏玩法场景 - 战斗版本（使用ButtonFactory）
 * 公主保卫战：答题击退怪物！
 */
export default class GamePlayScene extends Phaser.Scene {
  private gameManager!: GameManager;
  private questionManager!: QuestionManager;
  private audioManager!: AudioManager;
  private timerManager!: TimerManager;
  
  private currentQuestion: QuestionData | null = null;
  private answerButtons: Phaser.GameObjects.Text[] = [];
  
  // 战斗相关
  private princess!: Princess;
  private monsters: Monster[] = [];
  private currentMonsterIndex: number = 0;
  private activeMonsters: Monster[] = [];
  private monstersPerWave: number = 3;
  private isAnswering: boolean = false;
  private gameEnded: boolean = false; // 防止重复结算
  
  // UI元素
  private questionText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private pauseButton!: Phaser.GameObjects.Text;
  
  // 暂停相关
  private isPaused: boolean = false;
  private pauseOverlay!: Phaser.GameObjects.Graphics;
  private pauseMenu!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'GamePlayScene' });
  }
  
  create(): void {
    this.gameManager = GameManager.getInstance();
    this.questionManager = QuestionManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.timerManager = TimerManager.getInstance();
    
    // 重置游戏状态
    this.gameEnded = false;
    this.isAnswering = false;
    this.currentMonsterIndex = 0;
    this.activeMonsters = [];
    this.monsters = [];
    this.answerButtons = [];
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 创建背景
    this.createBackground();
    
    // 创建公主
    this.createPrincess();
    
    // 创建UI
    this.createUI(width, height);
    
    // 创建暂停按钮
    this.createPauseButton(width, height);
    
    // 准备题目和怪物（不限制题目数量）
    this.questionManager.prepareQuestionsForLevel(
      this.gameManager.currentWorld,
      this.gameManager.currentLevel
    );
    
    this.createMonsters();
    this.spawnNextWave();
    
    // 开始计时
    this.timerManager.startTimer();
    
    // 加载第一个题目
    this.loadQuestion();
    
    // 播放背景音乐
    this.audioManager.playMusic('game');
  }
  
  update(time: number, delta: number): void {
    // 如果暂停，不更新游戏逻辑
    if (this.isPaused) return;
    
    // 更新计时器
    this.timerManager.update(delta);
    this.updateTimerDisplay();
    
    // 更新怪物移动
    this.updateMonsters(delta);
    
    // 检查游戏状态（防止重复结算）
    if (this.gameEnded) return;
    
    // 公主死亡 = 失败
    if (!this.princess.isAlive) {
      this.gameEnded = true;
      this.time.delayedCall(500, () => {
        this.onGameOver(false);
      });
    }
  }
  
  /**
   * 创建背景
   */
  private createBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 根据世界显示不同的童话背景
    const world = this.gameManager.currentWorld;
    
    // 童话风格渐变背景
    const bg = this.add.graphics();
    if (world === 1) {
      // 世界1：数字森林 - 柔和的森林氛围
      bg.fillGradientStyle(
        0x87CEEB, 0x87CEEB,  // 天空蓝
        0xA8D8B8, 0x90C8A0,  // 柔和的薄荷绿
        1
      );
    } else if (world === 2) {
      // 世界2：魔法山谷 - 紫色神秘氛围
      bg.fillGradientStyle(
        0x9370DB, 0x9370DB,  // 紫色
        0xBA55D3, 0x8B008B,  // 深紫色
        1
      );
    } else {
      // 世界3：智慧城堡 - 金色辉煌氛围
      bg.fillGradientStyle(
        0xFFD700, 0xFFD700,  // 金色
        0xFF8C00, 0xFF6347,  // 橙红色
        1
      );
    }
    bg.fillRect(0, 0, width, height);
    
    // 添加云朵装饰（童话风格）
    for (let i = 0; i < 5; i++) {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xFFFFFF, 0.3);
      const cloudX = Math.random() * width;
      const cloudY = Math.random() * height * 0.3;
      
      // 绘制云朵（3个圆组成）
      cloud.fillCircle(cloudX, cloudY, 30);
      cloud.fillCircle(cloudX + 25, cloudY, 35);
      cloud.fillCircle(cloudX + 50, cloudY, 30);
      cloud.fillEllipse(cloudX + 25, cloudY + 10, 60, 30);
      
      // 云朵漂浮动画
      this.tweens.add({
        targets: cloud,
        x: '+=50',
        duration: 8000 + Math.random() * 4000,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
    
    // 添加闪烁星星
    for (let i = 0; i < 20; i++) {
      const starX = Math.random() * width;
      const starY = Math.random() * height * 0.4;
      const size = Math.random() * 3 + 2;
      
      // 绘制圆形星星
      const star = this.add.circle(starX, starY, size, 0xFFFFFF, 1);
      
      this.tweens.add({
        targets: star,
        alpha: 0.3,
        scale: 0.8,
        duration: 1500 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    // 战斗区域地面（童话风格草地/地板）
    const ground = this.add.graphics();
    if (world === 1) {
      ground.fillStyle(0x4A9B6A, 0.3);  // 柔和的绿色草地
    } else if (world === 2) {
      ground.fillStyle(0x483D8B, 0.4);  // 紫色魔法地板
    } else {
      ground.fillStyle(0xDAA520, 0.4);  // 金色城堡地板
    }
    ground.fillRect(0, height * 0.88, width, height * 0.2);
  }
  
  /**
   * 创建公主
   */
  private createPrincess(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 获取当前选择的角色ID
    const characterId = DataManager.getInstance().getCurrentCharacter();
    
    // 公主位置：左侧，中间高度
    this.princess = new Princess(
      this,
      width * 0.15,
      height * 0.55,
      characterId // 使用玩家选择的角色
    );
  }
  
  /**
   * 创建初始怪物池（创建50只备用，后续可动态生成）
   */
  private createMonsters(): void {
    const initialMonsters = 50; // 初始创建50只，足够用
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    for (let i = 0; i < initialMonsters; i++) {
      // 随机选择怪物类型（1-8），让怪物外观多样化
      const monsterType = Math.floor(Math.random() * 8) + 1; // 1, 2, 3, 4, 5, 6, 7, 8
      const monsterId = `monster_${monsterType}`; // 转换为配置ID
      
      // 创建时放在屏幕外
      const monster = new Monster(
        this,
        width + 100,
        height * 0.55,
        this.gameManager.currentLevel, // 传入关卡难度
        monsterId // 使用配置ID
      );
      
      monster.sprite.setVisible(false);
      this.monsters.push(monster);
    }
  }
  
  /**
   * 动态添加新怪物
   */
  private addNewMonster(): void {
    // 随机选择怪物类型（1-8），让怪物外观多样化
    const monsterType = Math.floor(Math.random() * 8) + 1; // 1, 2, 3, 4, 5, 6, 7, 8
    const monsterId = `monster_${monsterType}`; // 转换为配置ID
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const monster = new Monster(
      this,
      width + 100,
      height * 0.55,
      this.gameManager.currentLevel, // 传入关卡难度
      monsterId // 使用配置ID
    );
    
    monster.sprite.setVisible(false);
    this.monsters.push(monster);
  }
  
  /**
   * 生成下一波怪物（在公主同一水平线上，从右侧不同距离出现）
   */
  private spawnNextWave(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const spawnCount = Math.min(
      this.monstersPerWave,
      this.monsters.length - this.currentMonsterIndex
    );
    
    // 公主的Y坐标（与公主保持同一水平线）
    const princessY = height * 0.55;
    
    for (let i = 0; i < spawnCount; i++) {
      if (this.currentMonsterIndex < this.monsters.length) {
        const monster = this.monsters[this.currentMonsterIndex];
        
        // 怪物纵向排列（上中下三个位置，增大间距避免重叠）
        const verticalPositions = [
          height * 0.38,  // 上
          height * 0.55,  // 中（和公主同高度）
          height * 0.72   // 下
        ];
        const posIndex = i % 3;
        const baseY = verticalPositions[posIndex];
        const baseX = width - 200;
        
        // 添加随机偏移，避免同质化
        const offsetX = (Math.random() - 0.5) * 60; // X轴随机偏移 ±30像素
        const offsetY = (Math.random() - 0.5) * 40; // Y轴随机偏移 ±20像素
        
        const spawnX = baseX + offsetX;
        const spawnY = baseY + offsetY;
        
        monster.sprite.setPosition(spawnX, spawnY);
        monster.sprite.setVisible(true);
        
        // 生成动画
        monster.sprite.setAlpha(0);
        this.tweens.add({
          targets: monster.sprite,
          alpha: 1,
          duration: 500
        });
        
        this.activeMonsters.push(monster);
        this.currentMonsterIndex++;
      }
    }
    
    this.updateWaveText();
  }
  
  /**
   * 更新怪物
   */
  private updateMonsters(delta: number): void {
    for (const monster of this.activeMonsters) {
      if (!monster.isAlive) continue;
      
      // 移动到公主位置（只需要X坐标，横向移动）
      monster.moveTowards(this.princess.sprite.x);
      
      // 检查是否到达公主位置
      if (monster.hasReachedPrincess(this.princess.sprite.x)) {
        this.onMonsterReachPrincess(monster);
      }
    }
  }
  
  /**
   * 怪物到达公主
   */
  private onMonsterReachPrincess(monster: Monster): void {
    if (!monster.isAlive) return;
    
    // 怪物攻击公主（使用新的攻击方法）
    const didAttack = monster.attackPrincess(() => {
      // 攻击回调：对公主造成伤害
      this.princess.takeDamage(monster.damage);
      this.audioManager.playSFX('wrong');
      
      // 显示伤害提示
      const damageText = this.add.text(
        this.princess.sprite.x,
        this.princess.sprite.y - 50,
        `-${monster.damage}`,
        {
          fontFamily: 'Arial Black',
          fontSize: '32px',
          color: '#FF0000',
          stroke: '#FFFFFF',
          strokeThickness: 4
        }
      );
      damageText.setOrigin(0.5);
      
      this.tweens.add({
        targets: damageText,
        y: damageText.y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => damageText.destroy()
      });
    });
    
    // 注意：怪物攻击后不会立即消失，继续攻击直到被击败
  }
  
  /**
   * 移除怪物
   */
  private removeMonster(monster: Monster): void {
    const index = this.activeMonsters.indexOf(monster);
    if (index > -1) {
      this.activeMonsters.splice(index, 1);
    }
    
    // 如果当前怪物很少，生成新一波
    if (this.activeMonsters.length < 2) {
      // 如果怪物池不足，动态添加新怪物
      if (this.currentMonsterIndex >= this.monsters.length) {
        for (let i = 0; i < 5; i++) {
          this.addNewMonster();
        }
      }
      
      this.time.delayedCall(1000, () => {
        if (this.currentMonsterIndex < this.monsters.length && !this.gameEnded) {
          this.spawnNextWave();
        }
      });
    }
  }
  
  /**
   * 检查所有怪物是否被击败（已移除，现在使用无限怪物模式）
   */
  private areAllMonstersDefeated(): boolean {
    // 无限怪物模式，只有公主死亡才结束
    return false;
  }
  
  /**
   * 创建UI
   */
  private createUI(width: number, height: number): void {
    // 顶部信息栏背景
    const topBar = this.add.graphics();
    topBar.fillStyle(0x000000, 0.5);
    topBar.fillRect(0, 0, width, 60);
    
    // 得分
    this.scoreText = this.add.text(20, 20, '得分: 0', {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '24px',
      color: '#FFD700'
    });
    
    // 进度（隐藏，不再显示）
    this.progressText = this.add.text(width / 2, 20, '', {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '24px',
      color: '#ffffff'
    });
    this.progressText.setOrigin(0.5, 0);
    this.progressText.setVisible(false); // 隐藏题目标题
    
    // 计时器
    this.timerText = this.add.text(width - 20, 20, '', {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '24px',
      color: '#00FF00'
    });
    this.timerText.setOrigin(1, 0);
    
    // 怪物信息（移到顶部中间，原题目标题位置）
    this.waveText = this.add.text(width / 2, 20, '', {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '22px', // 稍微放大
      color: '#FF69B4',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.waveText.setOrigin(0.5, 0);
    
    // 题目区域背景（上移到靠近顶部）
    const questionBg = this.add.graphics();
    questionBg.fillStyle(0x000000, 0.7);
    questionBg.fillRoundedRect(width * 0.25, 60, width * 0.5, 80, 10);
    
    // 题目文字（上移位置）
    this.questionText = this.add.text(width / 2, 100, '', {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '40px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    });
    this.questionText.setOrigin(0.5);
    
    this.updateScore();
    this.updateProgress();
  }
  
  /**
   * 加载题目
   */
  private loadQuestion(): void {
    // 如果游戏已结束，不再加载题目
    if (this.gameEnded) return;
    
    const index = this.gameManager.currentQuestionIndex;
    this.currentQuestion = this.questionManager.getQuestion(index);
    
    if (!this.currentQuestion) {
      console.error('题目加载失败');
      return;
    }
    
    // 显示题目
    this.questionText.setText(this.currentQuestion.questionText);
    
    // 更新进度（显示答题数而不是限制数）
    this.updateProgress();
    
    // 创建答案按钮
    this.createAnswerButtons();
    
    this.isAnswering = true;
  }
  
  /**
   * 创建答案按钮
   */
  private createAnswerButtons(): void {
    // 清除旧按钮
    this.answerButtons.forEach(btn => btn.destroy());
    this.answerButtons = [];
    
    if (!this.currentQuestion) return;
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    if (this.currentQuestion.type === 'comparison') {
      // 比大小题目：3个选项（底部一排）
      const options = ['<', '=', '>'];
      const spacing = 150;
      const startX = width / 2 - spacing;
      
      options.forEach((text, index) => {
        const x = startX + index * spacing;
        const y = height * 0.95; // 压缩到最底部
        const button = this.createAnswerButton(x, y, text, index);
        this.answerButtons.push(button);
      });
    } else {
      // 普通题目：4个选项（底部两排，更紧凑）
      const allAnswers = [
        this.currentQuestion.correctAnswer,
        ...this.currentQuestion.wrongAnswers
      ];
      
      // 随机打乱
      for (let i = allAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
      }
      
      // 横向一排布局（4个按钮，紧凑排列）
      const buttonSpacing = 140; // 按钮间距
      const startX = width / 2 - (buttonSpacing * 1.5); // 居中起始位置
      const buttonY = height * 0.94; // 在战场分割线下方
      
      const positions = [
        { x: startX, y: buttonY },
        { x: startX + buttonSpacing, y: buttonY },
        { x: startX + buttonSpacing * 2, y: buttonY },
        { x: startX + buttonSpacing * 3, y: buttonY }
      ];
      
      allAnswers.forEach((answer, index) => {
        const pos = positions[index];
        const button = this.createAnswerButton(
          pos.x,
          pos.y,
          answer.toString(),
          answer
        );
        this.answerButtons.push(button);
      });
    }
  }
  
  /**
   * 创建答案按钮
   */
  private createAnswerButton(
    x: number,
    y: number,
    text: string,
    value: number
  ): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, text, {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '40px', // 增大字体，更清晰
      color: '#ffffff',
      backgroundColor: '#FF69B4',
      padding: { x: 30, y: 12 }, // 增加内边距，按钮更大
      stroke: '#000000',
      strokeThickness: 3
    });
    
    button.setOrigin(0.5);
    button.setInteractive({ useHandCursor: true });
    
    // 悬停效果
    button.on('pointerover', () => {
      button.setStyle({ backgroundColor: '#FF1493' });
      this.tweens.add({
        targets: button,
        scale: 1.1,
        duration: 100
      });
    });
    
    button.on('pointerout', () => {
      button.setStyle({ backgroundColor: '#FF69B4' });
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 100
      });
    });
    
    // 点击事件
    button.on('pointerdown', () => {
      if (this.isAnswering) {
        this.onAnswerSelected(value);
      }
    });
    
    // 不添加飘动动画，避免影响点击
    
    return button;
  }
  
  /**
   * 选择答案
   */
  private onAnswerSelected(selectedAnswer: number): void {
    if (!this.currentQuestion || !this.isAnswering) return;
    
    this.isAnswering = false;
    
    // 禁用所有按钮
    this.answerButtons.forEach(btn => btn.disableInteractive());
    
    const isCorrect = selectedAnswer === this.currentQuestion.correctAnswer;
    
    if (isCorrect) {
      this.onCorrectAnswer();
    } else {
      this.onWrongAnswer();
    }
  }
  
  /**
   * 答对处理
   */
  private onCorrectAnswer(): void {
    this.audioManager.playSFX('correct');
    
    // 计算伤害（根据难度和角色攻击力加成）
    const baseDamage = 20 + this.gameManager.currentLevel * 10;
    const damage = Math.floor(baseDamage * (this.princess.attackPower / 100));
    
    // 攻击最近的怪物
    const nearestMonster = this.findNearestMonster();
    if (nearestMonster) {
      // 预判怪物位置（考虑怪物移动）
      // 首先估算一个初始飞行时间用于预判（基于平均距离）
      const estimatedFlightTime = 0.85; // 秒（初步估算）
      
      // 怪物向左移动，预测位置 = 当前位置 - 移动距离
      const predictedX = nearestMonster.sprite.x - (nearestMonster.moveSpeed * estimatedFlightTime);
      // 锚点在底部，sprite.y 是脚底，向上偏移到怪物身体中心
      const targetY = nearestMonster.sprite.y - 30; // 向上30像素到怪物身体中心
      
      // 公主发射魔法攻击（瞄准预判位置）
      // playAttackAnimation 会根据距离动态计算飞行时间并返回总时间（毫秒）
      const actualTotalTime = this.princess.playAttackAnimation(
        predictedX,
        targetY,
        damage
      );
      
      // 使用实际计算的总时间延迟造成伤害（更精确）
      this.time.delayedCall(actualTotalTime, () => {
        nearestMonster.takeDamage(damage);
        
        if (!nearestMonster.isAlive) {
          this.removeMonster(nearestMonster);
          this.updateWaveText(); // 更新击败数
        }
      });
    }
    
    // 更新游戏状态
    this.gameManager.onAnswerCorrect();
    
    // 更新得分显示
    this.updateScore();
    
    // 快速切换到下一题（减少等待时间）
    this.time.delayedCall(600, () => {
      if (!this.gameEnded) {
        // 继续下一题（无限答题模式）
        this.loadQuestion();
      }
    });
  }
  
  /**
   * 答错处理
   */
  private onWrongAnswer(): void {
    this.audioManager.playSFX('wrong');
    
    // 显示提示
    const hint = this.gameManager.getRandomHint();
    this.showMessage(hint, 0xFFFF00);
    
    // 更新游戏状态
    this.gameManager.onAnswerWrong();
    
    // 延迟后允许重试
    this.time.delayedCall(1000, () => {
      this.isAnswering = true;
      this.answerButtons.forEach(btn => btn.setInteractive({ useHandCursor: true }));
    });
  }
  
  /**
   * 找到最近的怪物
   */
  private findNearestMonster(): Monster | null {
    let nearest: Monster | null = null;
    let minDistance = Infinity;
    
    for (const monster of this.activeMonsters) {
      if (!monster.isAlive) continue;
      
      const dx = monster.sprite.x - this.princess.sprite.x;
      const dy = monster.sprite.y - this.princess.sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = monster;
      }
    }
    
    return nearest;
  }
  
  /**
   * 显示消息
   */
  private showMessage(text: string, color: number): void {
    const message = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height * 0.3,
      text,
      {
        fontFamily: 'Arial Black, Microsoft YaHei',
        fontSize: '36px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    message.setOrigin(0.5);
    message.setAlpha(0);
    
    this.tweens.add({
      targets: message,
      alpha: 1,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.time.delayedCall(500, () => {
          message.destroy();
        });
      }
    });
  }
  
  /**
   * 更新得分
   */
  private updateScore(): void {
    this.scoreText.setText(`得分: ${this.gameManager.currentScore}`);
  }
  
  /**
   * 更新进度（显示已答题数）
   */
  private updateProgress(): void {
    const answered = this.gameManager.correctAnswers + this.gameManager.wrongAnswers;
    this.progressText.setText(`题目: ${answered + 1}/∞`);
  }
  
  /**
   * 更新波次显示（显示总数和击杀数）
   */
  private updateWaveText(): void {
    // 计算已击败的怪物数（已生成的 - 还活着的）
    const aliveCount = this.activeMonsters.filter(m => m.isAlive).length;
    const defeated = this.currentMonsterIndex - aliveCount;
    const totalMonsters = this.monsters.length; // 怪物总数
    
    // 显示：击杀数/总数 | 场上数量
    this.waveText.setText(`👹 击杀: ${defeated}/${totalMonsters} | 场上: ${aliveCount}`);
  }
  
  /**
   * 更新计时器显示
   */
  private updateTimerDisplay(): void {
    const remaining = this.timerManager.getRemainingTime();
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    
    this.timerText.setText(
      `⏱ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
    
    // 时间不足时变红
    if (remaining < 30) {
      this.timerText.setColor('#FF0000');
    }
    
    // 时间到
    if (remaining <= 0) {
      this.onGameOver(false);
    }
  }
  
  /**
   * 游戏结束
   */
  private onGameOver(victory: boolean): void {
    // 停止计时
    this.timerManager.stopTimer();
    
    // 保存数据
    if (victory) {
      DataManager.getInstance().saveData();
    }
    
    // 跳转到结算场景
    this.scene.start('GameOverScene', {
      victory,
      score: this.gameManager.currentScore,
      stars: victory ? this.gameManager.calculateStars() : 0,
      correct: this.gameManager.correctAnswers,
      total: this.gameManager.correctAnswers + this.gameManager.wrongAnswers
    });
  }
  
  /**
   * 创建暂停按钮
   */
  private createPauseButton(width: number, height: number): void {
    this.pauseButton = this.add.text(width - 20, 30, '⏸ 暂停', {
      fontFamily: 'Arial, Microsoft YaHei',
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#FF6B6B',
      padding: { x: 15, y: 8 }
    });
    this.pauseButton.setOrigin(1, 0.5); // 改为以中心点为锚点，居中对齐
    this.pauseButton.setInteractive({ useHandCursor: true });
    this.pauseButton.setDepth(1000);
    
    this.pauseButton.on('pointerover', () => {
      this.pauseButton.setStyle({ backgroundColor: '#FF5252' });
    });
    
    this.pauseButton.on('pointerout', () => {
      this.pauseButton.setStyle({ backgroundColor: '#FF6B6B' });
    });
    
    this.pauseButton.on('pointerdown', () => {
      this.audioManager.playSFX('click');
      this.togglePause();
    });
  }
  
  /**
   * 切换暂停状态
   */
  private togglePause(): void {
    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }
  
  /**
   * 暂停游戏
   */
  private pauseGame(): void {
    this.isPaused = true;
    this.pauseButton.setText('▶ 继续');
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 创建半透明遮罩
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x000000, 0.7);
    this.pauseOverlay.fillRect(0, 0, width, height);
    this.pauseOverlay.setDepth(2000);
    
    // 创建暂停菜单容器
    this.pauseMenu = this.add.container(width / 2, height / 2);
    this.pauseMenu.setDepth(2001);
    
    // 标题
    const title = this.add.text(0, -150, '游戏暂停', {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);
    
    // 继续按钮（使用ButtonFactory）
    const resumeBtn = ButtonFactory.createButton(this, {
      x: width / 2,
      y: height / 2 - 50,
      width: 220,
      height: 54,
      text: '继续游戏',
      icon: '▶️',
      color: 0x4CAF50,
      callback: () => {
        this.resumeGame();
      }
    });
    resumeBtn.setDepth(2002);
    
    // 重新开始按钮（使用ButtonFactory）
    const restartBtn = ButtonFactory.createButton(this, {
      x: width / 2,
      y: height / 2 + 30,
      width: 220,
      height: 54,
      text: '重新开始',
      icon: '🔄',
      color: 0x4CAF50,
      callback: () => {
        this.audioManager.playSFX('click');
        this.isPaused = false;
        this.scene.restart();
      }
    });
    restartBtn.setDepth(2002);
    
    // 退出按钮（使用ButtonFactory）
    const exitBtn = ButtonFactory.createButton(this, {
      x: width / 2,
      y: height / 2 + 110,
      width: 220,
      height: 54,
      text: '退出关卡',
      icon: '🚪',
      color: 0xe74c3c,
      callback: () => {
        this.audioManager.playSFX('click');
        this.isPaused = false;
        this.timerManager.stopTimer();
        this.scene.start('WorldMapScene');
      }
    });
    exitBtn.setDepth(2002);
    
    this.pauseMenu.add([title]);
  }
  
  /**
   * 恢复游戏
   */
  private resumeGame(): void {
    this.isPaused = false;
    this.pauseButton.setText('⏸ 暂停');
    
    // 销毁暂停菜单
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
    }
    if (this.pauseMenu) {
      this.pauseMenu.destroy();
    }
  }
}
