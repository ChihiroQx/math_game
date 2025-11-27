/**
 * Supabase 配置
 * 用于全球排行榜功能
 */

// TODO: 替换为您的 Supabase 项目信息
export const SUPABASE_CONFIG = {
  url: 'https://msfydkadgdttfuxgxzna.supabase.co', // 例如: https://xxx.supabase.co
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZnlka2FkZ2R0dGZ1eGd4em5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDI4OTQsImV4cCI6MjA3OTgxODg5NH0.h-vsiqdDJjeDRo0IJFtNwPRO87HmZlZQclbd6wPJqcY' // 从 Supabase Dashboard 获取
};

// 排行榜API端点
export const LEADERBOARD_API = {
  // 获取排行榜（前N名）
  getTopPlayers: (limit: number = 10) => ({
    url: `${SUPABASE_CONFIG.url}/rest/v1/leaderboard`,
    params: {
      select: '*',
      order: 'total_stars.desc,total_coins.desc',
      limit: limit
    }
  }),
  
  // 提交分数
  submitScore: () => ({
    url: `${SUPABASE_CONFIG.url}/rest/v1/leaderboard`
  }),
  
  // 更新分数
  updateScore: (id: number) => ({
    url: `${SUPABASE_CONFIG.url}/rest/v1/leaderboard?id=eq.${id}`
  })
};

// API 请求头
export const getSupabaseHeaders = () => ({
  'apikey': SUPABASE_CONFIG.anonKey,
  'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

