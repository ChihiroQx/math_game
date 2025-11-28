/**
 * 账号管理器
 * 负责用户登录、注册和数据同步
 */

import { SUPABASE_CONFIG, getSupabaseHeaders } from '../config/SupabaseConfig';
import NetworkUtils from '../utils/NetworkUtils';
import DataManager, { PlayerData } from './DataManager';

export interface UserAccount {
  id?: number;
  username: string;
  password_hash?: string; // 密码（明文存储，可选）
  player_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserGameData {
  id?: number;
  user_id: number;
  coins: number;
  total_stars: number;
  level_progress: string; // JSON字符串
  owned_characters: string; // JSON字符串
  current_character: string;
  updated_at?: string;
}

export class AccountManager {
  private static instance: AccountManager;
  private currentUserId: number | null = null;
  private currentUsername: string | null = null;
  private isOfflineMode: boolean = false;

  private constructor() {
    // 从 localStorage 读取登录状态
    const savedUserId = localStorage.getItem('user_id');
    const savedUsername = localStorage.getItem('username');
    if (savedUserId && savedUsername) {
      this.currentUserId = parseInt(savedUserId);
      this.currentUsername = savedUsername;
    }
    
    // 检查网络状态
    this.isOfflineMode = !NetworkUtils.isOnline() || !AccountManager.isConfigured();
  }

  public static getInstance(): AccountManager {
    if (!AccountManager.instance) {
      AccountManager.instance = new AccountManager();
    }
    return AccountManager.instance;
  }

  /**
   * 检查是否已配置 Supabase
   */
  public static isConfigured(): boolean {
    return SUPABASE_CONFIG.url !== 'YOUR_PROJECT_URL' &&
           SUPABASE_CONFIG.anonKey !== 'YOUR_ANON_KEY';
  }

  /**
   * 检查是否处于离线模式
   */
  public isOffline(): boolean {
    return this.isOfflineMode;
  }

  /**
   * 检查是否已登录
   */
  public isLoggedIn(): boolean {
    return this.currentUserId !== null && this.currentUsername !== null;
  }

  /**
   * 获取当前用户ID
   */
  public getCurrentUserId(): number | null {
    return this.currentUserId;
  }

  /**
   * 获取当前用户名
   */
  public getCurrentUsername(): string | null {
    return this.currentUsername;
  }

  /**
   * 注册新账号
   */
  public async register(username: string, password: string, playerName: string): Promise<{ success: boolean; message: string; userId?: number }> {
    if (this.isOffline()) {
      return { success: false, message: '网络不可用，无法注册账号' };
    }

    try {
      // 检查用户名是否已存在
      const checkUrl = `${SUPABASE_CONFIG.url}/rest/v1/user_accounts?username=eq.${encodeURIComponent(username)}&select=id`;
      const checkResponse = await NetworkUtils.fetchWithNetworkCheck(checkUrl, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });

      if (checkResponse.ok) {
        const existing = await checkResponse.json();
        if (existing && existing.length > 0) {
          return { success: false, message: '用户名已存在，请换一个' };
        }
      }

      // 直接存储明文密码（如果密码为空，则存储空字符串）
      const passwordToStore = password || '';

      // 创建新账号（保存明文密码）
      const account: UserAccount = {
        username,
        password_hash: passwordToStore,
        player_name: playerName
      };

      const response = await NetworkUtils.fetchWithNetworkCheck(
        `${SUPABASE_CONFIG.url}/rest/v1/user_accounts`,
        {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify(account)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('注册失败:', response.status, errorText);
        return { success: false, message: '注册失败，请稍后重试' };
      }

      const data = await response.json();
      const userId = data[0]?.id;

      if (userId) {
        // 创建初始游戏数据
        await this.createInitialGameData(userId, playerName);
        
        // 保存登录状态
        this.currentUserId = userId;
        this.currentUsername = username;
        localStorage.setItem('user_id', userId.toString());
        localStorage.setItem('username', username);
        
        return { success: true, message: '注册成功', userId };
      }

      return { success: false, message: '注册失败，请稍后重试' };
    } catch (error) {
      NetworkUtils.logNetworkError('注册账号', error);
      return { success: false, message: NetworkUtils.getNetworkErrorMessage(error) };
    }
  }

