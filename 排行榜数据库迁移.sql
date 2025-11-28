-- 排行榜数据库迁移脚本
-- 移除 highest_score 字段，修改排序规则，删除无用表，清空所有数据

-- ============================================
-- 第一部分：删除无用的数据库表
-- ============================================

-- 1. 删除 player_names 表（已不再使用，玩家名字现在存储在 user_accounts 表中）
DROP TABLE IF EXISTS player_names CASCADE;

-- ============================================
-- 第二部分：修改 leaderboard 表结构
-- ============================================

-- 2. 删除 highest_score 字段
ALTER TABLE leaderboard DROP COLUMN IF EXISTS highest_score;

-- 3. 创建索引以优化排序查询性能（如果还没有的话）
CREATE INDEX IF NOT EXISTS idx_leaderboard_ranking 
ON leaderboard(max_level_completed DESC NULLS LAST, total_stars DESC, created_at ASC);

-- ============================================
-- 第三部分：清空所有数据（清档）
-- ============================================

-- 4. 清空排行榜数据
TRUNCATE TABLE leaderboard CASCADE;

-- 5. 清空无限模式排行榜数据
TRUNCATE TABLE infinite_mode_leaderboard CASCADE;

-- 6. 清空用户游戏数据
TRUNCATE TABLE user_game_data CASCADE;

-- 7. 清空用户账号数据（注意：这会删除所有账号）
TRUNCATE TABLE user_accounts CASCADE;

-- ============================================
-- 验证
-- ============================================

-- 执行后验证表结构：
-- leaderboard 表应该有以下字段：
--   id, player_name, total_stars, total_coins, max_level_completed, created_at, updated_at
--
-- user_accounts 表应该有以下字段：
--   id, username, password_hash, player_name, created_at, updated_at
--
-- user_game_data 表应该有以下字段：
--   id, user_id, coins, total_stars, level_progress, owned_characters, current_character, created_at, updated_at
--
-- infinite_mode_leaderboard 表应该有以下字段：
--   id, world, level, player_name, kill_count, survival_time, created_at

-- ============================================
-- 说明
-- ============================================

-- 排序规则：
-- 1. 首先按 max_level_completed（关卡进度）降序排列
-- 2. 相同进度按 total_stars（星星数量）降序排列
-- 3. 相同星星数量按 created_at（创建时间）升序排列（先达到的排名更高）

-- 注意事项：
-- - 执行此脚本会删除所有数据，请谨慎操作
-- - 建议在执行前备份数据库
-- - player_names 表已被删除，因为玩家名字现在直接存储在 user_accounts.player_name 中

