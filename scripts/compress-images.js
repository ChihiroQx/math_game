/**
 * 图片批量压缩脚本
 * 使用 imagemin 压缩 PNG 图片
 */

const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.join(__dirname, '../assets/res');
const OUTPUT_DIR = path.join(__dirname, '../assets/res-compressed');

// 压缩选项
const compressOptions = {
  quality: [0.65, 0.8], // 质量范围 65%-80%
  speed: 3, // 压缩速度（1-11，3是平衡值）
  strip: true // 移除元数据
};

/**
 * 压缩单个目录
 */
async function compressDirectory(inputDir, outputDir) {
  try {
    const files = await imagemin([`${inputDir}/**/*.png`], {
      destination: outputDir,
      plugins: [
        imageminPngquant(compressOptions)
      ]
    });
    
    return files.length;
  } catch (error) {
    console.error(`❌ 压缩失败: ${inputDir}`, error);
    return 0;
  }
}

/**
 * 计算目录大小
 */
function getDirectorySize(dir) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    files.forEach(file => {
      const filePath = path.join(currentPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        calculateSize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
  }
  
  calculateSize(dir);
  return totalSize;
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * 主函数
 */
async function main() {
  console.log('🖼️  开始压缩图片...\n');
  
  // 创建输出目录
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  const directories = [
    { name: '角色', path: path.join(ASSETS_DIR, 'player') },
    { name: '怪物', path: path.join(ASSETS_DIR, 'monster') },
    { name: '特效', path: path.join(ASSETS_DIR, 'effect') }
  ];
  
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let totalFiles = 0;
  
  for (const dir of directories) {
    if (!fs.existsSync(dir.path)) {
      console.log(`⚠️  跳过不存在的目录: ${dir.name}`);
      continue;
    }
    
    console.log(`📦 压缩 ${dir.name}...`);
    
    // 计算原始大小
    const originalSize = getDirectorySize(dir.path);
    totalOriginalSize += originalSize;
    
    // 压缩
    const outputPath = path.join(OUTPUT_DIR, path.basename(dir.path));
    const fileCount = await compressDirectory(dir.path, outputPath);
    totalFiles += fileCount;
    
    // 计算压缩后大小
    const compressedSize = getDirectorySize(outputPath);
    totalCompressedSize += compressedSize;
    
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    
    console.log(`   ✅ ${fileCount} 个文件`);
    console.log(`   📊 原始: ${formatSize(originalSize)} → 压缩: ${formatSize(compressedSize)} (减少 ${reduction}%)`);
    console.log('');
  }
  
  // 总结
  console.log('📊 压缩总结:');
  console.log(`   总文件数: ${totalFiles}`);
  console.log(`   原始大小: ${formatSize(totalOriginalSize)}`);
  console.log(`   压缩大小: ${formatSize(totalCompressedSize)}`);
  console.log(`   减少: ${formatSize(totalOriginalSize - totalCompressedSize)} (${((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1)}%)`);
  console.log('\n✨ 压缩完成！');
  console.log(`💡 压缩后的文件在: ${OUTPUT_DIR}`);
  console.log('⚠️  请检查压缩质量，确认无误后替换原文件');
}

// 检查依赖
try {
  require('imagemin');
  require('imagemin-pngquant');
  main();
} catch (error) {
  console.error('❌ 缺少依赖包！');
  console.log('\n请先安装依赖:');
  console.log('npm install --save-dev imagemin imagemin-pngquant');
  process.exit(1);
}

