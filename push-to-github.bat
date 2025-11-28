@echo off
chcp 65001 >nul
echo ========================================
echo GitHub 自动推送脚本
echo ========================================
echo.

REM 设置重试间隔（秒）
set RETRY_INTERVAL=5
set MAX_RETRIES=100
set RETRY_COUNT=0

REM 切换到项目目录
cd /d "%~dp0"

:RETRY
set /a RETRY_COUNT+=1
echo.
echo [尝试 %RETRY_COUNT%] 正在推送到 GitHub...
echo.

REM 执行 git push
git push origin main

REM 检查推送是否成功
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ 推送成功！
    echo ========================================
    echo.
    pause
    exit /b 0
) else (
    echo.
    echo ❌ 推送失败 (错误代码: %ERRORLEVEL%)
    echo.
    
    REM 检查是否超过最大重试次数
    if %RETRY_COUNT% GEQ %MAX_RETRIES% (
        echo.
        echo ========================================
        echo ⚠️ 已达到最大重试次数 (%MAX_RETRIES%)
        echo 请检查网络连接或 GitHub 配置
        echo ========================================
        echo.
        pause
        exit /b 1
    )
    
    echo 等待 %RETRY_INTERVAL% 秒后重试...
    timeout /t %RETRY_INTERVAL% /nobreak >nul
    goto RETRY
)

