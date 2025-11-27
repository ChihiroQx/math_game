# 音效文件目录

## 📁 文件结构

将音效文件放在这个文件夹中：

```
assets/audio/
├── correct.mp3      # 答对音效
├── wrong.mp3        # 答错音效
├── click.mp3        # 点击音效
├── star.mp3         # 获得星星音效
├── coin.mp3         # 金币音效
└── bgm_menu.mp3     # 主菜单背景音乐（可选）
```

## 🎵 推荐的免费音效网站

### 1. Freesound.org
- 网址：https://freesound.org/
- 搜索关键词：
  - "correct beep"
  - "wrong buzz"
  - "button click"
  - "coin collect"
  - "star pickup"

### 2. Zapsplat.com
- 网址：https://www.zapsplat.com/
- 免费注册后可下载
- 搜索：UI sound effects

### 3. Mixkit.co
- 网址：https://mixkit.co/free-sound-effects/
- 完全免费，无需注册
- 分类：Game sounds

### 4. OpenGameArt.org
- 网址：https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=13
- 开源游戏音效
- 搜索：game sounds

## 🎼 音效建议

### correct.mp3 - 答对音效
- 类型：欢快的"叮"声
- 时长：0.5-1秒
- 关键词：success, correct, ding, chime

### wrong.mp3 - 答错音效
- 类型：柔和的提示音
- 时长：0.5-1秒
- 关键词：error, wrong, buzz（选柔和的）

### click.mp3 - 点击音效
- 类型：清脆的点击声
- 时长：0.2-0.5秒
- 关键词：button, click, tap

### star.mp3 - 获得星星
- 类型：闪亮的音效
- 时长：1-2秒
- 关键词：sparkle, twinkle, star, collect

### coin.mp3 - 金币音效
- 类型：金属碰撞声
- 时长：0.5-1秒
- 关键词：coin, collect, pickup

## 📝 添加音效的步骤

### 1. 下载音效文件
从上述网站下载音效，保存为 `.mp3` 格式

### 2. 放入此文件夹
将文件放入 `assets/audio/` 文件夹

### 3. 已经配置好的代码
音效加载代码已经在 `PreloadScene.ts` 中准备好了，
只需取消注释即可：

打开 `src/scenes/PreloadScene.ts`，找到：
```typescript
// this.load.audio('correct', 'assets/audio/correct.mp3');
```

删除 `//` 即可启用。

### 4. 重启游戏
保存文件后，游戏会自动重新加载，音效就能播放了！

## 🎨 音效格式

- **推荐格式**：MP3（兼容性最好）
- **备选格式**：OGG（体积更小）
- **文件大小**：每个音效 < 100KB
- **比特率**：128kbps 足够

## 🔊 当前状态

代码已经完全准备好，音效系统已经实现：
- ✅ AudioManager 音频管理器
- ✅ 音效播放代码
- ✅ 音量控制
- ⏸️ 等待添加实际音效文件

## 💡 临时方案

如果暂时没有音效，游戏也能正常运行：
- 游戏不会报错
- 只是没有声音
- 可以随时添加音效

## 🎯 快速测试

添加音效后，可以在这些地方听到声音：
1. **主菜单** - 点击按钮（click.mp3）
2. **答题** - 答对（correct.mp3）/ 答错（wrong.mp3）
3. **结算** - 获得星星（star.mp3）
4. **金币** - 获得奖励（coin.mp3）

---

**提示**：如果需要帮助选择音效，可以搜索"children game sound effects"，
通常能找到适合儿童游戏的温和音效！
