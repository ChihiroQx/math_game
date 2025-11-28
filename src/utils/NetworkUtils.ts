/**
 * 网络工具类
 * 用于检测网络状态和处理网络错误
 */

export default class NetworkUtils {
  /**
   * 检测网络是否可用
   */
  public static isOnline(): boolean {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true; // 默认假设在线（服务器端渲染等情况）
  }

  /**
   * 检测是否为网络错误
   */
  public static isNetworkError(error: any): boolean {
    if (!error) return false;
    
    // 检查错误类型
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }
    
    // 检查错误消息
    const errorMessage = error.message?.toLowerCase() || '';
    const networkErrorKeywords = [
      'network',
      'failed to fetch',
      'networkerror',
      'network request failed',
      'connection',
      'timeout',
      'offline',
      'no internet'
    ];
    
    return networkErrorKeywords.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * 检测响应是否为网络错误
   */
  public static isNetworkResponseError(response: Response | null): boolean {
    if (!response) return true;
    
    // 状态码 0 通常表示网络错误（CORS、网络断开等）
    if (response.status === 0) {
      return true;
    }
    
    // 其他网络相关错误状态码
    return false;
  }

  /**
   * 执行带网络检测的 fetch 请求
   * @param url 请求URL
   * @param options fetch选项
   * @param timeout 超时时间（毫秒），默认10秒
   * @returns Promise<Response>
   */
  public static async fetchWithNetworkCheck(
    url: string,
    options: RequestInit = {},
    timeout: number = 10000
  ): Promise<Response> {
    // 检查网络状态
    if (!this.isOnline()) {
      throw new Error('网络不可用，请检查网络连接');
    }

    // 创建超时控制器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // 合并信号
      const signal = options.signal 
        ? this.mergeSignals([options.signal, controller.signal])
        : controller.signal;

      const response = await fetch(url, {
        ...options,
        signal
      });

      clearTimeout(timeoutId);

      // 检查响应
      if (this.isNetworkResponseError(response)) {
        throw new Error('网络请求失败，请检查网络连接');
      }

      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // 如果是网络错误，提供更友好的错误信息
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接');
      }
      
      if (this.isNetworkError(error)) {
        throw new Error('网络连接失败，请检查网络设置');
      }
      
      // 其他错误直接抛出
      throw error;
    }
  }

  /**
   * 合并多个 AbortSignal
   */
  private static mergeSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    
    signals.forEach(signal => {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', () => controller.abort());
      }
    });
    
    return controller.signal;
  }

  /**
   * 显示网络错误提示（在控制台）
   */
  public static logNetworkError(context: string, error: any): void {
    console.error(`❌ [${context}] 网络错误:`, error);
    
    if (!this.isOnline()) {
      console.warn('⚠️ 当前设备处于离线状态');
    }
  }

  /**
   * 获取友好的网络错误消息
   */
  public static getNetworkErrorMessage(error: any): string {
    if (!this.isOnline()) {
      return '网络不可用，请检查网络连接';
    }
    
    if (this.isNetworkError(error)) {
      return '网络连接失败，请稍后重试';
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return '网络请求失败，请检查网络连接';
  }
}

