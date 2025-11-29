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

// 游戏设计尺寸（固定宽高比 16:9）
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: DESIGN_WIDTH, // 使用固定的设计宽度
  height: DESIGN_HEIGHT, // 使用固定的设计高度
  parent: 'game-container',
  backgroundColor: '#87CEEB',
  scale: {
    // 使用 FIT 模式：保持宽高比，尽可能铺满屏幕，元素不变形
    // FIT 模式会自动缩放游戏以适应容器，同时保持宽高比
    mode: Phaser.Scale.FIT,
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

// 等待字体加载完成（改进版，增加超时和错误处理）
function waitForFont(fontFamily: string, callback: () => void) {
  // 如果游戏已经创建，不再重复创建
  if (gameInstance || isCreatingGame) {
    console.log('游戏实例已存在或正在创建，跳过');
    return;
  }
  
  // 设置最大等待时间（3秒），超时后继续加载游戏
  const maxWaitTime = 3000;
  const startTime = Date.now();
  let hasCalled = false;
  
  const callCallback = () => {
    if (hasCalled) return;
    hasCalled = true;
    callback();
  };
  
  // 超时保护：即使字体未加载，也要继续加载游戏
  const timeoutId = setTimeout(() => {
    if (!hasCalled) {
      console.warn(`⚠️ 字体 ${fontFamily} 加载超时，使用备用字体继续加载游戏`);
      callCallback();
    }
  }, maxWaitTime);
  
  if ('fonts' in document) {
    // 使用 Font Loading API 检测字体
    const checkFont = () => {
      if (hasCalled) return;
      
      try {
        // document.fonts.check() 返回布尔值
        const loaded = (document as any).fonts.check(`12px "${fontFamily}"`);
        
        if (loaded) {
          console.log(`✅ 字体 ${fontFamily} 已加载`);
          clearTimeout(timeoutId);
          callCallback();
        } else {
          // 如果字体未加载，继续等待
          const elapsed = Date.now() - startTime;
          if (elapsed < maxWaitTime) {
            // 每500ms检查一次
            setTimeout(checkFont, 500);
          }
        }
      } catch (error) {
        console.warn(`⚠️ 字体检测出错:`, error);
        // 出错时也继续加载游戏
        clearTimeout(timeoutId);
        callCallback();
      }
    };
    
    // 等待字体加载完成
    try {
      (document as any).fonts.ready.then(() => {
        checkFont();
      }).catch((error: any) => {
        console.warn(`⚠️ fonts.ready 出错:`, error);
        clearTimeout(timeoutId);
        callCallback();
      });
    } catch (error) {
      console.warn(`⚠️ 无法访问 fonts API:`, error);
      clearTimeout(timeoutId);
      callCallback();
    }
    
    // 立即检查一次（如果字体已经加载）
    setTimeout(checkFont, 100);
  } else {
    // 不支持 Font Loading API，等待一段时间后继续
    console.log('⚠️ 浏览器不支持 Font Loading API，延迟加载游戏');
    clearTimeout(timeoutId);
    setTimeout(callCallback, 500);
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
  
  // 处理横竖屏切换（FIT 模式会自动保持宽高比并适应屏幕）
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      const gameInstance = (window as any).game;
      if (gameInstance && gameInstance.scale) {
        // FIT 模式会自动调整，保持宽高比，尽可能铺满屏幕
        gameInstance.scale.refresh();
      }
    }, 100);
  });
  
  // 处理窗口大小变化（FIT 模式会自动保持宽高比并适应屏幕）
  window.addEventListener('resize', () => {
    const gameInstance = (window as any).game;
    if (gameInstance && gameInstance.scale) {
      // FIT 模式会自动调整，保持宽高比，尽可能铺满屏幕
      gameInstance.scale.refresh();
      // 延迟通知所有场景进行重新布局，等待scale完全刷新
      setTimeout(() => {
        if (gameInstance.scene && gameInstance.scene.scenes) {
          gameInstance.scene.scenes.forEach((scene: Phaser.Scene) => {
            if (scene.scene.isActive() && typeof (scene as any).handleResize === 'function') {
              (scene as any).handleResize();
            }
          });
        }
      }, 150);
    }
  });
}

// 桌面端也支持窗口大小变化
if (!isMobile) {
  window.addEventListener('resize', () => {
    const gameInstance = (window as any).game;
    const container = document.getElementById('game-container');
    
    // 更新CSS变量
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh * 100}px`);
    
    // 确保容器可见且有正确尺寸
    if (container) {
      const computedStyle = getComputedStyle(container);
      // 如果容器被隐藏，强制显示
      if (computedStyle.display === 'none') {
        container.style.setProperty('display', 'flex', 'important');
      }
      // 确保容器占满整个视口
      container.style.setProperty('display', 'flex', 'important');
      container.style.setProperty('position', 'fixed', 'important');
      container.style.setProperty('top', '0', 'important');
      container.style.setProperty('left', '0', 'important');
      container.style.setProperty('right', '0', 'important');
      container.style.setProperty('bottom', '0', 'important');
      container.style.setProperty('width', '100vw', 'important');
      container.style.setProperty('height', '100vh', 'important');
    }
    
    if (gameInstance && gameInstance.scale) {
      // FIT 模式会自动调整，保持宽高比，尽可能铺满屏幕
      gameInstance.scale.refresh();
      
      // 延迟通知所有场景进行重新布局，等待scale完全刷新
      setTimeout(() => {
        if (gameInstance.scene && gameInstance.scene.scenes) {
          gameInstance.scene.scenes.forEach((scene: Phaser.Scene) => {
            if (scene.scene.isActive() && typeof (scene as any).handleResize === 'function') {
              (scene as any).handleResize();
            }
          });
        }
      }, 150);
    }
  });
}

// 监听全屏变化事件（所有平台）
const handleFullscreenChange = () => {
  // 更新CSS变量
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh * 100}px`);
  
  // 延迟处理，确保全屏切换动画完成
  setTimeout(() => {
    const gameInstance = (window as any).game;
    const container = document.getElementById('game-container');
    
    // 确保容器可见且有正确尺寸
    if (container) {
      // 强制设置容器样式，确保占满整个视口
      container.style.setProperty('display', 'flex', 'important');
      container.style.setProperty('position', 'fixed', 'important');
      container.style.setProperty('top', '0', 'important');
      container.style.setProperty('left', '0', 'important');
      container.style.setProperty('right', '0', 'important');
      container.style.setProperty('bottom', '0', 'important');
      container.style.setProperty('width', '100vw', 'important');
      container.style.setProperty('height', '100vh', 'important');
      container.style.setProperty('margin', '0', 'important');
      container.style.setProperty('padding', '0', 'important');
    }
    
    if (gameInstance && gameInstance.scale) {
      // 强制刷新scale
      gameInstance.scale.refresh();
      // 延迟通知所有场景进行重新布局
      setTimeout(() => {
        if (gameInstance.scene && gameInstance.scene.scenes) {
          gameInstance.scene.scenes.forEach((scene: Phaser.Scene) => {
            if (scene.scene.isActive() && typeof (scene as any).handleResize === 'function') {
              (scene as any).handleResize();
            }
          });
        }
      }, 200);
    }
  }, 150);
};

// 监听各种全屏变化事件
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);
