/**
 * 分析未使用的特效资源
 */

const fs = require('fs');
const path = require('path');

// 当前使用的特效（从EffectConfig.ts和CharacterConfig.ts提取）
const USED_EFFECTS = [
  'effect_008',   // 子弹
  'effect_020f',  // 子弹
  'effect_030f',  // 子弹
  'effect_036f',  // 子弹
  'effect_087f',  // 子弹
  'effect_036h',  // 击中
  'effect_061h',  // 击中
  'effect_070',   // 击中
  'effect_088h'   // 击中
];

const EFFECTS_DIR = path.join(__dirname, '../assets/res/effect');

// 获取所有特效文件夹
const allFolders = fs.readdirSync(EFFECTS_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

// 找出未使用的文件夹
const unusedFolders = allFolders.filter(folder => !USED_EFFECTS.includes(folder));

// 计算每个文件夹的大小
const folderSizes = {};
let totalUnusedSize = 0;

unusedFolders.forEach(folder => {
  const folderPath = path.join(EFFECTS_DIR, folder);
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.png'));
  const size = files.reduce((sum, file) => {
    try {
      const filePath = path.join(folderPath, file);
      return sum + fs.statSync(filePath).size;
    } catch (e) {
      return sum;
    }
  }, 0);
  folderSizes[folder] = { size, fileCount: files.length };
  totalUnusedSize += size;
});

// 输出结果
console.log('========================================');
console.log('  特效使用情况分析');
console.log('========================================');
console.log('');

console.log('📊 统计:');
console.log(`   总特效文件夹数: ${allFolders.length}`);
console.log(`   使用的特效: ${USED_EFFECTS.length}`);
console.log(`   未使用的特效: ${unusedFolders.length}`);
console.log('');

console.log('✅ 正在使用的特效:');
USED_EFFECTS.forEach(id => {
  const exists = allFolders.includes(id);
  console.log(`   ${id} ${exists ? '✓' : '✗ (不存在)'}`);
});
console.log('');

console.log('❌ 未使用的特效文件夹:');
unusedFolders.sort().forEach(folder => {
  const info = folderSizes[folder];
  const sizeMB = (info.size / (1024 * 1024)).toFixed(2);
  console.log(`   ${folder.padEnd(25)} ${info.fileCount.toString().padStart(3)} 文件, ${sizeMB.padStart(7)} MB`);
});
console.log('');

const totalUnusedSizeMB = (totalUnusedSize / (1024 * 1024)).toFixed(2);
console.log(`💾 未使用特效总大小: ${totalUnusedSizeMB} MB`);
console.log('');

// 生成删除脚本
const deleteScript = `@echo off
chcp 65001 >nul
echo ========================================
echo   删除未使用的特效资源
echo ========================================
echo.
echo 将要删除以下 ${unusedFolders.length} 个特效文件夹：
echo.
${unusedFolders.map(f => {
  const info = folderSizes[f];
  const sizeMB = (info.size / (1024 * 1024)).toFixed(2);
  return `echo    ${f.padEnd(25)} (${info.fileCount} 文件, ${sizeMB} MB)`;
}).join('\n')}
echo.
echo 总大小: ${totalUnusedSizeMB} MB
echo.
set /p confirm="确认删除？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消
    pause
    exit /b
)

echo.
echo 开始删除...
echo.

${unusedFolders.map(folder => {
  const folderPath = path.join(EFFECTS_DIR, folder).replace(/\\/g, '\\\\');
  return `if exist "${folderPath}" (
    echo 删除: ${folder}
    rmdir /s /q "${folderPath}"
    if errorlevel 1 (
        echo    ⚠️  删除失败: ${folder}
    ) else (
        echo    ✅ 删除成功: ${folder}
    )
)`;
}).join('\n')}

echo.
echo ========================================
echo   ✨ 删除完成！
echo ========================================
echo.
pause
`;

const deleteScriptPath = path.join(__dirname, 'delete-unused-effects.bat');
fs.writeFileSync(deleteScriptPath, deleteScript, 'utf-8');

console.log('📝 已生成删除脚本: delete-unused-effects.bat');
console.log('💡 运行该脚本可以删除所有未使用的特效文件夹');
console.log('⚠️  删除前请确认，建议先备份！');
console.log('');

