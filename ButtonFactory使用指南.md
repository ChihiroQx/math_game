# ButtonFactory 统一按钮工具类使用指南

## 📦 概述

`ButtonFactory` 是一个统一的按钮创建工具类，提供了多种类型的按钮创建方法，避免在各个场景中重复编写按钮代码。

---

## 🎯 核心功能

### 1. **标准按钮** - `createButton()`
创建圆角矩形按钮，支持图标、选中状态、自定义颜色等。

#### 使用示例

```typescript
import ButtonFactory from '../utils/ButtonFactory';

// 创建一个标准按钮
ButtonFactory.createButton(this, {
  x: 400,              // X坐标
  y: 300,              // Y坐标
  width: 220,          // 宽度
  height: 54,          // 高度
  text: '开始游戏',    // 按钮文字
  icon: '🎮',          // 图标（可选）
  color: 0xFF69B4,     // 背景颜色
  textColor: '#ffffff', // 文字颜色（可选）
  fontSize: '32px',    // 字体大小（可选）
  strokeColor: '#000000', // 描边颜色（可选）
  strokeThickness: 3,  // 描边粗细（可选）
  selected: false,     // 是否选中（可选）
  callback: () => {    // 点击回调
    this.scene.start('GamePlayScene');
  }
});
```

#### 选中状态
当 `selected: true` 时，按钮会显示**白色描边**：

```typescript
ButtonFactory.createButton(this, {
  x: 400,
  y: 300,
  width: 220,
  height: 54,
  text: '当前选中',
  icon: '✓',
  color: 0x27ae60,
  selected: true,  // 显示白色描边
  callback: () => { /* ... */ }
});
```

---

### 2. **圆形按钮** - `createCircleButton()`
创建圆形按钮，适合+/-符号或单个字符。

#### 使用示例

```typescript
// 音量减少按钮
ButtonFactory.createCircleButton(
  this,        // scene
  350,         // x
  200,         // y
  25,          // 半径
  '−',         // 文字
  0x3498db,    // 颜色
  () => {      // 回调
    // 减少音量
  }
);

// 音量增加按钮
ButtonFactory.createCircleButton(
  this,
  450,
  200,
  25,
  '+',
  0x3498db,
  () => {
    // 增加音量
  }
);
```

---

### 3. **选择按钮** - `createSelectButton()`
创建带勾选标记的按钮，适合多选项场景。

#### 使用示例

```typescript
const timeLimits = [10, 15, 20, 30];
const currentSelection = 20;

timeLimits.forEach((minutes, index) => {
  ButtonFactory.createSelectButton(
    this,
    300 + index * 90,  // x
    400,                // y
    70,                 // width
    44,                 // height
    `${minutes}分`,     // text
    currentSelection === minutes ? 0x27ae60 : 0x3498db, // 选中绿色，未选中蓝色
    currentSelection === minutes, // selected
    () => {
      // 选择该时长
    }
  );
});
```

**效果：**
- 未选中：蓝色背景
- 选中：绿色背景 + 右上角金色✓标记

---

### 4. **渐变按钮** - `createGradientButton()`
创建带渐变背景的主按钮，更醒目。

#### 使用示例

```typescript
ButtonFactory.createGradientButton(
  this,
  400,           // x
  300,           // y
  300,           // width
  80,            // height
  '开始冒险',    // text
  '🎮',          // icon
  0xFF69B4,      // 顶部颜色
  0xFF1493,      // 底部颜色
  () => {
    this.scene.start('WorldMapScene');
  }
);
```

**效果：**
- 从上到下的颜色渐变
- 图标在左侧，文字在右侧
- 更大的阴影效果

---

## 🎨 按钮特性

### 所有按钮都包含：

1. **阴影效果**
   - 黑色半透明阴影
   - 偏移3-5px
   - 增强立体感

2. **交互动画**
   - **悬停**：颜色变深 + 放大1.05-1.1x
   - **点击**：缩小0.95x + 反弹
   - **鼠标样式**：pointer

3. **文字样式**
   - 黑色描边（默认3px）
   - 阴影效果
   - Arial Black + 微软雅黑字体

4. **响应式设计**
   - 自动计算中心点
   - 支持任意大小

---

## 📋 在各场景中使用

### 示例1：主菜单按钮

```typescript
// MainMenuScene.ts
import ButtonFactory from '../utils/ButtonFactory';

private createMenuButtons(): void {
  const buttons = [
    { text: '开始冒险', icon: '🎮', color: 0xFF69B4 },
    { text: '继续游戏', icon: '▶️', color: 0xFF1493 },
    { text: '排行榜', icon: '🏆', color: 0xFFB6C1 },
    { text: '设置', icon: '⚙️', color: 0xFFA0C8 }
  ];

  buttons.forEach((btn, index) => {
    ButtonFactory.createButton(this, {
      x: 400,
      y: 250 + index * 90,
      width: 250,
      height: 70,
      text: btn.text,
      icon: btn.icon,
      color: btn.color,
      callback: () => {
        // 对应场景逻辑
      }
    });
  });
}
```

### 示例2：设置页返回按钮

```typescript
// SettingsScene.ts
ButtonFactory.createButton(this, {
  x: 100,
  y: 70,
  width: 130,
  height: 44,
  text: '返回',
  icon: '←',
  color: 0xFF69B4,
  fontSize: '28px',
  callback: () => {
    this.scene.start('MainMenuScene');
  }
});
```

### 示例3：游戏结算页按钮

