/**
 * 全球排行榜管理器
 * 使用 Supabase 实现在线排行榜功能
 */

import { SUPABASE_CONFIG, getSupabaseHeaders } from '../config/SupabaseConfig';
import NetworkUtils from '../utils/NetworkUtils';

export interface LeaderboardEntry {
  id?: number;
  player_name: string;
  total_stars: number;
  total_coins: number;
  max_level_completed?: number;  // 最大通关数（世界×100 + 关卡，如：102 = 世界1第2关）
  max_level_text?: string;       // 最大通关文本（如："世界1-关卡2"）
  created_at?: string;
  updated_at?: string;
}

/**
 * 无限模式记录接口
 */
export interface InfiniteModeRecord {
  id?: number;
  world: number;
  level: number;
  player_name: string;
  kill_count: number;
  survival_time: number;
  created_at?: string;
}


export class LeaderboardManager {
  private static instance: LeaderboardManager;
  private playerRecordId: number | null = null;

  private constructor() {
    // 从 localStorage 读取玩家记录 ID
    const savedId = localStorage.getItem('leaderboard_record_id');
    if (savedId) {
      this.playerRecordId = parseInt(savedId);
    }
  }

  public static getInstance(): LeaderboardManager {
    if (!LeaderboardManager.instance) {
      LeaderboardManager.instance = new LeaderboardManager();
    }
    return LeaderboardManager.instance;
  }

  /**
   * 获取排行榜前N名（按通关进度、星星、金币排序）
   */
  public async getTopPlayers(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      // 排序规则：1. 关卡进度（降序） 2. 星星数量（降序） 3. 创建时间（升序，先达到的排名更高）
      const url = `${SUPABASE_CONFIG.url}/rest/v1/leaderboard?select=*&order=max_level_completed.desc.nullslast,total_stars.desc,created_at.asc&limit=${limit}`;
      console.log('📥 请求排行榜数据，URL:', url);
      
      const response = await NetworkUtils.fetchWithNetworkCheck(url, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });

