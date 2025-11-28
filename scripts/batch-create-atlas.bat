@echo off
chcp 65001 >nul
echo ========================================
echo   TexturePacker 批量生成 Sprite Atlas
echo ========================================
echo.

REM 设置TexturePacker路径（请根据实际安装路径修改）
REM 常见路径：
REM   C:\Program Files\CodeAndWeb\TexturePacker\bin\TexturePacker.exe
REM   C:\Program Files (x86)\CodeAndWeb\TexturePacker\bin\TexturePacker.exe
set TEXTPACKER_PATH="C:\Program Files\CodeAndWeb\TexturePacker\bin\TexturePacker.exe"

REM 检查TexturePacker是否存在
if not exist %TEXTPACKER_PATH% (
    echo ❌ 未找到TexturePacker！
    echo.
    echo 请修改脚本中的 TEXTPACKER_PATH 为您的TexturePacker安装路径
    echo 默认路径: C:\Program Files\CodeAndWeb\TexturePacker\bin\TexturePacker.exe
    echo.
    pause
    exit /b 1
)

echo ✅ 找到TexturePacker: %TEXTPACKER_PATH%
echo.

REM 设置资源路径
set ASSETS_DIR=%~dp0..\assets\res
set OUTPUT_DIR=%~dp0..\assets\res-atlas

echo 📦 资源目录: %ASSETS_DIR%
echo 📦 输出目录: %OUTPUT_DIR%
echo.

REM 创建输出目录
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"
if not exist "%OUTPUT_DIR%\player" mkdir "%OUTPUT_DIR%\player"
if not exist "%OUTPUT_DIR%\monster" mkdir "%OUTPUT_DIR%\monster"

echo ========================================
echo   开始生成角色图集...
echo ========================================
echo.

REM 角色列表
set CHARACTERS=307 119 303 311 335 315

for %%c in (%CHARACTERS%) do (
    echo 📦 处理角色: mage_%%c
    set INPUT_DIR=%ASSETS_DIR%\player\%%c
    set OUTPUT_PNG=%OUTPUT_DIR%\player\%%c\mage_%%c.png
    set OUTPUT_JSON=%OUTPUT_DIR%\player\%%c\mage_%%c.json
    
    REM 创建输出子目录
    if not exist "%OUTPUT_DIR%\player\%%c" mkdir "%OUTPUT_DIR%\player\%%c"
    
    REM 调用TexturePacker
    %TEXTPACKER_PATH% ^
        --data "%OUTPUT_JSON%" ^
        --sheet "%OUTPUT_PNG%" ^
        --format json-array ^
        --texture-format png ^
        --max-width 2048 ^
        --max-height 2048 ^
        --algorithm MaxRects ^
        --trim-mode None ^
        --border-padding 0 ^
        --shape-padding 0 ^
        --multipack ^
        "%INPUT_DIR%\*.png"
    
    if %ERRORLEVEL% EQU 0 (
        echo    ✅ 成功: mage_%%c
    ) else (
        echo    ❌ 失败: mage_%%c
    )
    echo.
)

echo ========================================
echo   开始生成怪物图集...
echo ========================================
echo.

REM 怪物列表（文件夹名, 前缀, 输出名）
REM 格式: 文件夹名|前缀|输出名
set MONSTERS=monster|monster|monster1 monster1|monster1|monster2 monster004|monster004|monster3 monster005|monster005|monster4 monster006|monster006|monster5 monster007|monster007|monster6 monster002|monster002|monster7 monster009|monster009|monster8

for %%m in (%MONSTERS%) do (
    REM 解析怪物配置（使用临时变量）
    for /f "tokens=1,2,3 delims=|" %%a in ("%%m") do (
        set FOLDER=%%a
        set PREFIX=%%b
        set OUTPUT_NAME=%%c
        
        echo 📦 处理怪物: %%c (%%a)
        set INPUT_DIR=%ASSETS_DIR%\monster\%%a
        set OUTPUT_PNG=%OUTPUT_DIR%\monster\%%c.png
        set OUTPUT_JSON=%OUTPUT_DIR%\monster\%%c.json
        
        REM 调用TexturePacker
        %TEXTPACKER_PATH% ^
            --data "%OUTPUT_JSON%" ^
            --sheet "%OUTPUT_PNG%" ^
            --format json-array ^
            --texture-format png ^
            --max-width 2048 ^
            --max-height 2048 ^
            --algorithm MaxRects ^
            --trim-mode None ^
            --border-padding 0 ^
            --shape-padding 0 ^
            --multipack ^
            "%INPUT_DIR%\*.png"
        
        if %ERRORLEVEL% EQU 0 (
            echo    ✅ 成功: %%c
        ) else (
            echo    ❌ 失败: %%c
        )
        echo.
    )
)

echo ========================================
echo   ✨ 批量生成完成！
echo ========================================
echo.
echo 📁 输出目录: %OUTPUT_DIR%
echo.
echo 💡 提示：
echo    1. 检查生成的文件是否正确
echo    2. 确认JSON格式为 Phaser 兼容格式
echo    3. 如果格式不对，可能需要调整 --format 参数
echo.
pause

