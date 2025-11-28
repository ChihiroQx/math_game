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
import LevelLeaderboardScene from './scenes/LevelLeaderboardScene';

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
    SkinShopScene,
    LevelLeaderboardScene
  ]
};

// 防止重复创建游戏实例
let gameInstance: Phaser.Game | null = null;
let isCreatingGame = false;

// 等待字体加载完成
function waitForFont(fontFamily: string, callback: () => void) {
  // 如果游戏已经创建，不再重复创建
  if (gameInstance || isCreatingGame) {
    console.log('游戏实例已存在或正在创建，跳过');
    return;
  }
  
  if ('fonts' in document) {
    let hasCalled = false; // 防止重复调用 callback
    
    // 使用 Font Loading API 检测字体
    const checkFont = () => {
      if (hasCalled) return; // 防止重复调用
      
      // document.fonts.check() 返回布尔值，不是 Promise
      const loaded = (document as any).fonts.check(`12px "${fontFamily}"`);
      
      if (loaded) {
        console.log(`✅ 字体 ${fontFamily} 已加载`);
        hasCalled = true;
        callback();
      } else if (!hasCalled) {
        // 如果字体未加载，等待一段时间后重试
        console.log(`⏳ 等待字体 ${fontFamily} 加载...`);
        setTimeout(() => {
          if (hasCalled) return; // 防止重复调用
          
          const retryLoaded = (document as any).fonts.check(`12px "${fontFamily}"`);
          if (retryLoaded) {
            console.log(`✅ 字体 ${fontFamily} 已加载（重试成功）`);
          } else {
            console.warn(`⚠️ 字体 ${fontFamily} 未加载，使用备用字体`);
          }
          hasCalled = true;
          callback();
        }, 1000);
      }
    };
    
    // 等待字体加载完成
    (document as any).fonts.ready.then(() => {
      checkFont();
    });
    
    // 如果 fonts.ready 已经完成，直接检查（延迟一点避免重复）
    setTimeout(() => {
      if (!hasCalled) {
        checkFont();
      }
    }, 200);
  } else {
    // 不支持 Font Loading API，等待一段时间后继续
    console.log('⚠️ 浏览器不支持 Font Loading API，延迟加载游戏');
    setTimeout(callback, 500);
  }
}

// 等待多个字体加载完成
function waitForMultipleFonts(fontFamilies: string[], callback: () => void) {
  let loadedCount = 0;
  const totalFonts = fontFamilies.length;
  
  fontFamilies.forEach(fontFamily => {
    waitForFont(fontFamily, () => {
      loadedCount++;
      if (loadedCount === totalFonts) {
        callback();
      }
    });
  });
}

// 创建游戏实例（等待字体加载）
waitForMultipleFonts(['HappyCotton'], () => {
  // 防止重复创建
  if (gameInstance || isCreatingGame) {
    console.log('游戏实例已存在或正在创建，跳过');
    return;
  }
  
  isCreatingGame = true;
  console.log('开始创建游戏实例...');
  
  gameInstance = new Phaser.Game(config);
  
  // 将 game 实例暴露到全局，方便调试
  (window as any).game = gameInstance;
  
  isCreatingGame = false;
  console.log('游戏实例创建完成');
});

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
      const gameInstance = (window as any).game;
      if (!isPortrait && gameInstance && gameInstance.scale) {
        gameInstance.scale.refresh();
      }
    }, 100);
  });
  
  // 处理窗口大小变化（移动端浏览器工具栏显示/隐藏，仅在横屏时）
  window.addEventListener('resize', () => {
    const isPortrait = window.innerHeight > window.innerWidth;
    const gameInstance = (window as any).game;
    if (!isPortrait && gameInstance && gameInstance.scale) {
      gameInstance.scale.refresh();
    }
  });
}
