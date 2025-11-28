import Phaser from 'phaser';
import { getTitleFont, getBodyFont } from '../config/FontConfig';

/**
 * 按钮配置接口
 */
export interface ButtonConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  icon?: string;
  color: number;
  textColor?: string;
  fontSize?: string;
  strokeColor?: string;
  strokeThickness?: number;
  selected?: boolean;
  callback?: () => void;
  delay?: number;           // 入场动画延迟（毫秒）
  animationDuration?: number; // 入场动画时长（毫秒）
}

/**
 * 统一的按钮工厂类
 */
export default class ButtonFactory {
  /**
   * 创建标准按钮（圆角矩形）
   */
  static createButton(scene: Phaser.Scene, config: ButtonConfig): Phaser.GameObjects.Container {
    const {
      x,
      y,
      width,
      height,
      text,
      icon = '',
      color,
      textColor = '#ffffff',
      fontSize = '28px',
      strokeColor = '#000000',
      strokeThickness = 3,
      selected = false,
      callback,
      delay = 0,
      animationDuration = 400
    } = config;

    const container = scene.add.container(x, y);
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const radius = height / 2;
    
    // 如果有延迟，设置初始透明度为0
    if (delay > 0) {
      container.setAlpha(0);
    }

    // 按钮阴影
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);
    shadow.setPosition(4, 4);
    container.add(shadow);