  /**
   * 登录账号
   */
  public async login(username: string, password: string): Promise<{ success: boolean; message: string; userId?: number }> {
    if (this.isOffline()) {
      // 离线模式：尝试从本地存储加载
      const savedUsername = localStorage.getItem('username');
      if (savedUsername === username) {
        const savedUserId = localStorage.getItem('user_id');
        if (savedUserId) {
          this.currentUserId = parseInt(savedUserId);
          this.currentUsername = username;
          return { success: true, message: '离线模式登录成功', userId: this.currentUserId };
        }
      }
      return { success: false, message: '网络不可用，无法登录' };
    }

    try {
      // 查找用户并验证密码
      const url = `${SUPABASE_CONFIG.url}/rest/v1/user_accounts?username=eq.${encodeURIComponent(username)}&select=id,username,player_name,password_hash`;
      const response = await NetworkUtils.fetchWithNetworkCheck(url, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });

      if (!response.ok) {
        return { success: false, message: '登录失败，请检查网络连接' };
      }

      const data = await response.json();
      if (!data || data.length === 0) {
        return { success: false, message: '用户名或密码错误' };
      }

      const user = data[0];
      
      // 验证密码：如果数据库中的密码为空或null，则允许任何密码登录
      // 如果数据库中有密码，则必须匹配
      if (user.password_hash && user.password_hash.trim() !== '') {
        // 数据库中有密码，需要验证
        const inputPassword = password || '';
        if (inputPassword !== user.password_hash) {
          return { success: false, message: '用户名或密码错误' };
        }
      }
      // 如果数据库中没有密码（空字符串或null），则允许登录

      this.currentUserId = user.id;
      this.currentUsername = user.username;
      
      // 保存登录状态
      localStorage.setItem('user_id', user.id.toString());
      localStorage.setItem('username', user.username);
      localStorage.setItem('player_name', user.player_name);

      // 加载游戏数据
      await this.loadGameDataFromServer();

      return { success: true, message: '登录成功', userId: user.id };
    } catch (error) {
      NetworkUtils.logNetworkError('登录账号', error);
      return { success: false, message: NetworkUtils.getNetworkErrorMessage(error) };
    }
  }

