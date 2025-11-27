import Phaser from 'phaser';
import GameManager from '../managers/GameManager';
import QuestionManager, { QuestionData } from '../managers/QuestionManager';
import AudioManager from '../managers/AudioManager';
import DataManager from '../managers/DataManager';
import TimerManager from '../managers/TimerManager';

/**
 * 游戏玩法场景（原始版本 - 备份）
 * 主要的答题游戏场景
 */
export default class GamePlaySceneOriginal extends Phaser.Scene {
  private gameManager!: GameManager;
  private questionManager!: QuestionManager;
  private audioManager!: AudioManager;
  private timerManager!: TimerManager;
  
  private currentQuestion: QuestionData | null = null;
  private answerButtons: Phaser.GameObjects.Text[] = [];
  
  // UI元素
  private questionText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private encouragementText!: Phaser.GameObjects.Text;
  
  constructor() {
    super({ key: 'GamePlaySceneOriginal' });
  }
  
  create(): void {
    this.gameManager = GameManager.getInstance();
    this.questionManager = QuestionManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.timerManager = TimerManager.getInstance();
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 创建背景
    this.createBackground();
    
    // 创建UI
    this.createUI(width, height);
    
    // 准备题目
    this.questionManager.prepareQuestionsForLevel(
      this.gameManager.currentWorld,
      this.gameManager.currentLevel
    );
    
    // 加载第一题
    this.loadQuestion();
    
    // 启动计时器
    if (this.timerManager.isTimeLimitEnabled()) {
      this.timerManager.startTimer();
      this.timerManager.setOnWarning(() => {
        this.showNotification('还有3分钟哦～\n记得保护眼睛！', 3000);
      });
      this.timerManager.setOnTimeUp(() => {
        this.onTimeUp();
      });
    }
  }
  
  update(time: number, delta: number): void {
    // 更新计时器
    this.timerManager.update(delta);
    
    // 更新时间显示
    if (this.timerManager.isTimeLimitEnabled()) {
      this.timerText.setText(`⏱️ ${this.timerManager.getRemainingTimeString()}`);
    }
  }
  
  /**
   * 创建背景
   */
  private createBackground(): void {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0xFFE4E1, 0xFFE4E1, 0xE0FFFF, 0xE0FFFF, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
  }
  
  /**
   * 创建UI
   */
  private createUI(width: number, height: number): void {
    // 顶部状态栏
    this.scoreText = this.add.text(20, 20, `得分: 0`, {
      fontFamily: 'Arial, Microsoft YaHei',
      fontSize: '24px',
      color: '#000000'
    });
    
    this.timerText = this.add.text(width - 20, 20, '⏱️ 15:00', {
      fontFamily: 'Arial, Microsoft YaHei',
      fontSize: '24px',
      color: '#000000'
    });
    this.timerText.setOrigin(1, 0);
    
    // 进度
    this.progressText = this.add.text(width / 2, 30, '题目: 1/10', {
      fontFamily: 'Microsoft YaHei',
      fontSize: '24px',
      color: '#000000'
    });
    this.progressText.setOrigin(0.5, 0);
    
    // 题目文本
    this.questionText = this.add.text(width / 2, height * 0.25, '', {
      fontFamily: 'Arial, Microsoft YaHei',
      fontSize: '64px',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 4
    });
    this.questionText.setOrigin(0.5);
    
    // 鼓励文字（初始隐藏）
    this.encouragementText = this.add.text(width / 2, height * 0.4, '', {
      fontFamily: 'Microsoft YaHei',
      fontSize: '48px',
      color: '#FF69B4',
      stroke: '#ffffff',
      strokeThickness: 4
    });
    this.encouragementText.setOrigin(0.5);
    this.encouragementText.setVisible(false);
    
    // 暂停按钮
    this.createPauseButton();
  }
  
