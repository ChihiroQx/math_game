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
// 检测是否为移动设备
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // 移动端优化
    ...(isMobile && {
      // 移动端保持 FIT 模式（保持宽高比，避免变形）
      // 但允许动态调整以适应不同屏幕
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      // 响应式调整间隔
      resizeInterval: 100
    })
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  // 移动端性能优化
  ...(isMobile && {
    fps: {
      target: 60,
      forceSetTimeOut: false
    },
    render: {
      antialias: false, // 移动端关闭抗锯齿提升性能
      pixelArt: false
    }
  }),
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

// 移动端优化：禁用默认触摸行为
if (isMobile) {
  // 禁用双击缩放
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // 禁用长按菜单
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  
  // 处理横竖屏切换（仅在横屏时刷新）
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      // 只在横屏时刷新游戏画布
      const isPortrait = window.innerHeight > window.innerWidth;
      if (!isPortrait && game && game.scale) {
        game.scale.refresh();
      }
    }, 100);
  });
  
  // 处理窗口大小变化（移动端浏览器工具栏显示/隐藏，仅在横屏时）
  window.addEventListener('resize', () => {
    const isPortrait = window.innerHeight > window.innerWidth;
    if (!isPortrait && game && game.scale) {
      game.scale.refresh();
    }
  });
}