      console.log('📥 排行榜响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 获取排行榜失败:', response.status, errorText);
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      console.log('✅ 获取到排行榜数据:', data);
      return data;
    } catch (error) {
      NetworkUtils.logNetworkError('获取排行榜', error);
      // 网络错误时返回空数组，让调用方使用本地数据
      return [];
    }
  }

  /**
   * 提交玩家分数
   */
  public async submitScore(playerName: string, stars: number, coins: number, maxLevelCompleted: number): Promise<boolean> {
    try {
      // 如果已有记录ID，先验证是否真实存在
      if (this.playerRecordId) {
        console.log('🔍 检查本地记录 ID:', this.playerRecordId);
        
        // 尝试获取现有记录
        const checkResponse = await NetworkUtils.fetchWithNetworkCheck(
          `${SUPABASE_CONFIG.url}/rest/v1/leaderboard?id=eq.${this.playerRecordId}`,
          {
            method: 'GET',
            headers: getSupabaseHeaders()
          }
        );
        
        if (checkResponse.ok) {
          const existingData = await checkResponse.json();
          console.log('🔍 查询结果:', existingData);
          
          if (existingData && existingData.length > 0) {
            console.log('✅ 记录存在，执行更新');
            const existing = existingData[0];
            // 使用现有记录的值和传入的值，取较大值（确保数据正确）
            // stars 和 coins 参数已经是累计的总数，所以直接比较取较大值
            return await this.updateScore(
              Math.max(existing.total_stars || 0, stars), // 取较大值
              Math.max(existing.total_coins || 0, coins), // 取较大值
              Math.max(existing.max_level_completed || 0, maxLevelCompleted) // 最大关卡取较大值
            );
          } else {
            console.log('⚠️ 记录不存在，清除本地ID并创建新记录');
            this.playerRecordId = null;
            localStorage.removeItem('leaderboard_record_id');
          }
        }
      }

      // 创建新记录
      const entry: LeaderboardEntry = {
        player_name: playerName,
        total_stars: stars,
        total_coins: coins,
        max_level_completed: maxLevelCompleted
      };

      console.log('📤 发送新记录到 Supabase:', entry);

      const response = await NetworkUtils.fetchWithNetworkCheck(
        `${SUPABASE_CONFIG.url}/rest/v1/leaderboard`,
        {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify(entry)
        }
      );

      console.log('📤 响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Supabase 返回错误:', response.status, errorText);
        throw new Error(`Failed to submit score: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Supabase 返回数据:', data);
      
      if (data && data.length > 0 && data[0].id) {
        this.playerRecordId = data[0].id;
        localStorage.setItem('leaderboard_record_id', data[0].id.toString());
        console.log('💾 保存记录 ID:', this.playerRecordId);
      }

      return true;
    } catch (error) {
      NetworkUtils.logNetworkError('提交分数', error);
      // 网络错误时返回 false，但不影响游戏流程
      return false;
    }
  }

  /**
   * 更新玩家分数
   * @param totalStars 总星星数（取较大值）
   * @param totalCoins 总金币数（取较大值）
   * @param maxLevelCompleted 最大通关数（取较大值）
   */
  public async updateScore(
    totalStars: number, 
    totalCoins: number, 
    maxLevelCompleted: number
  ): Promise<boolean> {
    if (!this.playerRecordId) {
      return false;
    }

    try {
      const entry = {
        total_stars: totalStars,
        total_coins: totalCoins,
        max_level_completed: maxLevelCompleted,
        updated_at: new Date().toISOString()
      };

      console.log('📤 更新现有记录 (ID:', this.playerRecordId, '):', entry);

      const response = await NetworkUtils.fetchWithNetworkCheck(
        `${SUPABASE_CONFIG.url}/rest/v1/leaderboard?id=eq.${this.playerRecordId}`,
        {
          method: 'PATCH',
          headers: getSupabaseHeaders(),
          body: JSON.stringify(entry)
        }
      );

      if (response.ok) {
        console.log('✅ 更新成功！');
      } else {
        const errorText = await response.text();
        console.error('❌ 更新失败:', response.status, errorText);
      }

      return response.ok;
    } catch (error) {
      NetworkUtils.logNetworkError('更新分数', error);
      return false;
    }
  }

  /**
   * 获取玩家排名
   */
  public async getPlayerRank(): Promise<number> {
    if (!this.playerRecordId) {
      return -1;
    }

    try {
      // 获取比当前玩家分数高的玩家数量
      const response = await NetworkUtils.fetchWithNetworkCheck(
        `${SUPABASE_CONFIG.url}/rest/v1/leaderboard?select=id`,
        {
          method: 'GET',
          headers: getSupabaseHeaders()
        }
      );

      const allPlayers = await response.json();
      // 这里需要更复杂的逻辑来计算真实排名
      // 简化版本：返回总玩家数的一半作为示例
      return Math.floor(allPlayers.length / 2);
    } catch (error) {
      NetworkUtils.logNetworkError('获取玩家排名', error);
      return -1;
    }
  }

  /**
   * 检查是否已配置 Supabase
   */
  public static isConfigured(): boolean {
    return SUPABASE_CONFIG.url !== 'YOUR_PROJECT_URL' &&
           SUPABASE_CONFIG.anonKey !== 'YOUR_ANON_KEY';
  }
  
  /**
   * 提交无限模式记录
   */
  public async submitInfiniteModeRecord(
    world: number,
    level: number,
    playerName: string,
    killCount: number,
    survivalTime: number
  ): Promise<boolean> {
    try {
      const record: InfiniteModeRecord = {
        world,
        level,
        player_name: playerName,
        kill_count: killCount,
        survival_time: survivalTime
      };
      
      console.log('📤 提交无限模式记录到 Supabase:', record);
      
      const response = await NetworkUtils.fetchWithNetworkCheck(
        `${SUPABASE_CONFIG.url}/rest/v1/infinite_mode_leaderboard`,
        {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify(record)
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 提交无限模式记录失败:', response.status, errorText);
        return false;
      }
      
      console.log('✅ 无限模式记录提交成功');
      return true;
    } catch (error) {
      NetworkUtils.logNetworkError('提交无限模式记录', error);
      return false;
    }
  }
  
  /**
   * 获取指定关卡的无限模式排行榜
   */
  public async getInfiniteModeLeaderboard(
    world: number,
    level: number,
    limit: number = 50
  ): Promise<InfiniteModeRecord[]> {
    try {
      const url = `${SUPABASE_CONFIG.url}/rest/v1/infinite_mode_leaderboard?world=eq.${world}&level=eq.${level}&select=*&order=kill_count.desc,survival_time.desc&limit=${limit}`;
      console.log('📥 请求无限模式排行榜，URL:', url);
      
      const response = await NetworkUtils.fetchWithNetworkCheck(url, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 获取无限模式排行榜失败:', response.status, errorText);
        return [];
      }
      
      const data = await response.json();
      console.log('✅ 获取到无限模式排行榜数据:', data);
      return data;
    } catch (error) {
      NetworkUtils.logNetworkError('获取无限模式排行榜', error);
      return [];
    }
  }
  
  /**
   * 获取总玩家数量（使用账号表）
   */
  public async getTotalPlayerCount(): Promise<number> {
    try {
      // 使用 Supabase 的 count 功能获取总数
      // 方法1: 使用 Prefer: count=exact 头获取总数（推荐）
      const headers = {
        ...getSupabaseHeaders(),
        'Prefer': 'count=exact'
      };
      
      const url = `${SUPABASE_CONFIG.url}/rest/v1/user_accounts?select=id&limit=0`;
      const response = await NetworkUtils.fetchWithNetworkCheck(url, {
        method: 'HEAD',
        headers: headers
      });

      // 从响应头获取总数
      const countHeader = response.headers.get('content-range');
      if (countHeader) {
        // content-range 格式: "0-9/100" 或 "*/100"
        const match = countHeader.match(/\/(\d+)$/);
        if (match) {
          const count = parseInt(match[1], 10);
          console.log('✅ 从响应头获取玩家总数:', count);
          return count;
        }
      }

      // 降级方案：获取所有记录并计算长度（如果响应头不支持）
      console.log('⚠️ 响应头未包含总数，使用降级方案');
      const getResponse = await NetworkUtils.fetchWithNetworkCheck(
        `${SUPABASE_CONFIG.url}/rest/v1/user_accounts?select=id`,
        {
          method: 'GET',
          headers: getSupabaseHeaders()
        }
      );
      
      if (!getResponse.ok) {
        const errorText = await getResponse.text();
        console.error('❌ 获取玩家总数失败:', getResponse.status, errorText);
        return 0;
      }
      
      const data = await getResponse.json();
      const count = Array.isArray(data) ? data.length : 0;
      console.log('✅ 从数据数组计算玩家总数:', count);
      return count;
    } catch (error) {
      NetworkUtils.logNetworkError('获取总玩家数量', error);
      return 0;
    }
  }
}