  /**
   * 自动登录（从本地存储）
   */
  public async autoLogin(): Promise<{ success: boolean; message: string }> {
    const savedUserId = localStorage.getItem('user_id');
    const savedUsername = localStorage.getItem('username');

    if (!savedUserId || !savedUsername) {
      return { success: false, message: '未找到登录信息' };
    }

    if (this.isOffline()) {
      // 离线模式：直接使用本地数据
      this.currentUserId = parseInt(savedUserId);
      this.currentUsername = savedUsername;
      return { success: true, message: '离线模式自动登录成功' };
    }

    try {
      // 验证用户是否存在
      const url = `${SUPABASE_CONFIG.url}/rest/v1/user_accounts?id=eq.${savedUserId}&select=id,username,player_name`;
      const response = await NetworkUtils.fetchWithNetworkCheck(url, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });

      if (!response.ok) {
        return { success: false, message: '自动登录失败，请手动登录' };
      }

      const data = await response.json();
      if (!data || data.length === 0) {
        // 用户不存在，清除本地数据
        this.logout();
        return { success: false, message: '账号不存在，请重新注册' };
      }

      const user = data[0];
      this.currentUserId = user.id;
      this.currentUsername = user.username;
      localStorage.setItem('player_name', user.player_name);

      // 加载游戏数据
      await this.loadGameDataFromServer();

      return { success: true, message: '自动登录成功' };
    } catch (error) {
      NetworkUtils.logNetworkError('自动登录', error);
      // 网络错误时，使用离线模式
      this.currentUserId = parseInt(savedUserId);
      this.currentUsername = savedUsername;
      return { success: true, message: '离线模式自动登录成功' };
    }
  }

  /**
   * 登出
   */
  public logout(): void {
    this.currentUserId = null;
    this.currentUsername = null;
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('player_name');
  }

  /**
   * 创建初始游戏数据
   */
  private async createInitialGameData(userId: number, playerName: string): Promise<void> {
    const dataManager = DataManager.getInstance();
    // 使用默认数据结构
    const defaultData = {
      coins: 0,
      totalStars: 0,
      levelProgress: [{ world: 1, level: 1, stars: 0, highScore: 0, isCompleted: false }],
      ownedCharacters: ['mage_307'],
      currentCharacter: 'mage_307'
    };
    
    const gameData: UserGameData = {
      user_id: userId,
      coins: defaultData.coins,
      total_stars: defaultData.totalStars,
      level_progress: JSON.stringify(defaultData.levelProgress),
      owned_characters: JSON.stringify(defaultData.ownedCharacters),
      current_character: defaultData.currentCharacter
    };

    try {
      await NetworkUtils.fetchWithNetworkCheck(
        `${SUPABASE_CONFIG.url}/rest/v1/user_game_data`,
        {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify(gameData)
        }
      );
    } catch (error) {
      NetworkUtils.logNetworkError('创建初始游戏数据', error);
    }
  }

  /**
   * 从服务器加载游戏数据
   */
  public async loadGameDataFromServer(): Promise<boolean> {
    if (!this.currentUserId || this.isOffline()) {
      return false;
    }

    try {
      const url = `${SUPABASE_CONFIG.url}/rest/v1/user_game_data?user_id=eq.${this.currentUserId}&select=*&limit=1`;
      const response = await NetworkUtils.fetchWithNetworkCheck(url, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (!data || data.length === 0) {
        // 没有游戏数据，创建初始数据
        await this.createInitialGameData(this.currentUserId, localStorage.getItem('player_name') || '玩家');
        return false;
      }

      const gameData = data[0];
      const dataManager = DataManager.getInstance();

      // 转换数据格式
      dataManager.playerData = {
        playerName: localStorage.getItem('player_name') || '玩家',
        coins: gameData.coins || 0,
        totalStars: gameData.total_stars || 0,
        levelProgress: gameData.level_progress ? JSON.parse(gameData.level_progress) : [],
        ownedCharacters: gameData.owned_characters ? JSON.parse(gameData.owned_characters) : ['mage_307'],
        currentCharacter: gameData.current_character || 'mage_307'
      };

      // 同时保存到本地（作为备份）
      dataManager.saveData();

      return true;
    } catch (error) {
      NetworkUtils.logNetworkError('加载游戏数据', error);
      return false;
    }
  }

  /**
   * 保存游戏数据到服务器
   */
  public async saveGameDataToServer(): Promise<boolean> {
    if (!this.currentUserId || this.isOffline()) {
      return false;
    }

    try {
      const dataManager = DataManager.getInstance();
      const playerData = dataManager.playerData;

      const gameData: Partial<UserGameData> = {
        coins: playerData.coins,
        total_stars: playerData.totalStars,
        level_progress: JSON.stringify(playerData.levelProgress),
        owned_characters: JSON.stringify(playerData.ownedCharacters),
        current_character: playerData.currentCharacter
      };

      const url = `${SUPABASE_CONFIG.url}/rest/v1/user_game_data?user_id=eq.${this.currentUserId}`;
      const response = await NetworkUtils.fetchWithNetworkCheck(url, {
        method: 'PATCH',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(gameData)
      });

      return response.ok;
    } catch (error) {
      NetworkUtils.logNetworkError('保存游戏数据', error);
      return false;
    }
  }

  /**
   * 更新玩家名字
   */
  public async updatePlayerName(newName: string): Promise<{ success: boolean; message: string }> {
    if (!this.currentUserId) {
      return { success: false, message: '未登录，无法修改名字' };
    }

    if (this.isOffline()) {
      // 离线模式：只更新本地存储
      localStorage.setItem('player_name', newName);
      return { success: true, message: '离线模式：名字已保存到本地' };
    }

    try {
      // 检查新名字是否已被其他账号使用
      const checkUrl = `${SUPABASE_CONFIG.url}/rest/v1/user_accounts?player_name=eq.${encodeURIComponent(newName)}&select=id`;
      const checkResponse = await NetworkUtils.fetchWithNetworkCheck(checkUrl, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });

      if (checkResponse.ok) {
        const existing = await checkResponse.json();
        if (existing && existing.length > 0) {
          const existingUserId = existing[0].id;
          // 如果名字被其他账号使用，则不允许
          if (existingUserId !== this.currentUserId) {
            return { success: false, message: '这个名字已经被使用了，请换一个名字吧！' };
          }
        }
      }

      // 更新账号名字
      const updateUrl = `${SUPABASE_CONFIG.url}/rest/v1/user_accounts?id=eq.${this.currentUserId}`;
      const response = await NetworkUtils.fetchWithNetworkCheck(updateUrl, {
        method: 'PATCH',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({ player_name: newName })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('更新名字失败:', response.status, errorText);
        return { success: false, message: '更新名字失败，请稍后重试' };
      }

      // 更新本地存储
      localStorage.setItem('player_name', newName);

      return { success: true, message: '名字更新成功' };
    } catch (error) {
      NetworkUtils.logNetworkError('更新玩家名字', error);
      return { success: false, message: NetworkUtils.getNetworkErrorMessage(error) };
    }
  }

  /**
   * 获取当前玩家名字
   */
  public getPlayerName(): string {
    // 优先从 localStorage 获取（已登录时会有）
    const savedName = localStorage.getItem('player_name');
    if (savedName) {
      return savedName;
    }
    
    // 如果未登录，返回空字符串
    return '';
  }

  /**
   * 更新离线模式状态
   */
  public updateOfflineMode(): void {
    this.isOfflineMode = !NetworkUtils.isOnline() || !AccountManager.isConfigured();
  }
}

