@echo off
chcp 65001 >nul
echo ========================================
echo  构建并推送到 GitHub（包含 dist）
echo ========================================
echo.

echo [1/5] 构建游戏...
echo.
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo.
echo ✓ 构建完成
echo.

echo [2/5] 初始化 Git...
echo.
if not exist .git (
    git init
    git branch -M main
)

echo [3/5] 添加所有文件（包括 dist）...
echo.
git add .
git add dist -f
git status

echo.
echo [4/5] 提交更改...
echo.
git commit -m "更新游戏代码和构建文件 - %date% %time%"

echo.
echo [5/5] 推送到 GitHub...
echo.

REM 检查是否已添加远程仓库
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    git remote add origin https://github.com/ChihiroQx/math_game.git
)

git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 提示：
    echo 1. 如果是首次推送，需要输入 GitHub Token
    echo 2. 如果提示冲突，使用: git push -f origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✓ 推送成功！
echo ========================================
echo.
echo 已推送内容：
echo - 源代码（src/）
echo - 构建文件（dist/）
echo - 资源文件（assets/）
echo - 配置文件
echo.
echo 仓库地址: https://github.com/ChihiroQx/math_game
echo.
echo 现在可以：
echo 1. 通过 GitHub Pages 直接部署 dist 文件夹
echo 2. Vercel 连接后自动部署
echo 3. 他人可以直接下载使用
echo.
pause

