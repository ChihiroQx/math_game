@echo off
chcp 65001 >nul
echo ========================================
echo  分批推送大型仓库到 GitHub
echo ========================================
echo.

echo [1/6] 检查 Git 状态...
git status

echo.
echo [2/6] 添加除资源外的文件...
git add src/ *.md *.json *.js *.ts *.bat webpack.config.js tsconfig.json

echo.
echo [3/6] 提交代码文件...
git commit -m "提交代码和配置文件 - %date% %time%"

echo.
echo [4/6] 推送代码...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️ 代码推送失败，请检查网络或 Token
    pause
    exit /b 1
)

echo.
echo ✓ 代码推送成功！
echo.

echo [5/6] 添加资源文件...
git add assets/

echo.
echo [6/6] 提交并推送资源...
git commit -m "添加游戏资源文件 - %date% %time%"
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️ 资源推送失败，可能需要：
    echo 1. 使用 GitHub Desktop
    echo 2. 启用 Git LFS（大文件存储）
    echo 3. 分多次推送
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✓ 全部推送成功！
echo ========================================
echo.
echo 仓库地址: https://github.com/ChihiroQx/math_game
echo.
pause

