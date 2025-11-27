@echo off
chcp 65001 >nul
echo ========================================
echo  一键部署到 Vercel
echo ========================================
echo.

REM 检查是否安装了 Vercel CLI
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  未检测到 Vercel CLI
    echo.
    echo 正在安装 Vercel CLI...
    echo.
    call npm install -g vercel
    
    REM 等待安装完成后再次检查
    echo.
    echo 验证安装...
    where vercel >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ⚠️  安装可能成功，但需要重启命令行
        echo.
        echo 请：
        echo 1. 关闭此窗口
        echo 2. 重新打开命令行
        echo 3. 再次运行此脚本
        echo.
        echo 或手动运行：vercel login 和 vercel --prod
        pause
        exit /b 0
    )
    
    echo.
    echo ✓ Vercel CLI 安装成功
    echo.
)

echo [1/3] 构建游戏...
echo.
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

echo [2/3] 检查登录状态...
echo.

REM 尝试获取用户信息，检查是否已登录
vercel whoami >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 需要登录 Vercel
    echo.
    echo 浏览器将打开登录页面...
    echo 请选择登录方式（推荐使用 GitHub）
    echo.
    pause
    vercel login
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ 登录失败或取消
        pause
        exit /b 1
    )
)

echo.
echo ✓ 已登录
echo.

echo [3/3] 部署到 Vercel...
echo.
echo 提示：
echo - Project name: 建议输入 math-game
echo - 其他选项按回车使用默认值
echo.
pause

cd dist
vercel --prod

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 部署失败！
    echo.
    echo 常见问题：
    echo 1. 确保已成功登录
    echo 2. 检查网络连接
    echo 3. 查看错误信息
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
echo 您的游戏已上线！
echo.
echo 访问链接已显示在上方 ↑
echo 格式：https://math-game-xxx.vercel.app
echo.
echo 可以：
echo 1. 复制链接分享给小朋友
echo 2. 生成二维码（访问 https://cli.im/）
echo 3. 在 Vercel 控制台查看详情
echo.
echo 更新游戏：
echo - 再次运行此脚本即可更新
echo.
pause

