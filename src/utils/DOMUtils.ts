/**
 * DOM 工具类
 * 用于处理 HTML 元素与 Phaser 画布的坐标转换
 */
export default class DOMUtils {
  /**
   * 获取 Phaser 画布在页面中的实际位置和尺寸
   */
  static getCanvasBounds(): { x: number; y: number; width: number; height: number } {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  /**
   * 将 Phaser 游戏坐标转换为页面坐标
   * @param gameX Phaser 游戏内的 X 坐标
   * @param gameY Phaser 游戏内的 Y 坐标
   * @param gameWidth Phaser 游戏宽度
   * @param gameHeight Phaser 游戏高度
   */
  static gameToScreen(
    gameX: number,
    gameY: number,
    gameWidth: number,
    gameHeight: number
  ): { x: number; y: number } {
    const bounds = this.getCanvasBounds();
    
    // 计算缩放比例
    const scaleX = bounds.width / gameWidth;
    const scaleY = bounds.height / gameHeight;
    
    // 转换为屏幕坐标
    return {
      x: bounds.x + gameX * scaleX,
      y: bounds.y + gameY * scaleY
    };
  }

  /**
   * 将页面坐标转换为 Phaser 游戏坐标
   * @param screenX 页面 X 坐标
   * @param screenY 页面 Y 坐标
   * @param gameWidth Phaser 游戏宽度
   * @param gameHeight Phaser 游戏高度
   */
  static screenToGame(
    screenX: number,
    screenY: number,
    gameWidth: number,
    gameHeight: number
  ): { x: number; y: number } {
    const bounds = this.getCanvasBounds();
    
    // 计算缩放比例
    const scaleX = bounds.width / gameWidth;
    const scaleY = bounds.height / gameHeight;
    
    // 转换为游戏坐标
    return {
      x: (screenX - bounds.x) / scaleX,
      y: (screenY - bounds.y) / scaleY
    };
  }

  /**
   * 创建相对于 Phaser 画布的 HTML 输入框
   * @param gameX Phaser 游戏内的 X 坐标
   * @param gameY Phaser 游戏内的 Y 坐标
   * @param gameWidth Phaser 游戏宽度
   * @param gameHeight Phaser 游戏高度
   * @param width 输入框宽度（像素）
   * @param height 输入框高度（像素）
   */
  static createPositionedInput(
    gameX: number,
    gameY: number,
    gameWidth: number,
    gameHeight: number,
    width: number = 300,
    height: number = 40
  ): HTMLInputElement {
    const input = document.createElement('input');
    const screenPos = this.gameToScreen(gameX, gameY, gameWidth, gameHeight);
    
    input.style.position = 'fixed';
    input.style.left = `${screenPos.x}px`;
    input.style.top = `${screenPos.y}px`;
    input.style.transform = 'translate(-50%, -50%)';
    input.style.width = `${width}px`;
    input.style.height = `${height}px`;
    input.style.zIndex = '99999'; // 确保输入框在最上层
    input.style.pointerEvents = 'auto'; // 确保可以接收鼠标事件
    
    return input;
  }

  /**
   * 更新输入框位置（当窗口大小变化时调用）
   */
  static updateInputPosition(
    input: HTMLInputElement,
    gameX: number,
    gameY: number,
    gameWidth: number,
    gameHeight: number
  ): void {
    const screenPos = this.gameToScreen(gameX, gameY, gameWidth, gameHeight);
    input.style.left = `${screenPos.x}px`;
    input.style.top = `${screenPos.y}px`;
  }
}

