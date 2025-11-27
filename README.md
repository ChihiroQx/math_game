# 🎮 数学童话冒险 Math Fairy Adventure

专为小朋友设计的数学学习游戏，通过有趣的冒险故事让数学变得简单快乐！

## 🌟 游戏特色

- 🏰 **3个奇幻世界** - 数字森林、魔法山谷、智慧城堡
- 🎨 **6位可爱公主** - 不同角色，不同技能
- 📚 **数学题库** - 加减乘除，循序渐进
- 🏆 **星级评价** - 激励学习，追求完美
- 💰 **金币系统** - 解锁新角色，增加趣味
- 🎵 **音效配乐** - 沉浸式游戏体验

## 🚀 在线试玩

**即将上线！** 敬请期待...

## 🛠️ 技术栈

- **游戏引擎**: Phaser 3
- **开发语言**: TypeScript
- **构建工具**: Webpack
- **部署平台**: Vercel / GitHub Pages

## 📦 本地运行

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

游戏将在 http://localhost:8080 运行

### 构建生产版本

```bash
npm run build
```

生成的文件在 `dist` 目录

## 🎯 项目结构

```
MathGame/
├── src/
│   ├── scenes/          # 游戏场景
│   │   ├── PreloadScene.ts      # 资源加载
│   │   ├── MainMenuScene.ts     # 主菜单
│   │   ├── WorldMapScene.ts     # 世界地图
│   │   ├── GamePlayScene.ts     # 游戏战斗
│   │   ├── SkinShopScene.ts     # 皮肤商店
│   │   └── ...
│   ├── entities/        # 游戏实体
│   │   ├── Princess.ts          # 公主角色
│   │   ├── Monster.ts           # 怪物
│   │   └── Bullet.ts            # 子弹
│   ├── managers/        # 管理器
│   │   ├── DataManager.ts       # 数据管理
│   │   ├── QuestionManager.ts   # 题库管理
│   │   └── AudioManager.ts      # 音频管理
│   ├── config/          # 配置文件
│   │   ├── CharacterConfig.ts   # 角色配置
│   │   └── MonsterConfig.ts     # 怪物配置
│   └── utils/           # 工具类
│       └── ButtonFactory.ts     # 按钮工厂
├── assets/              # 游戏资源
│   ├── res/             # 图片资源
│   └── questions.json   # 题库文件
└── index.html          # 入口页面
```

## 👥 角色介绍

### 可选角色

1. **圣骑之星-艾莉丝** - 见习骑士，属性均衡 ✅ 默认拥有
2. **暗影刺客-莉莉丝** - 神秘敏捷，攻击+20%，生命-10%
3. **冰霜法师-艾莎** - 冰雪魔法，生命+30%，攻击-10%
4. **魔法少女-米娅** - 活力魔法，攻速+30%，攻击-15%
5. **星辉术士-诺娅** - 星辰之力，全属性+10%
6. **烈焰骑士-露娜** - 最强战士，攻击+30%，生命+20%

## 🎓 教育价值

- ✅ **数学能力** - 加强计算速度和准确性
- ✅ **逻辑思维** - 培养问题解决能力
- ✅ **目标导向** - 追求三星完美通关
- ✅ **时间管理** - 在限定时间内完成挑战
- ✅ **成就感** - 金币收集和角色解锁

## 📱 设备支持

- ✅ 桌面浏览器（Chrome, Edge, Firefox, Safari）
- ✅ 移动浏览器（iOS Safari, Android Chrome）
- ✅ 支持触摸操作
- ✅ 响应式设计

## 🔧 部署

### Vercel 部署（推荐）

1. Fork 本仓库
2. 连接到 Vercel
3. 自动部署

或使用 CLI：

```bash
npm run build
vercel --prod
```

### GitHub Pages 部署

1. 运行构建：`npm run build`
2. 推送 `dist` 目录到 `gh-pages` 分支
3. 在仓库设置中启用 GitHub Pages

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

MIT License

## 👨‍💻 作者

**千寻 (ChihiroQx)**

- GitHub: [@ChihiroQx](https://github.com/ChihiroQx)
- 项目: [math_game](https://github.com/ChihiroQx/math_game)

## 🙏 致谢

- 游戏引擎：[Phaser 3](https://phaser.io/)
- 美术资源：感谢所有开源资源贡献者
- 灵感来源：让数学学习变得有趣！

---

**让数学变得简单快乐！** 🎮✨

如果觉得项目不错，请给个 ⭐ Star 支持一下！
