import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import LoginScene from './scenes/LoginScene';
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

// 获取屏幕尺寸（根据设备宽度做全屏适配）
function getScreenSize() {
  // 使用实际窗口尺寸，确保铺满屏幕
  const width = window.innerWidth || document.documentElement.clientWidth || 1280;
  const height = window.innerHeight || document.documentElement.clientHeight || 720;
  
  return {
    width: Math.max(width, 800), // 最小宽度 800px
    height: Math.max(height, 600) // 最小高度 600px
  };
}

const screenSize = getScreenSize();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: screenSize.width,
  height: screenSize.height,
  parent: 'game-container',
  backgroundColor: '#87CEEB',
  scale: {
    // 使用 RESIZE 模式，让画布自动适应容器大小，铺满整个屏幕
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // 响应式调整间隔
    resizeInterval: 100,
    // 全屏支持
    fullscreenTarget: 'game-container'
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
    LoginScene, // 登录场景
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
  
  // 处理横竖屏切换（刷新游戏画布以适应新尺寸）
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      const gameInstance = (window as any).game;
      if (gameInstance && gameInstance.scale) {
        // 更新游戏尺寸以适应新的屏幕尺寸
        const newWidth = window.innerWidth || document.documentElement.clientWidth || 1280;
        const newHeight = window.innerHeight || document.documentElement.clientHeight || 720;
        gameInstance.scale.resize(Math.max(newWidth, 800), Math.max(newHeight, 600));
      }
    }, 100);
  });
  
  // 处理窗口大小变化（实时调整游戏尺寸以适应屏幕）
  window.addEventListener('resize', () => {
    const gameInstance = (window as any).game;
    if (gameInstance && gameInstance.scale) {
      // 更新游戏尺寸以适应新的屏幕尺寸
      const newWidth = window.innerWidth || document.documentElement.clientWidth || 1280;
      const newHeight = window.innerHeight || document.documentElement.clientHeight || 720;
      gameInstance.scale.resize(Math.max(newWidth, 800), Math.max(newHeight, 600));
    }
  });
}

// 桌面端也支持窗口大小变化
if (!isMobile) {
  window.addEventListener('resize', () => {
    const gameInstance = (window as any).game;
    if (gameInstance && gameInstance.scale) {
      const newWidth = window.innerWidth || document.documentElement.clientWidth || 1280;
      const newHeight = window.innerHeight || document.documentElement.clientHeight || 720;
      gameInstance.scale.resize(Math.max(newWidth, 800), Math.max(newHeight, 600));
    }
  });
}