```typescript
// GameOverScene.ts
// 下一关按钮
ButtonFactory.createButton(this, {
  x: 300,
  y: 500,
  width: 220,
  height: 54,
  text: '下一关',
  icon: '▶️',
  color: 0x27ae60,
  callback: () => {
    this.scene.start('WorldMapScene');
  }
});

// 重新挑战按钮
ButtonFactory.createButton(this, {
  x: 500,
  y: 500,
  width: 220,
  height: 54,
  text: '重新挑战',
  icon: '🔄',
  color: 0xFF69B4,
  callback: () => {
    this.scene.start('GamePlayScene');
  }
});
```

---

## ✨ 配置参数说明

### ButtonConfig 接口

```typescript
interface ButtonConfig {
  x: number;              // X坐标（必填）
  y: number;              // Y坐标（必填）
  width: number;          // 宽度（必填）
  height: number;         // 高度（必填）
  text: string;           // 按钮文字（必填）
  icon?: string;          // 图标（可选）
  color: number;          // 背景颜色，如 0xFF69B4（必填）
  textColor?: string;     // 文字颜色，默认 '#ffffff'
  fontSize?: string;      // 字体大小，默认 '28px'
  strokeColor?: string;   // 描边颜色，默认 '#000000'
  strokeThickness?: number; // 描边粗细，默认 3
  selected?: boolean;     // 是否选中（显示白色描边），默认 false
  callback?: () => void;  // 点击回调（可选）
}
```

---

## 🎯 最佳实践

### 1. **统一尺寸**
建议使用标准尺寸：
- 小按钮：70x44
- 中按钮：130x44
- 大按钮：220x54
- 超大按钮：280x60

### 2. **颜色方案**
推荐使用统一的配色：
- 主色：0xFF69B4（粉红）
- 次色：0xFF1493（深粉）
- 成功：0x27ae60（绿色）
- 警告：0xe74c3c（红色）
- 信息：0x3498db（蓝色）

### 3. **图标使用**
- 使用emoji图标更生动
- 建议图标+文字组合
- 图标在文字前面

### 4. **命名规范**
```typescript
// ✅ 好的命名
ButtonFactory.createButton(this, {
  text: '开始游戏',
  callback: () => this.startGame()
});

// ❌ 避免
ButtonFactory.createButton(this, {
  text: 'btn1',
  callback: () => this.func()
});
```

---

## 🔧 高级技巧

### 1. **动态更新按钮状态**

```typescript
const button = ButtonFactory.createButton(this, {
  x: 400,
  y: 300,
  width: 220,
  height: 54,
  text: '未选中',
  color: 0x3498db,
  selected: false,
  callback: () => {
    // 点击后销毁并重新创建为选中状态
    button.destroy();
    ButtonFactory.createButton(this, {
      x: 400,
      y: 300,
      width: 220,
      height: 54,
      text: '已选中',
      color: 0x27ae60,
      selected: true,
      callback: () => { /* ... */ }
    });
  }
});
```

### 2. **批量创建按钮**

```typescript
const buttonData = [
  { text: '选项1', selected: true },
  { text: '选项2', selected: false },
  { text: '选项3', selected: false }
];

buttonData.forEach((data, index) => {
  ButtonFactory.createButton(this, {
    x: 400,
    y: 200 + index * 80,
    width: 200,
    height: 50,
    text: data.text,
    color: data.selected ? 0x27ae60 : 0x3498db,
    selected: data.selected,
    callback: () => {
      console.log(`${data.text} clicked`);
    }
  });
});
```

---

## 🎮 完整示例场景

```typescript
import Phaser from 'phaser';
import ButtonFactory from '../utils/ButtonFactory';

export default class ExampleScene extends Phaser.Scene {
  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 主按钮
    ButtonFactory.createGradientButton(
      this,
      width / 2,
      height * 0.3,
      300,
      80,
      '开始游戏',
      '🎮',
      0xFF69B4,
      0xFF1493,
      () => this.scene.start('GamePlayScene')
    );

    // 圆形按钮
    ButtonFactory.createCircleButton(
      this,
      width / 2 - 50,
      height * 0.5,
      30,
      '−',
      0x3498db,
      () => console.log('Decrease')
    );

    ButtonFactory.createCircleButton(
      this,
      width / 2 + 50,
      height * 0.5,
      30,
      '+',
      0x3498db,
      () => console.log('Increase')
    );

    // 选择按钮组
    [10, 20, 30].forEach((value, index) => {
      ButtonFactory.createSelectButton(
        this,
        width / 2 - 100 + index * 100,
        height * 0.7,
        80,
        50,
        `${value}`,
        value === 20 ? 0x27ae60 : 0x3498db,
        value === 20,
        () => console.log(`Selected: ${value}`)
      );
    });

    // 返回按钮
    ButtonFactory.createButton(this, {
      x: 100,
      y: 50,
      width: 130,
      height: 44,
      text: '返回',
      icon: '←',
      color: 0xFF69B4,
      callback: () => this.scene.start('MainMenuScene')
    });
  }
}
```

---

## 📝 总结

使用 `ButtonFactory` 的好处：

✅ **代码复用**：避免重复编写按钮代码  
✅ **样式统一**：所有按钮风格一致  
✅ **易于维护**：修改一处，全局生效  
✅ **灵活配置**：支持各种参数定制  
✅ **选中状态**：统一的白色描边效果  
✅ **完整交互**：悬停、点击动画自动处理  

现在您可以在所有场景中使用这个统一的按钮工厂类了！🎉

