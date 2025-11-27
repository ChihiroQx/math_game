@echo off
chcp 65001 >nul
echo ========================================
echo  一键部署到 Gitee Pages
echo ========================================
echo.
echo 仓库地址: https://gitee.com/xh_qianxun/math_game
echo.

echo [1/3] 构建游戏...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo.
echo ✓ 构建完成
echo.
echo [2/3] 准备部署文件...

cd dist

if not exist .git (
    echo 初始化 Git 仓库...
    git init
    git branch -M master
    git remote add origin https://gitee.com/xh_qianxun/math_game.git
) else (
    echo Git 仓库已存在
)

echo.
echo [3/3] 提交并推送到 Gitee...
git add -A
git commit -m "部署游戏 - %date% %time%"
git push -f origin master

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 可能的原因：
    echo 1. 首次推送需要登录 Gitee 账号
    echo 2. 没有配置 Git 用户信息
    echo.
    echo 解决方法：
    echo 1. 运行以下命令配置 Git：
    echo    git config --global user.name "你的名字"
    echo    git config --global user.email "你的邮箱"
    echo.
    echo 2. 或者手动上传 dist 文件夹内容到 Gitee
    echo.
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo  ✓ 部署成功！
echo ========================================
echo.
echo 游戏已推送到 Gitee
echo.
echo 下一步操作：
echo 1. 访问 https://gitee.com/xh_qianxun/math_game
echo 2. 点击 "服务" → "Gitee Pages"
echo 3. 点击 "启动"（首次）或 "更新"（更新时）
echo 4. 获取访问链接（约1分钟后生效）
echo.
echo 预计访问地址：
echo https://xh_qianxun.gitee.io/math_game/
echo.
pause

