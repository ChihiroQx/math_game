/**
 * 时间管理器
 * 负责游戏时长控制和家长设置的时间限制
 */
export default class TimerManager {
  private static instance: TimerManager;
  
  private playTimeLimit: number = 900; // 15分钟（秒）
  private warningTime: number = 180; // 提前3分钟提醒
  
  private currentPlayTime: number = 0;
  private isTimerActive: boolean = false;
  private hasWarned: boolean = false;
  
  private onTimeUpCallback: (() => void) | null = null;
  private onWarningCallback: (() => void) | null = null;
  
  private constructor() {
    this.loadSettings();
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(): TimerManager {
    if (!TimerManager.instance) {
      TimerManager.instance = new TimerManager();
    }
    return TimerManager.instance;
  }
  
  /**
   * 加载计时器设置
   */
  private loadSettings(): void {
    const savedMinutes = localStorage.getItem('PlayTimeLimit');
    const savedWarningMinutes = localStorage.getItem('WarningTime');
    
    if (savedMinutes) this.playTimeLimit = parseInt(savedMinutes) * 60;
    if (savedWarningMinutes) this.warningTime = parseInt(savedWarningMinutes) * 60;
  }
  
  /**
   * 保存计时器设置
   */
  public saveSettings(minutes: number, warningMinutes: number): void {
    localStorage.setItem('PlayTimeLimit', minutes.toString());
    localStorage.setItem('WarningTime', warningMinutes.toString());
    
    this.playTimeLimit = minutes * 60;
    this.warningTime = warningMinutes * 60;
  }
  
  /**
   * 启动计时器
   */
  public startTimer(): void {
    this.isTimerActive = true;
    this.currentPlayTime = 0;
    this.hasWarned = false;
  }
  
  /**
   * 停止计时器
   */
  public stopTimer(): void {
    this.isTimerActive = false;
  }
  
  /**
   * 获取已用时间（秒）
   */
  public getElapsedTime(): number {
    return Math.floor(this.currentPlayTime);
  }
  
  /**
   * 更新计时器（每帧调用）
   */
  public update(deltaTime: number): void {
    if (!this.isTimerActive) return;
    
    this.currentPlayTime += deltaTime / 1000; // 转换为秒
    
    const remainingTime = this.playTimeLimit - this.currentPlayTime;
    
    // 检查是否需要提醒
    if (!this.hasWarned && remainingTime <= this.warningTime && remainingTime > 0) {
      this.hasWarned = true;
      if (this.onWarningCallback) {
        this.onWarningCallback();
      }
    }
    
    // 检查时间是否用完
    if (this.currentPlayTime >= this.playTimeLimit) {
      this.stopTimer();
      if (this.onTimeUpCallback) {
        this.onTimeUpCallback();
      }
    }
  }
  
  /**
   * 设置时间到的回调
   */
  public setOnTimeUp(callback: () => void): void {
    this.onTimeUpCallback = callback;
  }
  
  /**
   * 设置警告回调
   */
  public setOnWarning(callback: () => void): void {
    this.onWarningCallback = callback;
  }
  
  /**
   * 获取剩余时间（秒）
   */
  public getRemainingTime(): number {
    return Math.max(0, this.playTimeLimit - this.currentPlayTime);
  }
  
  /**
   * 获取剩余时间（格式化字符串）
   */
  public getRemainingTimeString(): string {
    const remaining = this.getRemainingTime();
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * 是否启用时间限制
   */
  public isTimeLimitEnabled(): boolean {
    return localStorage.getItem('TimeLimitEnabled') !== 'false';
  }
  
  /**
   * 设置是否启用时间限制
   */
  public setTimeLimitEnabled(enabled: boolean): void {
    localStorage.setItem('TimeLimitEnabled', enabled.toString());
  }
}