  /**
   * 创建暂停按钮
   */
  private createPauseButton(): void {
    const pauseBtn = this.add.text(20, 60, '⏸️ 暂停', {
      fontFamily: 'Microsoft YaHei',
      fontSize: '20px',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    });
    pauseBtn.setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => {
      this.scene.pause();
      // TODO: 显示暂停菜单
    });
  }
  
  /**
   * 加载题目
   */
  private loadQuestion(): void {
    const index = this.gameManager.currentQuestionIndex;
    this.currentQuestion = this.questionManager.getQuestion(index);
    
    if (!this.currentQuestion) {
      console.error('题目加载失败');
      return;
    }
    
    // 显示题目
    this.questionText.setText(this.currentQuestion.questionText);
    
    // 更新进度
    this.updateProgress();
    
    // 创建答案按钮
    this.createAnswerButtons();
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
      // 比大小：3个选项
      const symbols = ['<', '=', '>'];
      const spacing = 180;
      const startX = width / 2 - spacing;
      
      for (let i = 0; i < 3; i++) {
        const button = this.createAnswerButton(
          startX + i * spacing,
          height * 0.6,
          symbols[i],
          i
        );
        this.answerButtons.push(button);
      }
    } else {
      // 选择题：4个选项
      const allAnswers = [
        this.currentQuestion.correctAnswer,
        ...this.currentQuestion.wrongAnswers
      ];
      
      // 打乱答案顺序
      this.shuffleArray(allAnswers);
      
      const spacing = 200;
      const startX = width / 2 - 1.5 * spacing;
      
      for (let i = 0; i < 4; i++) {
        const button = this.createAnswerButton(
          startX + i * spacing,
          height * 0.65,
          allAnswers[i].toString(),
          allAnswers[i]
        );
        this.answerButtons.push(button);
      }
    }
  }
  
  /**
   * 创建答案按钮（使用Text对象，最稳定）
   */
  private createAnswerButton(
    x: number,
    y: number,
    text: string,
    value: number
  ): Phaser.GameObjects.Text {
    // 使用Text对象作为按钮（最简单可靠）
    const button = this.add.text(x, y, text, {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '56px',
      color: '#ffffff',
      backgroundColor: '#FF69B4',
      padding: { x: 40, y: 50 },
      stroke: '#000000',
      strokeThickness: 4
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
      this.onAnswerSelected(value);
    });
    
    // 添加飘动动画
    this.tweens.add({
      targets: button,
      y: y + 10,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return button;
  }
  
  /**
   * 选择答案
   */
  private onAnswerSelected(selectedAnswer: number): void {
    if (!this.currentQuestion) return;
    
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
    
    // 显示鼓励文字
    const encouragement = this.gameManager.getRandomEncouragement();
    this.showEncouragement(encouragement);
    
    // 更新游戏状态
    const isLevelComplete = this.gameManager.onAnswerCorrect();
    
    // 更新得分显示
    this.updateScore();
    
    // 延迟后继续
    this.time.delayedCall(1500, () => {
      if (isLevelComplete) {
        this.onLevelComplete();
      } else {
        this.loadQuestion();
      }
    });
  }
  
  /**
   * 答错处理
   */
  private onWrongAnswer(): void {
    this.audioManager.playSFX('wrong');
    
    // 显示提示文字
    const hint = this.gameManager.getRandomHint();
    this.showEncouragement(hint);
    
    // 更新游戏状态
    this.gameManager.onAnswerWrong();
    
    // 延迟后允许重试
    this.time.delayedCall(1000, () => {
      this.answerButtons.forEach(btn => btn.setInteractive({ useHandCursor: true }));
      this.encouragementText.setVisible(false);
    });
  }
  
  /**
   * 显示鼓励文字
   */
  private showEncouragement(text: string): void {
    this.encouragementText.setText(text);
    this.encouragementText.setVisible(true);
    this.encouragementText.setAlpha(0);
    
    this.tweens.add({
      targets: this.encouragementText,
      alpha: 1,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      repeat: 2
    });
  }
  
  /**
   * 更新得分
   */
  private updateScore(): void {
    this.scoreText.setText(`得分: ${this.gameManager.currentScore}`);
  }
  
  /**
   * 更新进度
   */
  private updateProgress(): void {
    const current = this.gameManager.currentQuestionIndex + 1;
    const total = this.gameManager.totalQuestions;
    this.progressText.setText(`题目: ${current}/${total}`);
  }
  
  /**
   * 关卡完成
   */
  private onLevelComplete(): void {
    this.timerManager.stopTimer();
    
    const stars = this.gameManager.calculateStars();
    const score = this.gameManager.currentScore;
    
    // 保存进度
    DataManager.getInstance().saveLevelProgress(
      this.gameManager.currentWorld,
      this.gameManager.currentLevel,
      stars,
      score
    );
    
    // 奖励金币
    DataManager.getInstance().addCoins(score);
    
    // 进入结算场景
    this.scene.start('GameOverScene', {
      stars,
      score,
      correct: this.gameManager.correctAnswers,
      total: this.gameManager.totalQuestions
    });
  }
  
  /**
   * 时间到
   */
  private onTimeUp(): void {
    this.showNotification('今天玩得真棒！\n让眼睛休息一下吧～', 3000);
    
    this.time.delayedCall(3000, () => {
      this.scene.start('MainMenuScene');
    });
  }
  
  /**
   * 显示通知
   */
  private showNotification(text: string, duration: number): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const notification = this.add.text(width / 2, height / 2, text, {
      fontFamily: 'Microsoft YaHei',
      fontSize: '36px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 30, y: 20 },
      align: 'center'
    });
    notification.setOrigin(0.5);
    notification.setAlpha(0);
    
    this.tweens.add({
      targets: notification,
      alpha: 1,
      duration: 300
    });
    
    this.time.delayedCall(duration, () => {
      this.tweens.add({
        targets: notification,
        alpha: 0,
        duration: 300,
        onComplete: () => notification.destroy()
      });
    });
  }
  
  /**
   * 打乱数组
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

