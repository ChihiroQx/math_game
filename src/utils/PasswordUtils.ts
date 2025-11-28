/**
 * 密码工具类
 * 用于密码哈希和验证
 */

export default class PasswordUtils {
  /**
   * 使用 SHA-256 哈希密码
   * 注意：SHA-256 不是专门为密码设计的，但对于这个场景来说比明文好
   * 生产环境应该使用 Supabase Auth 或后端 bcrypt
   */
  public static async hashPassword(password: string): Promise<string> {
    try {
      // 检查是否支持 Web Crypto API
      if (!crypto || !crypto.subtle) {
        console.warn('⚠️ Web Crypto API 不可用，使用降级哈希方案');
        return this.simpleHash(password);
      }
      
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('❌ 密码哈希失败:', error);
      // 如果 Web Crypto API 不可用，返回简单哈希（不推荐，但作为降级方案）
      console.warn('⚠️ 使用降级哈希方案');
      return this.simpleHash(password);
    }
  }

  /**
   * 验证密码
   */
  public static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * 简单哈希（降级方案，不推荐用于生产环境）
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 验证密码强度
   */
  public static validatePasswordStrength(password: string): { valid: boolean; message: string } {
    if (password.length < 4) {
      return { valid: false, message: '密码至少需要4个字符' };
    }
    if (password.length > 50) {
      return { valid: false, message: '密码不能超过50个字符' };
    }
    return { valid: true, message: '' };
  }
}

