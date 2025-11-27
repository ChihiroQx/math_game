/**
 * 游戏管理器
 * 负责游戏状态、流程控制
 */
export default class GameManager {
  private static instance: GameManager;
  
  // 游戏状态
  public isPlaying: boolean = false;
  public isPaused: boolean = false;
  
  // 当前关卡信息
  public currentWorld: number = 1;
  public currentLevel: number = 1;
  public currentQuestionIndex: number = 0;
  public totalQuestions: number = 10;
  
  // 当前局得分
  public currentScore: number = 0;
  public correctAnswers: number = 0;
  public wrongAnswers: number = 0;
  public comboCount: number = 0;
  
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }
  
  /**
   * 开始游戏
   */
  public startGame(world: number, level: number): void {
    this.currentWorld = world;
    this.currentLevel = level;
    this.resetGameStats();
    this.isPlaying = true;
  }
  
  /**
   * 重置游戏统计数据
   */
  public resetGameStats(): void {
    this.currentScore = 0;
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.currentQuestionIndex = 0;
    this.comboCount = 0;
  }
  
  /**
   * 回答正确
   */
  public onAnswerCorrect(): boolean {
    this.correctAnswers++;
    this.comboCount++;
    
    // 计算得分（连击有加成）
    const baseScore = 10;
    const comboBonus = this.comboCount > 3 ? (this.comboCount - 3) * 5 : 0;
    const earnedScore = baseScore + comboBonus;
    
    this.currentScore += earnedScore;
    
    // 检查是否完成关卡
    this.currentQuestionIndex++;
    
    return this.currentQuestionIndex >= this.totalQuestions;
  }
  
  /**
   * 回答错误
   */
  public onAnswerWrong(): void {
    this.wrongAnswers++;
    this.comboCount = 0; // 重置连击
  }
  
  /**
   * 计算星级（1-3星）
   */
  public calculateStars(): number {
    const accuracy = this.correctAnswers / this.totalQuestions;
    
    if (accuracy >= 0.95) return 3; // 完美
    if (accuracy >= 0.80) return 2; // 良好
    if (accuracy >= 0.60) return 1; // 及格
    return 0; // 未完成
  }
  
  /**
   * 暂停游戏
   */
  public pauseGame(): void {
    this.isPaused = true;
  }
  
  /**
   * 继续游戏
   */
  public resumeGame(): void {
    this.isPaused = false;
  }
  
  /**
   * 获取随机鼓励语
   */
  public getRandomEncouragement(): string {
    const encouragements = [
      '太棒了！',
      '真聪明！',
      '你是天才！',
      '继续加油！',
      '完美！',
      '厉害！',
      '真了不起！',
      '你做到了！'
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }
  
  /**
   * 获取随机提示语
   */
  public getRandomHint(): string {
    const hints = [
      '再想想看～',
      '差一点点啦！',
      '加油！',
      '别着急，慢慢想～',
      '你可以的！'
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  }
}
