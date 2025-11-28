/**
 * 查找未使用的特效资源
 * 分析EffectConfig和CharacterConfig，找出未使用的特效文件夹
 */

const fs = require('fs');
const path = require('path');

const EFFECTS_DIR = path.join(__dirname, '../assets/res/effect');
const EFFECT_CONFIG = path.join(__dirname, '../src/config/EffectConfig.ts');
const CHARACTER_CONFIG = path.join(__dirname, '../src/config/CharacterConfig.ts');

// 读取配置文件内容
const effectConfigContent = fs.readFileSync(EFFECT_CONFIG, 'utf-8');
const characterConfigContent = fs.readFileSync(CHARACTER_CONFIG, 'utf-8');

// 从EffectConfig中提取所有定义的特效ID
const effectIdsFromConfig = new Set();
const effectIdRegex = /['"]effect_\w+['"]/g;
let match;
while ((match = effectIdRegex.exec(effectConfigContent)) !== null) {
  const id = match[0].replace(/['"]/g, '');
  effectIdsFromConfig.add(id);
}

// 从CharacterConfig中提取使用的特效ID
const usedEffectIds = new Set();
const bulletEffectRegex = /bulletEffect:\s*['"](effect_\w+)['"]/g;
const hitEffectRegex = /hitEffect:\s*['"](effect_\w+)['"]/g;

while ((match = bulletEffectRegex.exec(characterConfigContent)) !== null) {
  usedEffectIds.add(match[1]);
}
while ((match = hitEffectRegex.exec(characterConfigContent)) !== null) {
  usedEffectIds.add(match[1]);
}

// 获取所有特效文件夹
const effectFolders = fs.readdirSync(EFFECTS_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

// 分析结果
const usedFolders = new Set();
const unusedFolders = [];

effectFolders.forEach(folder => {
  // 检查文件夹名是否匹配使用的特效ID
  if (usedEffectIds.has(folder)) {
    usedFolders.add(folder);
  } else {
    // 检查是否是特效文件夹（以effect_开头）
    if (folder.startsWith('effect_')) {
      unusedFolders.push(folder);
    } else {
      // 其他文件夹（如cast_skill_before, zboss_appence_fontlight等）
      unusedFolders.push(folder);
    }
  }
});

// 输出结果
console.log('========================================');
console.log('  特效使用情况分析');
console.log('========================================');
console.log('');

console.log('📊 统计:');
console.log(`   总特效文件夹数: ${effectFolders.length}`);
console.log(`   使用的特效: ${usedEffectIds.size}`);
console.log(`   未使用的特效: ${unusedFolders.length}`);
console.log('');

console.log('✅ 正在使用的特效:');
usedEffectIds.forEach(id => {
  const folderExists = effectFolders.includes(id);
  console.log(`   ${id} ${folderExists ? '✓' : '✗ (文件夹不存在)'}`);
});
console.log('');

console.log('❌ 未使用的特效文件夹:');
unusedFolders.forEach(folder => {
  const folderPath = path.join(EFFECTS_DIR, folder);
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.png'));
  const size = files.reduce((sum, file) => {
    const filePath = path.join(folderPath, file);
    return sum + fs.statSync(filePath).size;
  }, 0);
  const sizeMB = (size / (1024 * 1024)).toFixed(2);
  console.log(`   ${folder} (${files.length} 文件, ${sizeMB} MB)`);
});
console.log('');

// 计算总大小
const totalUnusedSize = unusedFolders.reduce((sum, folder) => {
  const folderPath = path.join(EFFECTS_DIR, folder);
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.png'));
  return sum + files.reduce((fileSum, file) => {
    const filePath = path.join(folderPath, file);
    return fileSum + fs.statSync(filePath).size;
  }, 0);
}, 0);

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
${unusedFolders.map(f => `echo    ${f}`).join('\n')}
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
  const folderPath = path.join(EFFECTS_DIR, folder).replace(/\\/g, '/');
  return `if exist "${folderPath}" (
    echo 删除: ${folder}
    rmdir /s /q "${folderPath}"
)`;
}).join('\n')}

echo.
echo ========================================
echo   ✨ 删除完成！
echo ========================================
pause
`;

const deleteScriptPath = path.join(__dirname, 'delete-unused-effects.bat');
fs.writeFileSync(deleteScriptPath, deleteScript, 'utf-8');

console.log('📝 已生成删除脚本: delete-unused-effects.bat');
console.log('💡 运行该脚本可以删除所有未使用的特效文件夹');
console.log('');

