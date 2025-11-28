@echo off
chcp 65001 >nul
echo ========================================
echo   Git推送问题修复工具
echo ========================================
echo.

cd /d %~dp0..

echo 📋 当前Git状态：
git status --short | findstr /C:"D " >nul
if %ERRORLEVEL% EQU 0 (
    echo    发现删除的文件
    git status --short | findstr /C:"D "
) else (
    echo    没有删除的文件
)
echo.

echo 🔍 检查远程仓库：
git remote -v
echo.

echo ========================================
echo   选择修复方案：
echo ========================================
echo.
echo 1. 切换到SSH连接（推荐）
echo 2. 增加超时时间
echo 3. 设置代理（需要代理地址）
echo 4. 检查网络连接
echo 5. 查看推送内容
echo 6. 退出
echo.
set /p choice="请选择 (1-6): "

if "%choice%"=="1" goto :switch_ssh
if "%choice%"=="2" goto :increase_timeout
if "%choice%"=="3" goto :set_proxy
if "%choice%"=="4" goto :check_network
if "%choice%"=="5" goto :check_push
if "%choice%"=="6" goto :end
goto :end

:switch_ssh
echo.
echo 🔄 切换到SSH连接...
git remote set-url origin git@github.com:ChihiroQx/math_game.git
echo ✅ 已切换到SSH
echo.
echo 测试SSH连接...
ssh -T git@github.com
echo.
echo 现在可以尝试推送：
echo   git push origin main
goto :end

:increase_timeout
echo.
echo ⏱️  增加超时时间...
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
echo ✅ 已增加超时时间
echo.
echo 现在可以尝试推送：
echo   git push origin main
goto :end

:set_proxy
echo.
set /p proxy="请输入代理地址 (如 http://127.0.0.1:7890): "
if "%proxy%"=="" (
    echo ❌ 代理地址不能为空
    goto :end
)
git config --global http.proxy %proxy%
git config --global https.proxy %proxy%
echo ✅ 已设置代理: %proxy%
echo.
echo 现在可以尝试推送：
echo   git push origin main
echo.
echo 推送完成后，可以取消代理：
echo   git config --global --unset http.proxy
echo   git config --global --unset https.proxy
goto :end

:check_network
echo.
echo 🌐 检查网络连接...
echo.
echo 测试GitHub连接：
ping -n 4 github.com
echo.
echo 测试HTTPS连接：
curl -I https://github.com 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ GitHub连接正常
) else (
    echo ❌ GitHub连接失败，可能需要代理
)
goto :end

:check_push
echo.
echo 📊 查看要推送的内容：
echo.
echo 待推送的提交：
git log origin/main..HEAD --oneline 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   无法获取远程分支信息，可能还没有设置远程仓库
) else (
    echo.
    echo 文件变更统计：
    git diff --stat origin/main 2>nul
)
goto :end

:end
echo.
pause

