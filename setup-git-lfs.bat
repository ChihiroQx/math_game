@echo off
chcp 65001 >nul
echo ========================================
echo  配置 Git LFS（大文件存储）
echo ========================================
echo.

echo [1/4] 安装 Git LFS...
echo 请先从这里下载安装: https://git-lfs.github.com/
echo 安装后按任意键继续...
pause

echo.
echo [2/4] 初始化 Git LFS...
git lfs install

echo.
echo [3/4] 追踪大文件（PNG 图片）...
git lfs track "*.png"
git lfs track "*.zip"
git add .gitattributes

echo.
echo [4/4] 提交 LFS 配置...
git commit -m "配置 Git LFS 支持大文件"

echo.
echo ========================================
echo  ✓ Git LFS 配置完成！
echo ========================================
echo.
echo 现在可以正常推送了，PNG 文件会自动使用 LFS
echo.
pause

