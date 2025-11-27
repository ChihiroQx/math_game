# 🌐 Supabase 全球排行榜集成指南

## 📋 概述

本指南将帮助您为数学游戏添加全球排行榜功能，让所有玩家可以在线比较分数。

---

## ✅ 已完成的工作

我已经为您创建了：

1. **`src/config/SupabaseConfig.ts`** - Supabase 配置文件
2. **`src/managers/LeaderboardManager.ts`** - 排行榜管理器

---

## 🚀 第一步：配置 Supabase

### 1. 注册并创建项目

1. 访问：https://supabase.com
2. 用 GitHub 登录
3. 创建新项目：
   - Name: `math-game`
   - Password: 创建一个数据库密码
   - Region: **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)**
   - Plan: **Free**

### 2. 创建数据库表

在 Supabase Dashboard：
1. 点击 **SQL Editor**
2. 点击 **New query**
3. 粘贴以下 SQL：

```sql
-- 创建排行榜表
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  player_name TEXT NOT NULL,
  total_stars INTEGER DEFAULT 0,
  total_coins INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 创建索引
CREATE INDEX idx_total_stars ON leaderboard(total_stars DESC);

-- 启用行级安全
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 允许公开访问
CREATE POLICY "Allow public read" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON leaderboard FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON leaderboard FOR UPDATE USING (true);
```

4. 点击 **Run**

### 3. 获取 API 密钥

1. 点击 **Settings** → **API**
2. 复制：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGciOi...`

### 4. 配置游戏

打开 `src/config/SupabaseConfig.ts`，替换：

```typescript
export const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co', // 粘贴您的 URL
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // 粘贴您的密钥
};
```

---

## 💻 第二步：集成到游戏

### 1. 在 LeaderboardScene 中使用

修改 `src/scenes/LeaderboardScene.ts`：

```typescript
import { LeaderboardManager } from '../managers/LeaderboardManager';

// 在 create() 方法中
async create(): void {
  // ... 现有代码 ...
  
  // 获取在线排行榜
  if (LeaderboardManager.isConfigured()) {
    await this.loadOnlineLeaderboard();
  }
}

// 添加新方法
private async loadOnlineLeaderboard(): Promise<void> {
  const manager = LeaderboardManager.getInstance();
  const topPlayers = await manager.getTopPlayers(10);
  
  // 显示在线排行榜
  // ... 渲染代码 ...
}
```

### 2. 在 GameOverScene 中提交分数

修改 `src/scenes/GameOverScene.ts`：

```typescript
import { LeaderboardManager } from '../managers/LeaderboardManager';

// 在游戏结束时提交分数
if (LeaderboardManager.isConfigured()) {
  const dataManager = DataManager.getInstance();
  const leaderboardManager = LeaderboardManager.getInstance();
  
  await leaderboardManager.submitScore(
    dataManager.playerData.playerName,
    dataManager.playerData.totalStars,
    dataManager.playerData.coins,
    data.score
  );
}
```

---

## 🎮 第三步：测试

### 1. 本地测试

```bash
npm start
```

### 2. 检查数据

在 Supabase Dashboard：
1. 点击 **Table Editor**
2. 选择 **leaderboard** 表
3. 查看提交的数据

---

## 📊 功能说明

### 已实现功能

- ✅ 提交玩家分数到云端
- ✅ 获取全球前10名
- ✅ 自动更新分数
- ✅ 本地缓存玩家ID

### 可扩展功能

- 📅 按日/周/月排行
- 🌍 按地区排行
- 🏆 成就系统
- 👥 好友排行
- 🛡️ 防作弊机制

---

## 🔒 安全说明

### 当前设置

- ✅ 使用 Row Level Security (RLS)
- ✅ 公开读写访问（适合游戏）
- ⚠️ 无用户认证（简化版）

### 如果需要更强安全性

可以添加：
1. 用户认证（Supabase Auth）
2. 服务端验证分数
3. 限制提交频率

---

## 💰 费用说明

### Free Plan 额度

- ✅ 500MB 数据库
- ✅ 1GB 文件存储
- ✅ 50,000 月活用户
- ✅ 500MB 传输/月

**对于您的游戏完全够用！**

---

## 🆘 常见问题

### Q1: 配置完成后排行榜为空

**A:** 正常！需要有玩家完成游戏后才会有数据。

### Q2: 显示 CORS 错误

**A:** 在 Supabase Dashboard → Authentication → URL Configuration 中添加您的域名。

### Q3: 无法提交分数

**A:** 检查：
1. API 密钥是否正确
2. RLS 策略是否启用
3. 浏览器控制台是否有错误

### Q4: 国内访问慢

**A:** 选择离中国最近的 Region（Tokyo 或 Singapore）

---

## 🎯 下一步

完成配置后：

1. ✅ 修改 `SupabaseConfig.ts` 中的 URL 和密钥
2. ✅ 在 LeaderboardScene 和 GameOverScene 中集成
3. ✅ 测试提交和读取功能
4. ✅ 部署到线上

---

## 📞 需要帮助？

- Supabase 文档：https://supabase.com/docs
- Supabase 社区：https://github.com/supabase/supabase/discussions

---

**准备好添加全球排行榜了吗？** 🚀

告诉我您的 Supabase Project URL 和 anon key，我帮您完成配置！

