# ⚡ Vercel 快速部署（3步完成）

## 🎯 最简单的方法

### 第一步：安装并登录

打开命令行，运行：

```bash
npm install -g vercel
vercel login
```

选择 **GitHub** 登录（推荐），在浏览器中授权。

### 第二步：一键部署

双击运行：
```
vercel-deploy.bat
```

或在命令行运行：
```bash
cd MathGame
npm run build
cd dist
vercel --prod
```

按提示操作：
- Project name: 输入 `math-game`
- 其他选项：按回车（使用默认）

### 第三步：获取链接

部署完成后，会显示：
```
✅ Production: https://math-game-xxx.vercel.app
```

**复制这个链接，就可以分享了！** 🎮

---

## 📱 分享给小朋友

### 1. 直接分享链接
```
https://math-game-xxx.vercel.app
```

### 2. 生成二维码
1. 访问 https://cli.im/
2. 粘贴链接
3. 下载二维码图片

### 3. 添加到手机桌面
- 手机打开链接
- 点击"添加到主屏幕"
- 像 APP 一样使用

---

## 🔄 更新游戏

修改代码后，只需再次运行：
```
vercel-deploy.bat
```

自动更新，链接不变！

---

## ⏱️ 需要多久？

- **首次部署**: 5-10分钟
- **后续更新**: 1-2分钟

---

## 💡 优势

✅ 无需实名  
✅ 国内速度好  
✅ 自动 HTTPS  
✅ 永久免费  
✅ 自动更新  

---

## 📞 需要帮助？

查看详细教程：`Vercel部署指南.md`

---

**准备好了吗？运行 `vercel-deploy.bat` 开始吧！** 🚀

