/**
 * 全球排行榜管理器
 * 使用 Supabase 实现在线排行榜功能
 */

import { SUPABASE_CONFIG, getSupabaseHeaders } from '../config/SupabaseConfig';

export interface LeaderboardEntry {
  id?: number;
  player_name: string;
  total_stars: number;
  total_coins: number;
  highest_score: number;
  max_level_completed?: number;  // 最大通关数（世界×100 + 关卡，如：102 = 世界1第2关）
  max_level_text?: string;       // 最大通关文本（如："世界1-关卡2"）
  created_at?: string;
  updated_at?: string;
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
      const url = `${SUPABASE_CONFIG.url}/rest/v1/leaderboard?select=*&order=max_level_completed.desc.nullslast,total_stars.desc,total_coins.desc&limit=${limit}`;
      console.log('📥 请求排行榜数据，URL:', url);
      
      const response = await fetch(url, {
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
      console.error('❌ Error fetching leaderboard:', error);
      return [];
    }
  }

  /**
   * 提交玩家分数
   */
  public async submitScore(playerName: string, stars: number, coins: number, score: number, maxLevelCompleted: number): Promise<boolean> {
    try {
      // 如果已有记录ID，先验证是否真实存在
      if (this.playerRecordId) {
        console.log('🔍 检查本地记录 ID:', this.playerRecordId);
        
        // 尝试获取现有记录
        const checkResponse = await fetch(
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
            return await this.updateScore(stars, coins, score, maxLevelCompleted);
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
        highest_score: score,
        max_level_completed: maxLevelCompleted
      };

      console.log('📤 发送新记录到 Supabase:', entry);

      const response = await fetch(
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
      console.error('❌ Error submitting score:', error);
      return false;
    }
  }

  /**
   * 更新玩家分数
   */
  public async updateScore(stars: number, coins: number, score: number, maxLevelCompleted: number): Promise<boolean> {
    if (!this.playerRecordId) {
      return false;
    }

    try {
      const entry = {
        total_stars: stars,
        total_coins: coins,
        highest_score: score,
        max_level_completed: maxLevelCompleted,
        updated_at: new Date().toISOString()
      };

      console.log('📤 更新现有记录 (ID:', this.playerRecordId, '):', entry);

      const response = await fetch(
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
      console.error('Error updating score:', error);
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
      const response = await fetch(
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
      console.error('Error getting player rank:', error);
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
}

