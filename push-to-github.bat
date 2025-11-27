@echo off
chcp 65001 >nul
echo ========================================
echo  推送项目到 GitHub
echo ========================================
echo.
echo 仓库地址: https://github.com/ChihiroQx/math_game
echo.

echo [1/4] 检查 Git 配置...
echo.

REM 检查是否配置了 Git 用户信息
git config user.name >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 请设置 Git 用户名：
    set /p username="输入您的 GitHub 用户名: "
    git config --global user.name "!username!"
)

git config user.email >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 请设置 Git 邮箱：
    set /p email="输入您的邮箱: "
    git config --global user.email "!email!"
)

echo ✓ Git 配置完成
echo.

echo [2/4] 初始化 Git 仓库...
echo.

if not exist .git (
    git init
    echo ✓ Git 仓库已初始化
) else (
    echo ✓ Git 仓库已存在
)

echo.
echo [3/4] 添加文件...
echo.

git add .
git status

echo.
echo [4/4] 提交并推送...
echo.

git commit -m "初始化数学游戏项目 - Math Fairy Adventure"

REM 检查是否已添加远程仓库
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 添加远程仓库...
    git remote add origin https://github.com/ChihiroQx/math_game.git
)

echo.
echo 准备推送到 GitHub...
echo 如果是首次推送，需要输入 GitHub 用户名和密码（或 Token）
echo.
pause

git branch -M main
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 可能的原因：
    echo 1. 需要 GitHub 访问令牌（Token）
    echo 2. 网络问题
    echo 3. 权限问题
    echo.
    echo 使用 Token 推送的方法：
    echo 1. 访问 https://github.com/settings/tokens
    echo 2. 生成新的 Personal Access Token
    echo 3. 推送时用 Token 作为密码
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✓ 推送成功！
echo ========================================
echo.
echo 您的项目已上传到 GitHub：
echo https://github.com/ChihiroQx/math_game
echo.
echo 现在可以：
echo 1. 访问仓库查看代码
echo 2. 使用 Vercel 连接 GitHub 自动部署
echo 3. 与他人分享您的项目
echo.
pause

