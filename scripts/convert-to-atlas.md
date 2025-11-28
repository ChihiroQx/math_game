# 📦 转换为Sprite Atlas指南

## 🎯 目标

将现有的序列帧图片转换为Sprite Atlas（精灵图集），大幅减少HTTP请求和加载时间。

---

## 📋 准备工作

### 1. 安装TexturePacker

**选项A：使用免费工具 Shoebox**
- 下载：https://renderhjs.net/shoebox/
- 完全免费，功能足够

**选项B：使用TexturePacker（推荐）**
- 下载：https://www.codeandweb.com/texturepacker
- 有免费版，功能更强大
- 支持命令行批量处理

**选项C：在线工具**
- https://www.codeandweb.com/free-texture-packer
- 适合小规模使用

---

## 🔧 转换步骤

### 步骤1：准备资源

确保所有序列帧图片都在正确的位置：
```
assets/res/player/307/
  ├─ mage_307_wait_001.png
  ├─ mage_307_wait_002.png
  ├─ ...
  ├─ mage_307_attack_001.png
  └─ ...
```

### 步骤2：使用TexturePacker生成图集

#### 方法A：使用Shoebox（免费）

1. 打开Shoebox
2. 选择 "Texture Atlas" 工具
3. 拖入角色文件夹（如 `307/`）
4. 设置输出路径和格式：
   - **Format**: JSON (Phaser)
   - **Output**: `assets/res/player/307/`
   - **Name**: `mage_307`
5. 点击 "Create Atlas"
6. 生成文件：
   - `mage_307.png` (大图)
   - `mage_307.json` (配置)

#### 方法B：使用TexturePacker

1. 打开TexturePacker
2. 创建新项目
3. 添加资源文件夹（如 `307/`）
4. 设置：
   - **Data format**: JSON (Phaser)
   - **Texture format**: PNG
   - **Max size**: 2048×2048
   - **Algorithm**: MaxRects
5. 发布到 `assets/res/player/307/`
6. 命名：`mage_307`

### 步骤3：批量生成

对每个角色和怪物重复步骤2，或使用命令行批量处理。

---

## 📝 生成的文件结构

转换后，每个角色/怪物会有：

```
assets/res/player/307/
  ├─ mage_307.png      (图集大图)
  └─ mage_307.json     (帧配置)
```

**不再需要**：
- ❌ `mage_307_wait_001.png` 等单个文件（可删除或备份）

---

## 🔄 修改代码

### 1. 修改ResourceManager

将单个图片加载改为atlas加载：

```typescript
// 旧代码（单个图片）
private loadCharacterSprites(characterId: string, folder: string): void {
  for (let i = 1; i <= 12; i++) {
    const key = `${prefix}_wait_${i.toString().padStart(3, '0')}`;
    this.scene.load.image(key, basePath + file);
  }
}

// 新代码（atlas）
private loadCharacterSprites(characterId: string, folder: string): void {
  const basePath = `assets/res/player/${folder}/`;
  this.scene.load.atlas(
    characterId,
    `${basePath}${characterId}.png`,
    `${basePath}${characterId}.json`
  );
}
```

### 2. 修改动画创建

```typescript
// 旧代码
const waitFrames: any[] = [];
for (let i = 1; i <= 12; i++) {
  waitFrames.push({ 
    key: `${characterId}_wait_${i.toString().padStart(3, '0')}`,
    frame: 0
  });
}

// 新代码（使用atlas）
this.scene.anims.create({
  key: `${characterId}_wait`,
  frames: this.scene.anims.generateFrameNames(characterId, {
    prefix: `${characterId}_wait_`,
    start: 1,
    end: 12,
    zeroPad: 3,
    suffix: ''
  }),
  frameRate: 12,
  repeat: -1
});
```

---

## ✅ 验证清单

- [ ] 所有角色图集已生成
- [ ] 所有怪物图集已生成
- [ ] JSON配置文件格式正确
- [ ] 修改了ResourceManager加载代码
- [ ] 修改了PreloadScene加载代码
- [ ] 修改了动画创建代码
- [ ] 测试加载正常
- [ ] 测试动画播放正常
- [ ] 备份了原始序列帧文件

---

## 🚀 快速开始

1. **生成配置**（可选）：
   ```bash
   node scripts/create-atlas-config.js
   ```

2. **使用TexturePacker生成图集**

3. **修改代码**（我会帮您完成）

4. **测试验证**

---

## 💡 提示

- **图集大小**：建议不超过2048×2048，如果太大可以分成多个图集
- **命名规范**：保持与原序列帧相同的命名（如 `mage_307_wait_001`）
- **备份**：转换前备份原始文件
- **测试**：逐个角色/怪物测试，确保无误

---

需要我帮您修改代码吗？告诉我您想先转换哪个部分（角色/怪物/特效）！

