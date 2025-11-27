/**
 * 音频管理器
 * 负责背景音乐和音效的播放
 */
export default class AudioManager {
  private static instance: AudioManager;
  private scene: Phaser.Scene | null = null;
  
  private musicVolume: number = 0.7;
  private sfxVolume: number = 1.0;
  
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  
  private constructor() {
    this.loadSettings();
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }
  
  /**
   * 设置场景
   */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }
  
  /**
   * 加载音频设置
   */
  private loadSettings(): void {
    const savedMusicVolume = localStorage.getItem('MusicVolume');
    const savedSFXVolume = localStorage.getItem('SFXVolume');
    
    if (savedMusicVolume) this.musicVolume = parseFloat(savedMusicVolume);
    if (savedSFXVolume) this.sfxVolume = parseFloat(savedSFXVolume);
  }
  
  /**
   * 保存音频设置
   */
  private saveSettings(): void {
    localStorage.setItem('MusicVolume', this.musicVolume.toString());
    localStorage.setItem('SFXVolume', this.sfxVolume.toString());
  }
  
  /**
   * 播放背景音乐
   */
  public playMusic(key: string, loop: boolean = true): void {
    if (!this.scene) return;
    
    // 停止当前音乐
    if (this.currentMusic) {
      this.currentMusic.stop();
    }
    
    try {
      this.currentMusic = this.scene.sound.add(key, {
        loop,
        volume: this.musicVolume
      });
      this.currentMusic.play();
    } catch (error) {
      console.warn(`音乐 ${key} 播放失败`, error);
    }
  }
  
  /**
   * 停止背景音乐
   */
  public stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }
  
  /**
   * 播放音效
   */
  public playSFX(key: string): void {
    if (!this.scene) return;
    
    try {
      this.scene.sound.play(key, {
        volume: this.sfxVolume
      });
    } catch (error) {
      console.warn(`音效 ${key} 播放失败`, error);
    }
  }
  
  /**
   * 设置音乐音量
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.currentMusic && 'setVolume' in this.currentMusic) {
      (this.currentMusic as any).setVolume(this.musicVolume);
    }
    this.saveSettings();
  }
  
  /**
   * 设置音效音量
   */
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.saveSettings();
  }
  
  /**
   * 获取音乐音量
   */
  public getMusicVolume(): number {
    return this.musicVolume;
  }
  
  /**
   * 获取音效音量
   */
  public getSFXVolume(): number {
    return this.sfxVolume;
  }
  
  /**
   * 静音/取消静音
   */
  public toggleMute(): void {
    if (this.scene) {
      this.scene.sound.mute = !this.scene.sound.mute;
    }
  }
}
