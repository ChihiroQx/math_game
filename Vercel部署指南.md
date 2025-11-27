# 🚀 Vercel 部署指南（无需实名）

## 为什么选择 Vercel？

- ✅ **无需实名认证**
- ✅ **国内访问速度好**（有 CDN）
- ✅ **完全免费**
- ✅ **自动 HTTPS**
- ✅ **全球加速**
- ✅ **部署超简单**

---

## 📦 部署步骤

### 方法1：使用 Vercel CLI（推荐，一键部署）

#### 1. 安装 Vercel CLI

打开命令行，运行：

```bash
npm install -g vercel
```

等待安装完成（约1分钟）

#### 2. 登录 Vercel

```bash
vercel login
```

会弹出浏览器，选择登录方式：
- **GitHub**（推荐）
- **GitLab**
- **Bitbucket**
- **Email**

点击授权，完成登录。

#### 3. 部署游戏

在项目目录运行：

```bash
cd MathGame
npm run build
cd dist
vercel --prod
```

按提示操作：
1. `Set up and deploy`：选择 **Y**
2. `Which scope`：按回车（默认）
3. `Link to existing project`：选择 **N**
4. `Project name`：输入 `math-game`（或按回车使用默认）
5. `In which directory`：按回车（当前目录）
6. `Override settings`：选择 **N**

部署完成！会显示访问链接：
```
https://math-game-xxx.vercel.app
```

---

### 方法2：使用 Vercel 网页（简单）

#### 1. 注册/登录 Vercel

访问：https://vercel.com/signup

选择登录方式：
- **GitHub**（推荐）
- **GitLab**  
- **Bitbucket**

点击授权登录。

#### 2. 准备代码

确保代码已推送到 GitHub：

```bash
# 如果还没有推送到 GitHub
cd MathGame/dist
git init
git add .
git commit -m "部署游戏"
git branch -M main
git remote add origin https://github.com/你的用户名/math-game.git
git push -u origin main
```

#### 3. Import 项目

1. 在 Vercel 首页点击 **"Add New..."** → **"Project"**
2. 点击 **"Import Git Repository"**
3. 选择或输入仓库地址
4. 点击 **"Import"**

#### 4. 配置部署

- **Framework Preset**: 选择 **"Other"**
- **Root Directory**: 选择 **"dist"** 或留空
- **Build Command**: 留空
- **Output Directory**: 留空或输入 **"."**

点击 **"Deploy"**

#### 5. 等待部署

约30秒后，部署完成！

获得访问链接：
```
https://math-game-xxx.vercel.app
```

---

### 方法3：拖放部署（最简单，但需要手动更新）

1. 访问：https://vercel.com
2. 登录后，点击 **"Add New..."** → **"Project"**
3. 选择 **"Upload Files"**
4. 将 `dist` 文件夹拖拽上传
5. 自动部署，获得链接

---

## 🎮 游戏地址

部署成功后，您会获得类似这样的链接：

```
https://math-game-xxx.vercel.app
```

- `xxx` 是随机生成的字符
- 可以在设置中自定义域名

---

## 🔄 更新游戏

### 使用 CLI（推荐）

修改代码后：

```bash
cd MathGame
npm run build
cd dist
vercel --prod
```

自动更新，保持同一个链接。

### 使用 Git 自动部署

如果使用 GitHub + Vercel：
1. 修改代码
2. 推送到 GitHub
3. Vercel 自动检测并部署
4. 无需手动操作！

---

## 🎨 自定义域名（可选）

1. 在 Vercel 项目设置中
2. 点击 **"Domains"**
3. 添加自定义域名
4. 按提示配置 DNS

---

## 📊 性能监控

Vercel 提供免费的：
- 访问统计
- 性能分析
- 错误监控

在项目详情页查看。

---

## ⚙️ 环境变量（可选）

如果游戏需要配置：
1. 项目设置 → **"Environment Variables"**
2. 添加变量
3. 重新部署生效

---

## 📱 添加到手机桌面

部署后，访客可以：
1. 用手机浏览器打开链接
2. Safari: 点击"分享" → "添加到主屏幕"
3. Chrome: 点击"⋮" → "添加到主屏幕"

---

## 💡 常见问题

### Q1: 部署后显示 404

**原因**：`index.html` 不在根目录

**解决**：
- 确保上传的是 `dist` 文件夹的**内容**
- 不是上传 `dist` 文件夹本身

### Q2: 国内访问慢

**解决**：
- Vercel 有全球 CDN，正常1-3秒加载
- 首次访问可能稍慢，后续会快
- 可以考虑绑定国内 CDN

### Q3: vercel 命令不存在

**解决**：
```bash
npm install -g vercel
```

如果还是不行，重启命令行。

### Q4: 部署失败

**解决**：
1. 检查 `dist` 文件夹是否存在
2. 确保 `npm run build` 成功
3. 查看错误信息

### Q5: 想删除项目

**步骤**：
1. 进入 Vercel 控制台
2. 选择项目 → Settings
3. 滚动到底部 → Delete Project

---

## 🆚 对比其他平台

| 特性 | Vercel | Netlify | GitHub Pages | Gitee Pages |
|------|--------|---------|--------------|-------------|
| 国内速度 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 实名认证 | 不需要 | 不需要 | 不需要 | **需要** |
| 部署难度 | ⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| 自动部署 | ✅ | ✅ | ❌ | ❌ |
| 免费额度 | 足够 | 足够 | 无限 | 无限 |

---

## 🎉 完成！

现在您的游戏已经在线了！

**分享链接给小朋友们：**
```
https://your-game.vercel.app
```

**生成二维码：**
1. 访问 https://cli.im/
2. 粘贴链接
3. 下载二维码

---

## 🆘 需要帮助？

- Vercel 文档：https://vercel.com/docs
- Vercel 中文社区：搜索"Vercel 教程"

---

**预计部署时间：5-10分钟**  
**难度：⭐⭐ (简单)**

