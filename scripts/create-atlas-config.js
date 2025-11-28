/**
 * TexturePacker 配置文件生成器
 * 为每个角色和怪物生成TexturePacker配置
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/res');
const OUTPUT_DIR = path.join(__dirname, '../atlas-configs');

// 角色配置
const CHARACTERS = [
  { id: 'mage_307', folder: '307' },
  { id: 'mage_119', folder: '119' },
  { id: 'mage_303', folder: '303' },
  { id: 'mage_311', folder: '311' },
  { id: 'mage_335', folder: '335' },
  { id: 'mage_315', folder: '315' }
];

// 怪物配置
const MONSTERS = [
  { id: 'monster1', folder: 'monster', prefix: 'monster' },
  { id: 'monster2', folder: 'monster1', prefix: 'monster1' },
  { id: 'monster3', folder: 'monster004', prefix: 'monster004' },
  { id: 'monster4', folder: 'monster005', prefix: 'monster005' },
  { id: 'monster5', folder: 'monster006', prefix: 'monster006' },
  { id: 'monster6', folder: 'monster007', prefix: 'monster007' },
  { id: 'monster7', folder: 'monster002', prefix: 'monster002' },
  { id: 'monster8', folder: 'monster009', prefix: 'monster009' }
];

// TexturePacker JSON配置模板
function createTexturePackerConfig(name, frames) {
  return {
    "appVersion": "1.0.0",
    "name": name,
    "width": 2048,
    "height": 2048,
    "format": "RGBA8888",
    "scale": 1,
    "smartUpdate": false,
    "premultiplyAlpha": false,
    "textureFilter": "Linear",
    "wrap": "clampToEdge",
    "frames": frames.map(frame => ({
      "filename": frame.filename,
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": frame.width, "h": frame.height },
      "sourceSize": { "w": frame.width, "h": frame.height },
      "frame": { "x": 0, "y": 0, "w": frame.width, "h": frame.height }
    }))
  };
}

// 生成角色图集配置
function generateCharacterAtlasConfig(character) {
  const frames = [];
  const basePath = path.join(ASSETS_DIR, 'player', character.folder);
  
  // 待机动画（12帧）
  for (let i = 1; i <= 12; i++) {
    const filename = `${character.id}_wait_${i.toString().padStart(3, '0')}.png`;
    const filePath = path.join(basePath, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      // 假设图片尺寸（需要实际读取）
      frames.push({
        filename: filename,
        width: 200, // 需要实际读取
        height: 200
      });
    }
  }
  
  // 攻击动画（12帧）
  for (let i = 1; i <= 12; i++) {
    const filename = `${character.id}_attack_${i.toString().padStart(3, '0')}.png`;
    const filePath = path.join(basePath, filename);
    if (fs.existsSync(filePath)) {
      frames.push({
        filename: filename,
        width: 200,
        height: 200
      });
    }
  }
  
  // 受击动画（3帧）
  for (let i = 1; i <= 3; i++) {
    const filename = `${character.id}_hited_${i.toString().padStart(3, '0')}.png`;
    const filePath = path.join(basePath, filename);
    if (fs.existsSync(filePath)) {
      frames.push({
        filename: filename,
        width: 200,
        height: 200
      });
    }
  }
  
  const config = createTexturePackerConfig(character.id, frames);
  const outputPath = path.join(OUTPUT_DIR, `${character.id}.json`);
  
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
  
  console.log(`✅ 生成配置: ${character.id}`);
}

// 生成怪物图集配置
function generateMonsterAtlasConfig(monster) {
  const frames = [];
  const basePath = path.join(ASSETS_DIR, 'monster', monster.folder);
  
  // 待机动画（8帧）
  for (let i = 1; i <= 8; i++) {
    const filename = `${monster.prefix}_wait_${i.toString().padStart(3, '0')}.png`;
    const filePath = path.join(basePath, filename);
    if (fs.existsSync(filePath)) {
      frames.push({
        filename: filename,
        width: 200,
        height: 200
      });
    }
  }
  
  // 攻击动画（8帧）
  for (let i = 1; i <= 8; i++) {
    const filename = `${monster.prefix}_attack_${i.toString().padStart(3, '0')}.png`;
    const filePath = path.join(basePath, filename);
    if (fs.existsSync(filePath)) {
      frames.push({
        filename: filename,
        width: 200,
        height: 200
      });
    }
  }
  
  // 受击动画（3帧）
  for (let i = 1; i <= 3; i++) {
    const filename = `${monster.prefix}_hited_${i.toString().padStart(3, '0')}.png`;
    const filePath = path.join(basePath, filename);
    if (fs.existsSync(filePath)) {
      frames.push({
        filename: filename,
        width: 200,
        height: 200
      });
    }
  }
  
  const config = createTexturePackerConfig(monster.id, frames);
  const outputPath = path.join(OUTPUT_DIR, `${monster.id}.json`);
  
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
  
  console.log(`✅ 生成配置: ${monster.id}`);
}

// 主函数
function main() {
  console.log('🎨 生成TexturePacker配置...\n');
  
  console.log('📦 生成角色配置...');
  CHARACTERS.forEach(character => {
    generateCharacterAtlasConfig(character);
  });
  
  console.log('\n👾 生成怪物配置...');
  MONSTERS.forEach(monster => {
    generateMonsterAtlasConfig(monster);
  });
  
  console.log('\n✨ 完成！配置文件已生成到 atlas-configs 目录');
  console.log('💡 提示：使用TexturePacker打开这些配置来生成图集');
}

main();

