import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MainMenuScene from './scenes/MainMenuScene';
import WorldMapScene from './scenes/WorldMapScene';
import GamePlayScene from './scenes/GamePlayScene';
import GameOverScene from './scenes/GameOverScene';
import LeaderboardScene from './scenes/LeaderboardScene';
import SettingsScene from './scenes/SettingsScene';
import SkinShopScene from './scenes/SkinShopScene';

/**
 * 游戏配置
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    WorldMapScene,
    GamePlayScene,
    GameOverScene,
    LeaderboardScene,
    SettingsScene,
    SkinShopScene
  ]
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 隐藏加载提示
window.addEventListener('load', () => {
  const loading = document.getElementById('loading');
  if (loading) {
    setTimeout(() => {
      loading.style.display = 'none';
    }, 500);
  }
});
