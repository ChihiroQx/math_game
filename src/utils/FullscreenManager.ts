/**
 * 全屏管理器
 * 支持移动端和桌面端的全屏功能
 */
export default class FullscreenManager {
  /**
   * 检测是否支持全屏
   */
  static isSupported(): boolean {
    const doc = document as any;
    return !!(
      doc.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      doc.mozFullScreenEnabled ||
      doc.msFullscreenEnabled ||
      // 移动端支持
      doc.webkitRequestFullscreen ||
      // 微信浏览器
      (window as any).webkit?.messageHandlers
    );
  }

  /**
   * 检测是否处于全屏状态
   */
  static isFullscreen(): boolean {
    const doc = document as any;
    return !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
  }

  /**
   * 进入全屏
   * 注意：移动端必须由用户手势触发（如点击事件）
   */
  static async requestFullscreen(element?: HTMLElement): Promise<boolean> {
    const target = (element || document.documentElement) as any;
    const doc = document as any;

    try {
      // 标准 API
      if (target.requestFullscreen) {
        await target.requestFullscreen();
        return true;
      }
      // WebKit (Safari, Chrome)
      if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen();
        return true;
      }
      // WebKit (移动端)
      if (target.webkitRequestFullScreen) {
        target.webkitRequestFullScreen((Element as any).ALLOW_KEYBOARD_INPUT);
        return true;
      }
      // Mozilla
      if (target.mozRequestFullScreen) {
        target.mozRequestFullScreen();
        return true;
      }
      // IE/Edge
      if (target.msRequestFullscreen) {
        target.msRequestFullscreen();
        return true;
      }
      // 微信浏览器全屏（需要用户手势）
      if ((window as any).WeixinJSBridge) {
        // 微信浏览器可能需要特殊处理
        return false;
      }
    } catch (error) {
      console.warn('进入全屏失败:', error);
      return false;
    }

    return false;
  }

  /**
   * 退出全屏
   */
  static async exitFullscreen(): Promise<boolean> {
    const doc = document as any;

    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
        return true;
      }
      if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
        return true;
      }
      if (doc.webkitCancelFullScreen) {
        doc.webkitCancelFullScreen();
        return true;
      }
      if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
        return true;
      }
      if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
        return true;
      }
    } catch (error) {
      console.warn('退出全屏失败:', error);
      return false;
    }

    return false;
  }

  /**
   * 切换全屏状态
   */
  static async toggleFullscreen(element?: HTMLElement): Promise<boolean> {
    if (this.isFullscreen()) {
      return await this.exitFullscreen();
    } else {
      return await this.requestFullscreen(element);
    }
  }

  /**
   * 监听全屏状态变化
   */
  static onFullscreenChange(callback: (isFullscreen: boolean) => void): () => void {
    const doc = document as any;
    
    const handlers = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ];

    const handler = () => {
      callback(this.isFullscreen());
    };

    handlers.forEach(event => {
      document.addEventListener(event, handler);
    });

    // 返回取消监听的函数
    return () => {
      handlers.forEach(event => {
        document.removeEventListener(event, handler);
      });
    };
  }

  /**
   * 检测是否为移动设备
   */
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * 尝试自动进入全屏（仅桌面端，移动端需要用户手势）
   */
  static async tryAutoFullscreen(element?: HTMLElement): Promise<boolean> {
    // 移动端不支持自动全屏，必须由用户手势触发
    if (this.isMobile()) {
      return false;
    }

    // 桌面端可以尝试自动全屏
    return await this.requestFullscreen(element);
  }
}

