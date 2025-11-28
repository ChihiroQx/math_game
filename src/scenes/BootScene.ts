import Phaser from 'phaser';

/**
 * 启动场景
 * 负责最基础的初始化
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  
  preload(): void {
    // 这里可以加载一个简单的loading图标
    console.log('BootScene: 初始化...');
  }
  
  create(): void {
    console.log('BootScene: 启动完成');
    // 进入登录场景（登录场景会处理自动登录）
    this.scene.start('LoginScene');
  }
}