    // 按钮背景
    const bg = scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);
    container.add(bg);

    // 选中状态的白色描边
    const outline = scene.add.graphics();
    if (selected) {
      outline.lineStyle(4, 0xFFFFFF, 1);
      outline.strokeRoundedRect(-halfWidth, -halfHeight, width, height, radius);
    }
    container.add(outline);

    // 按钮文字（图标+文字）
    const buttonText = scene.add.text(0, 0, `${icon} ${text}`, {
      fontFamily: getTitleFont(),
      fontSize: fontSize,
      color: textColor,
      stroke: strokeColor,
      strokeThickness: strokeThickness,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    buttonText.setOrigin(0.5);
    buttonText.setPadding(4, 4, 4, 4); // 防止emoji裁切
    container.add(buttonText);

    // 设置交互
    const hitArea = new Phaser.Geom.Rectangle(-halfWidth, -halfHeight, width, height);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input!.cursor = 'pointer';

    // 鼠标悬停效果
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(ButtonFactory.darkenColor(color, 0.2), 1);
      bg.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);

      scene.tweens.add({
        targets: container,
        scale: 1.08,
        duration: 150,
        ease: 'Power2'
      });
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);

      scene.tweens.add({
        targets: container,
        scale: 1,
        duration: 150,
        ease: 'Power2'
      });
    });

    // 点击事件
    if (callback) {
      container.on('pointerdown', () => {
        scene.tweens.add({
          targets: container,
          scale: 0.95,
          duration: 80,
          yoyo: true,
          ease: 'Power2',
          onComplete: callback
        });
      });
    }
    
    // 入场动画
    if (delay > 0) {
      scene.tweens.add({
        targets: container,
        alpha: 1,
        duration: animationDuration,
        delay: delay,
        ease: 'Back.easeOut'
      });
    }

    return container;
  }

  /**
   * 创建圆形按钮
   */
  static createCircleButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    radius: number,
    text: string,
    color: number,
    callback?: () => void
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);

    // 按钮阴影
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillCircle(0, 0, radius);
    shadow.setPosition(3, 3);
    container.add(shadow);

    // 按钮背景
    const bg = scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillCircle(0, 0, radius);
    container.add(bg);

    // 按钮文字
    const buttonText = scene.add.text(0, 0, text, {
      fontFamily: getTitleFont(),
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    buttonText.setOrigin(0.5);
    container.add(buttonText);

    // 设置交互
    const hitArea = new Phaser.Geom.Circle(0, 0, radius);
    container.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    container.input!.cursor = 'pointer';

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(ButtonFactory.darkenColor(color, 0.2), 1);
      bg.fillCircle(0, 0, radius);

      scene.tweens.add({
        targets: container,
        scale: 1.1,
        duration: 100
      });
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillCircle(0, 0, radius);

      scene.tweens.add({
        targets: container,
        scale: 1,
        duration: 100
      });
    });

    if (callback) {
      container.on('pointerdown', () => {
        scene.tweens.add({
          targets: container,
          scale: 0.9,
          duration: 50,
          yoyo: true,
          onComplete: callback
        });
      });
    }

    return container;
  }

  /**
   * 创建小型选择按钮（带勾选标记）
   */
  static createSelectButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    color: number,
    selected: boolean,
    callback?: () => void
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const radius = height / 2;

    // 按钮阴影
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);
    shadow.setPosition(3, 3);
    container.add(shadow);

    // 按钮背景
    const bg = scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);
    container.add(bg);

    // 按钮文字
    const buttonText = scene.add.text(0, 0, text, {
      fontFamily: getTitleFont(),
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    buttonText.setOrigin(0.5);
    container.add(buttonText);

    // 选中标记（右上角金色勾号）
    if (selected) {
      const checkMark = scene.add.text(halfWidth - 8, -halfHeight + 3, '✓', {
        fontFamily: getTitleFont(),
        fontSize: '24px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3,
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: '#000000',
          blur: 3,
          fill: true
        }
      });
      checkMark.setOrigin(0.5);
      container.add(checkMark);
    }

    // 设置交互
    const hitArea = new Phaser.Geom.Rectangle(-halfWidth, -halfHeight, width, height);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input!.cursor = 'pointer';

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(ButtonFactory.darkenColor(color, 0.2), 1);
      bg.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);

      scene.tweens.add({
        targets: container,
        scale: 1.1,
        duration: 100
      });
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);

      scene.tweens.add({
        targets: container,
        scale: 1,
        duration: 100
      });
    });

    if (callback) {
      container.on('pointerdown', () => {
        scene.tweens.add({
          targets: container,
          scale: 0.95,
          duration: 50,
          yoyo: true,
          onComplete: callback
        });
      });
    }

    return container;
  }

  /**
   * 创建带渐变的主按钮
   */
  static createGradientButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    icon: string,
    colorTop: number,
    colorBottom: number,
    callback?: () => void
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const radius = height / 2;

    // 按钮阴影
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);
    shadow.setPosition(5, 5);
    container.add(shadow);

    // 按钮背景（渐变）
    const bg = scene.add.graphics();
    bg.fillGradientStyle(colorTop, colorTop, colorBottom, colorBottom, 1);
    bg.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);
    container.add(bg);

    // 图标
    const iconText = scene.add.text(-35, 0, icon, {
      fontSize: '48px'
    });
    iconText.setOrigin(0.5);
    container.add(iconText);

    // 按钮文字
    const buttonText = scene.add.text(20, 0, text, {
      fontFamily: getTitleFont(),
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 6,
        fill: true
      }
    });
    buttonText.setOrigin(0, 0.5);
    container.add(buttonText);

    // 设置交互
    const hitArea = new Phaser.Geom.Rectangle(-halfWidth, -halfHeight, width, height);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input!.cursor = 'pointer';

    container.on('pointerover', () => {
      const darkerTop = ButtonFactory.darkenColor(colorTop, 0.2);
      const darkerBottom = ButtonFactory.darkenColor(colorBottom, 0.2);
      
      bg.clear();
      bg.fillGradientStyle(darkerTop, darkerTop, darkerBottom, darkerBottom, 1);
      bg.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);

      scene.tweens.add({
        targets: container,
        scale: 1.08,
        duration: 150,
        ease: 'Power2'
      });
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillGradientStyle(colorTop, colorTop, colorBottom, colorBottom, 1);
      bg.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);

      scene.tweens.add({
        targets: container,
        scale: 1,
        duration: 150,
        ease: 'Power2'
      });
    });

    if (callback) {
      container.on('pointerdown', () => {
        scene.tweens.add({
          targets: container,
          scale: 0.95,
          duration: 80,
          yoyo: true,
          ease: 'Power2',
          onComplete: callback
        });
      });
    }

    return container;
  }

  /**
   * 工具方法：加深颜色
   */
  private static darkenColor(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xFF) * (1 - factor));
    const g = Math.floor(((color >> 8) & 0xFF) * (1 - factor));
    const b = Math.floor((color & 0xFF) * (1 - factor));
    return (r << 16) | (g << 8) | b;
  }
}

