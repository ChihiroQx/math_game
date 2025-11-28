import { getSpecialQuestionTypeProbability } from '../config/GameConfig';

/**
 * 题目数据接口
 */
export interface QuestionData {
  id: number;
  type: string;
  difficulty: number;
  questionText: string;
  num1: number;
  num2: number;
  correctAnswer: number;
  wrongAnswers: number[];
  isSpecial?: boolean; // 是否为特殊题（完成时对所有怪物造成伤害）
}

/**
 * 题库接口
 */
interface QuestionBank {
  questions: QuestionData[];
}

/**
 * 题目管理器
 * 负责题目的加载、生成和管理
 */
export default class QuestionManager {
  private static instance: QuestionManager;
  private questionBank: QuestionBank | null = null;
  private currentLevelQuestions: QuestionData[] = [];
  
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): QuestionManager {
    if (!QuestionManager.instance) {
      QuestionManager.instance = new QuestionManager();
    }
    return QuestionManager.instance;
  }
  
  /**
   * 加载题库
   */
  public async loadQuestionBank(): Promise<void> {
    try {
      const response = await fetch('assets/data/QuestionBank.json');
      this.questionBank = await response.json();
      console.log(`题库加载完成，共 ${this.questionBank?.questions.length} 道题目`);
    } catch (error) {
      console.error('题库加载失败', error);
      // 使用默认题库
      this.questionBank = { questions: [] };
    }
  }
  
  /**
   * 为指定关卡准备题目
   */
  public prepareQuestionsForLevel(world: number, level: number): void {
    if (!this.questionBank) {
      console.error('题库未加载');
      return;
    }
    
    this.currentLevelQuestions = [];
    
    const questionType = this.getQuestionTypeForLevel(world, level);
    const difficulty = this.getDifficultyForLevel(world, level);
    
    // 筛选符合条件的题目
    let filteredQuestions = this.questionBank.questions.filter(
      q => q.type === questionType && q.difficulty === difficulty
    );
    
    // 如果题目不足，动态生成
    if (filteredQuestions.length < 10) {
      console.log('题目不足，动态生成...');
      const needed = 10 - filteredQuestions.length;
      for (let i = 0; i < needed; i++) {
        filteredQuestions.push(this.generateQuestion(questionType, difficulty));
      }
    }
    
    // 随机选择10道题
    const selectedQuestions: QuestionData[] = [];
    const usedIndices = new Set<number>();
    
    while (selectedQuestions.length < Math.min(10, filteredQuestions.length)) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        selectedQuestions.push(filteredQuestions[randomIndex]);
      }
    }
    
    // 打乱题目顺序
    this.currentLevelQuestions = this.shuffleArray(selectedQuestions);
    
    console.log(`为关卡 ${world}-${level} 准备了 ${this.currentLevelQuestions.length} 道题目`);
  }
  
  /**
   * 获取当前题目（支持无限答题）
   */
  public getQuestion(index: number): QuestionData | null {
    // 如果索引在范围内，直接返回
    if (index >= 0 && index < this.currentLevelQuestions.length) {
      return this.currentLevelQuestions[index];
    }
    
    // 如果索引超出范围，动态生成新题目
    if (index >= this.currentLevelQuestions.length && this.currentLevelQuestions.length > 0) {
      console.log(`索引 ${index} 超出范围，动态生成新题目...`);
      
      // 从第一题获取题型和难度信息
      const firstQuestion = this.currentLevelQuestions[0];
      const newQuestion = this.generateQuestion(firstQuestion.type, firstQuestion.difficulty);
      
      // 添加到题库中
      this.currentLevelQuestions.push(newQuestion);
      
      console.log(`新题目已生成: ${newQuestion.questionText}`);
      return newQuestion;
    }
    
    return null;
  }
  
  /**
   * 根据关卡确定题型（公开方法，供外部调用）
   */
  public getQuestionTypeForLevel(world: number, level: number): string {
    switch (world) {
      case 1: // 世界1：数字森林（加减法）
        if (level <= 2) return level === 1 ? 'addition' : 'subtraction';
        if (level <= 4) return level === 3 ? 'addition' : 'subtraction';
        return 'addition'; // 第5关混合（暂时用加法）
      
      case 2: // 世界2：魔法山谷（乘除法）
        if (level <= 2) return 'multiplication';
        if (level === 3) return 'division';
        return 'multiplication';
      
      case 3: // 世界3：智慧城堡（综合）
        if (level === 1) return 'comparison';
        return 'comparison';
      
      default:
        return 'addition';
    }
  }
  
  /**
   * 根据关卡确定难度（公开方法，供外部调用）
   */
  public getDifficultyForLevel(world: number, level: number): number {
    switch (world) {
      case 1:
        return level <= 2 ? 1 : 2; // 10以内 vs 20以内
      case 2:
        return level <= 2 ? 3 : 4;
      case 3:
        return level === 1 ? 4 : 5;
      default:
        return 1;
    }
  }
  
  /**
   * 生成特殊题（更高难度或混合运算）
   * @param currentType 当前题型
   * @param currentDifficulty 当前难度
   * @returns 特殊题
   */
  public generateSpecialQuestion(currentType: string, currentDifficulty: number): QuestionData {
    // 根据配置的概率选择：更高难度或混合运算
    const useHigherDifficulty = Math.random() < getSpecialQuestionTypeProbability();
    
    if (useHigherDifficulty) {
      // 生成更高难度的题目（难度+1）
      const higherDifficulty = Math.min(currentDifficulty + 1, 5);
      console.log(`🎯 特殊题：更高难度 (${currentDifficulty} → ${higherDifficulty})`);
      return this.generateQuestion(currentType, higherDifficulty);
    } else {
      // 生成混合运算题
      console.log(`🎯 特殊题：混合运算 (难度 ${currentDifficulty})`);
      return this.generateMixedOperationQuestion(currentType, currentDifficulty);
    }
  }
  
  /**
   * 生成混合运算题
   */
  private generateMixedOperationQuestion(baseType: string, difficulty: number): QuestionData {
    const question: QuestionData = {
      id: Date.now() + Math.random(),
      type: baseType, // 保持原类型，但实际是混合运算
      difficulty,
      questionText: '',
      num1: 0,
      num2: 0,
      correctAnswer: 0,
      wrongAnswers: [],
      isSpecial: true
    };
    
    // 根据基础类型决定混合运算类型
    if (baseType === 'addition' || baseType === 'subtraction') {
      // 加减混合：a + b - c = ?
      this.generateAdditionSubtractionMixed(question, difficulty);
    } else if (baseType === 'multiplication' || baseType === 'division') {
      // 乘除混合：a × b ÷ c = ?
      this.generateMultiplicationDivisionMixed(question, difficulty);
    } else {
      // 其他类型，生成更高难度的同类型题
      return this.generateQuestion(baseType, Math.min(difficulty + 1, 5));
    }
    
    return question;
  }
  
  /**
   * 生成加减混合运算题
   */
  private generateAdditionSubtractionMixed(question: QuestionData, difficulty: number): void {
    const maxNumber = difficulty === 1 ? 10 : 20;
    
    // 生成 a + b - c 的形式
    const a = Math.floor(Math.random() * (maxNumber - 5)) + 1;
    const b = Math.floor(Math.random() * (maxNumber - a - 2)) + 1;
    const temp = a + b; // 中间结果
    const c = Math.floor(Math.random() * Math.min(temp - 1, maxNumber - 1)) + 1;
    
    question.num1 = a;
    question.num2 = b;
    question.correctAnswer = temp - c;
    question.questionText = `${a} + ${b} - ${c} = ?`;
    
    // 生成错误答案
    question.wrongAnswers = this.generateWrongAnswers(question.correctAnswer, 3, maxNumber * 2);
  }
  
  /**
   * 生成乘除混合运算题
   */
  private generateMultiplicationDivisionMixed(question: QuestionData, difficulty: number): void {
    // 生成 a × b ÷ c 的形式
    const c = Math.floor(Math.random() * 4) + 2; // 除数 2-5
    const quotient = Math.floor(Math.random() * 5) + 2; // 商 2-6
    const product = c * quotient; // a × b 的结果
    
    // 将 product 分解为两个因数
    const factors = this.getFactors(product);
    if (factors.length >= 2) {
      const randomIndex = Math.floor(Math.random() * factors.length);
      question.num1 = factors[randomIndex];
      question.num2 = product / factors[randomIndex];
    } else {
      question.num1 = 2;
      question.num2 = product / 2;
    }
    
    question.correctAnswer = quotient;
    question.questionText = `${question.num1} × ${question.num2} ÷ ${c} = ?`;
    
    // 生成错误答案
    question.wrongAnswers = this.generateWrongAnswers(question.correctAnswer, 3, 20);
  }
  
  /**
   * 获取一个数的所有因数
   */
  private getFactors(num: number): number[] {
    const factors: number[] = [];
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        factors.push(i);
        if (i !== num / i) {
          factors.push(num / i);
        }
      }
    }
    return factors.length > 0 ? factors : [2, num / 2];
  }
  
  /**
   * 动态生成题目
   */
  private generateQuestion(type: string, difficulty: number): QuestionData {
    const question: QuestionData = {
      id: Date.now() + Math.random(),
      type,
      difficulty,
      questionText: '',
      num1: 0,
      num2: 0,
      correctAnswer: 0,
      wrongAnswers: []
    };
    
    switch (type) {
      case 'addition':
        this.generateAdditionQuestion(question, difficulty);
        break;
      case 'subtraction':
        this.generateSubtractionQuestion(question, difficulty);
        break;
      case 'multiplication':
        this.generateMultiplicationQuestion(question, difficulty);
        break;
      case 'division':
        this.generateDivisionQuestion(question, difficulty);
        break;
      case 'comparison':
        this.generateComparisonQuestion(question, difficulty);
        break;
    }
    
    return question;
  }
  
  /**
   * 生成加法题
   */
  private generateAdditionQuestion(question: QuestionData, difficulty: number): void {
    const maxNumber = difficulty === 1 ? 10 : 20;
    question.num1 = Math.floor(Math.random() * maxNumber) + 1;
    question.num2 = Math.floor(Math.random() * (maxNumber - question.num1)) + 1;
    question.correctAnswer = question.num1 + question.num2;
    question.questionText = `${question.num1} + ${question.num2} = ?`;
    question.wrongAnswers = this.generateWrongAnswers(question.correctAnswer, 3, maxNumber);
  }
  
  /**
   * 生成减法题
   */
  private generateSubtractionQuestion(question: QuestionData, difficulty: number): void {
    const maxNumber = difficulty === 1 ? 10 : 20;
    question.num1 = Math.floor(Math.random() * maxNumber) + 1;
    question.num2 = Math.floor(Math.random() * question.num1) + 1;
    question.correctAnswer = question.num1 - question.num2;
    question.questionText = `${question.num1} - ${question.num2} = ?`;
    question.wrongAnswers = this.generateWrongAnswers(question.correctAnswer, 3, maxNumber);
  }
  
  /**
   * 生成乘法题
   */
  private generateMultiplicationQuestion(question: QuestionData, difficulty: number): void {
    const maxFactor = difficulty === 3 ? 5 : 9;
    question.num1 = Math.floor(Math.random() * (maxFactor - 1)) + 2;
    question.num2 = Math.floor(Math.random() * (maxFactor - 1)) + 2;
    question.correctAnswer = question.num1 * question.num2;
    question.questionText = `${question.num1} × ${question.num2} = ?`;
    question.wrongAnswers = this.generateWrongAnswers(question.correctAnswer, 3, 100);
  }
  
  /**
   * 生成除法题
   */
  private generateDivisionQuestion(question: QuestionData, difficulty: number): void {
    question.num2 = Math.floor(Math.random() * 8) + 2;
    const quotient = Math.floor(Math.random() * 8) + 2;
    question.num1 = question.num2 * quotient;
    question.correctAnswer = quotient;
    question.questionText = `${question.num1} ÷ ${question.num2} = ?`;
    question.wrongAnswers = this.generateWrongAnswers(question.correctAnswer, 3, 20);
  }
  
  /**
   * 生成比大小题目
   */
  private generateComparisonQuestion(question: QuestionData, difficulty: number): void {
    question.num1 = Math.floor(Math.random() * 50) + 1;
    question.num2 = Math.floor(Math.random() * 50) + 1;
    question.questionText = `${question.num1} __ ${question.num2}`;
    
    if (question.num1 < question.num2) question.correctAnswer = 0; // <
    else if (question.num1 === question.num2) question.correctAnswer = 1; // =
    else question.correctAnswer = 2; // >
    
    question.wrongAnswers = [];
  }
  
  /**
   * 生成错误答案
   */
  private generateWrongAnswers(correctAnswer: number, count: number, maxRange: number): number[] {
    const wrongAnswers: number[] = [];
    const used = new Set<number>([correctAnswer]);
    
    let attempts = 0;
    while (wrongAnswers.length < count && attempts < 50) {
      const offset = Math.floor(Math.random() * 5) + 1;
      const wrongAnswer = Math.random() > 0.5 ? correctAnswer + offset : correctAnswer - offset;
      
      if (wrongAnswer > 0 && wrongAnswer <= maxRange && !used.has(wrongAnswer)) {
        wrongAnswers.push(wrongAnswer);
        used.add(wrongAnswer);
      }
      attempts++;
    }
    
    return wrongAnswers;
  }
  
  /**
   * 打乱数组
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
