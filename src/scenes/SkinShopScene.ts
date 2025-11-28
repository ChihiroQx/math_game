import Phaser from 'phaser';
import DataManager from '../managers/DataManager';
import ResourceManager from '../managers/ResourceManager';
import ButtonFactory from '../utils/ButtonFactory';
import { CHARACTERS, CharacterData, getAllCharacters, extractFolderFromAssetPath } from '../config/CharacterConfig';

/**
 * 皮肤商店场景
 */
export default class SkinShopScene extends Phaser.Scene {
  private stars: Phaser.GameObjects.Graphics[] = [];
  private characterContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  
  constructor() {
    super({ key: 'SkinShopScene' });
  }
  
  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 设置资源管理器场景
    ResourceManager.getInstance().setScene(this);
    
    // 背景
    this.createBackground();
    
    // 星星装饰
    this.createStarDecorations();
    
    // 标题
    this.createTitle(width);
    
    // 返回按钮
    this.createBackButton();
    
    // 玩家金币显示
    this.createCoinDisplay(width);
    
    // 先创建皮肤列表（显示卡片）
    this.createSkinList(width, height);
    
    // 然后异步加载所有角色资源
    this.loadAllCharactersForShop();
  }
  
  /**
   * 为皮肤商店异步加载所有角色资源
   */
  private async loadAllCharactersForShop(): Promise<void> {
    const resourceManager = ResourceManager.getInstance();
    const characters = getAllCharacters();
    
    // 收集所有需要加载的角色ID
    const charactersToLoad: string[] = [];
    
    for (const character of characters) {
      if (resourceManager.isCharacterLoaded(character.id)) {
        // 资源已加载，更新预览
        this.updateCharacterPreview(character.id);
      } else {
        // 需要加载
        charactersToLoad.push(character.id);
      }
    }
    
    // 如果没有需要加载的角色，直接返回
    if (charactersToLoad.length === 0) {
      return;
    }
    
    // 批量加载所有角色资源（逐个加载，避免一个失败影响全部）
    console.log(`开始加载 ${charactersToLoad.length} 个角色资源...`);
    
    const loadPromises = charactersToLoad.map(async (id) => {
      try {
        await resourceManager.loadCharacter(id);
        // 加载成功后，延迟更新预览
        this.time.delayedCall(50, () => {
          this.updateCharacterPreview(id);
        });
        return { id, success: true };
      } catch (error) {
        console.error(`加载角色资源失败: ${id}`, error);
        return { id, success: false, error };
      }
    });
    
    const results = await Promise.all(loadPromises);
    const successCount = results.filter(r => r.success).length;
    console.log(`角色资源加载完成，成功: ${successCount}/${charactersToLoad.length}`);
  }
  
  /**
   * 更新角色预览（资源加载完成后调用）
   */
  private updateCharacterPreview(characterId: string): void {
    const container = this.characterContainers.get(characterId);
    if (!container) {
      console.warn(`容器不存在: ${characterId}`);
      return;
    }
    
    const character = getAllCharacters().find(c => c.id === characterId);
    if (!character) {
      console.warn(`角色配置不存在: ${characterId}`);
      return;
    }
    
    // 从assetPath提取atlas key（文件夹名）
    const atlasKey = extractFolderFromAssetPath(character.assetPath);
    const firstFrameName = `${character.spritePrefix}_wait_001.png`; // 完整帧名，包含.png
    const waitAnimKey = `${character.spritePrefix}_wait`;
    
    // 检查atlas是否存在
    if (!this.textures.exists(atlasKey)) {
      console.warn(`Atlas不存在: ${atlasKey}, characterId: ${characterId}`);
      return;
    }
    
    // 检查帧是否存在
    const atlas = this.textures.get(atlasKey);
    if (!atlas.has(firstFrameName)) {
      console.warn(`帧不存在: ${firstFrameName} in atlas ${atlasKey}`);
      return;
    }
    
    console.log(`准备更新预览: ${characterId}, atlasKey: ${atlasKey}, frame: ${firstFrameName}`);
    
    // 移除占位符和加载文本
    const toRemove: Phaser.GameObjects.GameObject[] = [];
    container.list.forEach((child: any) => {
      if (child.getData && (
        child.getData('isPlaceholder') || 
        child.getData('isLoadingText')
      )) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(child => {
      container.remove(child);
      child.destroy();
    });
    
    // 获取容器高度（从卡片配置中获取）
    const cardHeight = 165; // 与 createSkinCard 中的 cardHeight 保持一致
    
    // 创建预览精灵（使用atlas key和完整帧名）
    const previewSprite = this.add.sprite(80, cardHeight - 15, atlasKey, firstFrameName);
    previewSprite.setScale(character.scale * 1.25);
    previewSprite.setOrigin(0.5, 1);
    
    // 播放待机动画（如果动画存在）
    if (this.anims.exists(waitAnimKey)) {
      previewSprite.play(waitAnimKey);
    }
    
    container.add(previewSprite);
    
    console.log(`已更新角色预览: ${characterId}`);
  }
  
  
  update(): void {
    // 星星闪烁动画
    this.stars.forEach((star, index) => {
      const time = this.time.now / 1000;
      const alpha = 0.3 + Math.sin(time * 2 + index) * 0.3;
      star.setAlpha(alpha);
    });
  }
  
  /**
   * 创建背景
   */
  private createBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      0x87CEEB,
      0x87CEEB,
      0xE6B0FF,
      0xFFB6E1,
      1
    );
    graphics.fillRect(0, 0, width, height);
  }
  
  /**
   * 创建星星装饰
   */
  private createStarDecorations(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height * 0.3);
      const size = Phaser.Math.Between(2, 4);
      
      const star = this.add.graphics();
      star.fillStyle(0xFFFFFF, 1);
      star.fillCircle(x, y, size);
      
      this.stars.push(star);
      
      this.tweens.add({
        targets: star,
        alpha: 0.3,
        duration: Phaser.Math.Between(1000, 2000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  /**
   * 创建标题
   */
  private createTitle(width: number): void {
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0xFFFFFF, 0.2);
    titleBg.fillRoundedRect(width / 2 - 200, 35, 400, 70, 15);
    
    const title = this.add.text(width / 2, 70, '🎨 皮肤商店', {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '56px',
      color: '#FFD700',
      stroke: '#FF69B4',
      strokeThickness: 8,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 6,
        fill: true
      }
    });
    title.setOrigin(0.5);
    title.setAlpha(0);
    title.setPadding(4, 4, 4, 4);
    
    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 600,
      ease: 'Back.easeOut'
    });
  }
  
  /**
   * 创建返回按钮
   */
  private createBackButton(): void {
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
  }
  
  /**
   * 创建金币显示
   */
  private createCoinDisplay(width: number): void {
    const data = DataManager.getInstance().playerData;
    
    const coinCardBg = this.add.graphics();
    coinCardBg.fillStyle(0xFFD700, 0.3);
    coinCardBg.fillRoundedRect(width - 200, 50, 180, 50, 25);
    
    const coinText = this.add.text(width - 110, 75, `💰 ${data.coins}`, {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '28px',
      color: '#FFD700',
      stroke: '#8B4513',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    coinText.setOrigin(0.5);
    coinText.setPadding(4, 4, 4, 4);
  }
  
  /**
   * 创建占位符（资源未加载时显示）
   */
  private createPlaceholder(container: Phaser.GameObjects.Container, height: number): void {
    const placeholder = this.add.graphics();
    placeholder.fillStyle(0x888888, 0.5);
    placeholder.fillRect(40, height - 60, 80, 80);
    placeholder.setAlpha(0.5);
    placeholder.setData('isPlaceholder', true);
    container.add(placeholder);
    
    const loadingText = this.add.text(80, height - 20, '加载中...', {
      fontFamily: 'Arial, Microsoft YaHei',
      fontSize: '12px',
      color: '#FFFFFF'
    });
    loadingText.setOrigin(0.5);
    loadingText.setData('isLoadingText', true);
    container.add(loadingText);
  }
  
  /**
   * 创建皮肤列表
   */
  private createSkinList(width: number, height: number): void {
    const characters = getAllCharacters();
    const data = DataManager.getInstance();
    
    const startY = 135;
    const cardWidth = 380;
    const cardHeight = 165;  // 减小高度
    const cardsPerRow = 2;
    const spacingX = 40;
    const spacingY = 18;     // 减小行间距
    
    characters.forEach((character, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      
      const totalWidth = cardWidth * cardsPerRow + spacingX * (cardsPerRow - 1);
      const x = (width - totalWidth) / 2 + col * (cardWidth + spacingX);
      const y = startY + row * (cardHeight + spacingY);
      
      this.createSkinCard(x, y, cardWidth, cardHeight, character, index);
    });
  }
  
  /**
   * 创建单个皮肤卡片
   */
  private createSkinCard(
    x: number,
    y: number,
    width: number,
    height: number,
    character: CharacterData,
    index: number
  ): void {
    const data = DataManager.getInstance();
    const isOwned = data.isCharacterOwned(character.id);
    const isEquipped = data.playerData.currentCharacter === character.id;
    
    const container = this.add.container(x, y);
    container.setAlpha(0);
    
    // 保存容器引用，用于后续更新
    this.characterContainers.set(character.id, container);
    
    // 卡片背景
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xFFFFFF, 0.3);
    cardBg.fillRoundedRect(0, 0, width, height, 15);
    
    if (isEquipped) {
      // 当前使用的皮肤显示金色边框
      cardBg.lineStyle(4, 0xFFD700, 1);
      cardBg.strokeRoundedRect(0, 0, width, height, 15);
    }
    
    container.add(cardBg);
    
    // 角色预览 - 显示真实的角色待机动画
    // 从assetPath提取atlas key（文件夹名）
    const atlasKey = extractFolderFromAssetPath(character.assetPath);
    const firstFrameName = `${character.spritePrefix}_wait_001.png`; // 完整帧名，包含.png
    const waitAnimKey = `${character.spritePrefix}_wait`;
    
    // 检查atlas是否存在
    if (this.textures.exists(atlasKey)) {
      const atlas = this.textures.get(atlasKey);
      // 检查帧是否存在
      if (atlas.has(firstFrameName)) {
        const previewSprite = this.add.sprite(80, height - 15, atlasKey, firstFrameName);
        previewSprite.setScale(character.scale * 1.25); // 稍微缩小适应新高度
        previewSprite.setOrigin(0.5, 1); // 底部中心锚点
        
        // 播放待机动画（如果动画存在）
        if (this.anims.exists(waitAnimKey)) {
          previewSprite.play(waitAnimKey);
        }
        
        container.add(previewSprite);
      } else {
        // 帧不存在，显示占位符
        this.createPlaceholder(container, height);
      }
    } else {
      // 资源未加载，显示占位符
      this.createPlaceholder(container, height);
    }
    
    // 称号-名字（适中的描边和阴影）
    const fullName = `${character.title}-${character.name}`;
    const nameText = this.add.text(160, 22, fullName, {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '22px',
      color: character.color,
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    });
    nameText.setOrigin(0, 0);
    container.add(nameText);
    
    // 角色描述 - 细描边+阴影
    const descText = this.add.text(160, 57, character.description, {
      fontFamily: 'Arial, Microsoft YaHei',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#333333',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      },
      wordWrap: { width: width - 180, useAdvancedWrap: true }
    });
    descText.setOrigin(0, 0);
    container.add(descText);
    
    // 底部按钮/状态
    const buttonY = height - 28;
    
    if (isEquipped) {
      // 当前使用
      const equippedText = this.add.text(width / 2, buttonY, '✓ 使用中', {
        fontFamily: 'Arial Black, Microsoft YaHei',
        fontSize: '20px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 2
      });
      equippedText.setOrigin(0.5);
      equippedText.setPadding(4, 4, 4, 4);
      container.add(equippedText);
    } else if (isOwned) {
      // 已拥有，可装备
      const equipBtn = ButtonFactory.createButton(this, {
        x: x + width / 2,
        y: y + buttonY,
        width: 120,
        height: 42,
        text: '装备',
        color: 0x27AE60,
        fontSize: '20px',
        callback: () => {
          data.setCurrentCharacter(character.id);
          this.scene.restart(); // 刷新界面
        }
      });
      equipBtn.setDepth(1);
    } else {
      // 未拥有，显示价格
      if (character.isDefault) {
        const freeText = this.add.text(width / 2, buttonY, '免费', {
          fontFamily: 'Arial Black, Microsoft YaHei',
          fontSize: '20px',
          color: '#27AE60',
          stroke: '#000000',
          strokeThickness: 2
        });
        freeText.setOrigin(0.5);
        container.add(freeText);
      } else {
        // 购买按钮 - 金币足够显示绿色，不足显示红色
        const canAfford = data.playerData.coins >= character.price;
        const buyBtn = ButtonFactory.createButton(this, {
          x: x + width / 2,
          y: y + buttonY,
          width: 150,
          height: 42,
          text: `💰 ${character.price}`,
          color: canAfford ? 0x27AE60 : 0xE74C3C,  // 足够=绿色，不足=红色
          fontSize: '20px',
          callback: () => {
            if (canAfford) {
              this.purchaseSkin(character);
            } else {
              this.showInsufficientCoinsMessage();
            }
          }
        });
        buyBtn.setDepth(1);
      }
    }
    
    // 入场动画
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: y,
      duration: 400,
      delay: index * 100,
      ease: 'Back.easeOut'
    });
  }
  
  /**
   * 购买皮肤
   */
  private purchaseSkin(character: CharacterData): void {
    const data = DataManager.getInstance();
    
    if (data.purchaseCharacter(character.id, character.price)) {
      // 购买成功
      this.showMessage('✅ 购买成功！', 0x27AE60);
      this.scene.restart(); // 刷新界面
    } else {
      // 购买失败（金币不足）
      this.showInsufficientCoinsMessage();
    }
  }
  
  /**
   * 显示金币不足消息
   */
  private showInsufficientCoinsMessage(): void {
    this.showMessage('❌ 金币不足！', 0xE74C3C);
  }
  
  /**
   * 显示消息
   */
  private showMessage(text: string, color: number): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const messageBg = this.add.graphics();
    messageBg.fillStyle(color, 0.9);
    messageBg.fillRoundedRect(width / 2 - 150, height / 2 - 40, 300, 80, 15);
    messageBg.setDepth(1000);
    
    const messageText = this.add.text(width / 2, height / 2, text, {
      fontFamily: 'Arial Black, Microsoft YaHei',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    messageText.setOrigin(0.5);
    messageText.setDepth(1001);
    
    // 2秒后消失
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: [messageBg, messageText],
        alpha: 0,
        duration: 300,
        onComplete: () => {
          messageBg.destroy();
          messageText.destroy();
        }
      });
    });
  }
}

