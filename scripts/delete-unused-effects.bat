@echo off
chcp 65001 >nul
echo ========================================
echo   删除未使用的特效资源
echo ========================================
echo.
echo 当前使用的特效（9个）：
echo   effect_008   (子弹)
echo   effect_020f  (子弹)
echo   effect_030f  (子弹)
echo   effect_036f  (子弹)
echo   effect_087f  (子弹)
echo   effect_036h  (击中)
echo   effect_061h  (击中)
echo   effect_070   (击中)
echo   effect_088h  (击中)
echo.
echo 将要删除以下未使用的特效文件夹：
echo.
echo   cast_skill_before
echo   effect_028
echo   effect_062d
echo   effect_062u
echo   effect_063d
echo   effect_063u
echo   effect_065h
echo   effect_065l
echo   effect_066d
echo   effect_066u
echo   effect_068d
echo   effect_068u
echo   effect_074
echo   effect_082d
echo   effect_082u
echo   effect_083
echo   effect_102
echo   effect_103
echo   effect_107
echo   effect_200
echo   effect_203
echo   effect_205
echo   effect_209
echo   effect_212
echo   effect_213
echo   effect_215
echo   effect_216
echo   effect_217
echo   effect_219
echo   effect_220
echo   effect_221
echo   effect_222
echo   effect_223
echo   effect_225
echo   effect_227
echo   effect_228
echo   effect_229
echo   zboss_appence_fontlight
echo.
set /p confirm="确认删除以上未使用的特效文件夹？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消
    pause
    exit /b
)

echo.
echo 开始删除...
echo.

set EFFECTS_DIR=%~dp0..\assets\res\effect

REM 删除未使用的特效文件夹
if exist "%EFFECTS_DIR%\cast_skill_before" (
    echo 删除: cast_skill_before
    rmdir /s /q "%EFFECTS_DIR%\cast_skill_before"
)

if exist "%EFFECTS_DIR%\effect_028" (
    echo 删除: effect_028
    rmdir /s /q "%EFFECTS_DIR%\effect_028"
)

if exist "%EFFECTS_DIR%\effect_062d" (
    echo 删除: effect_062d
    rmdir /s /q "%EFFECTS_DIR%\effect_062d"
)

if exist "%EFFECTS_DIR%\effect_062u" (
    echo 删除: effect_062u
    rmdir /s /q "%EFFECTS_DIR%\effect_062u"
)

if exist "%EFFECTS_DIR%\effect_063d" (
    echo 删除: effect_063d
    rmdir /s /q "%EFFECTS_DIR%\effect_063d"
)

if exist "%EFFECTS_DIR%\effect_063u" (
    echo 删除: effect_063u
    rmdir /s /q "%EFFECTS_DIR%\effect_063u"
)

if exist "%EFFECTS_DIR%\effect_065h" (
    echo 删除: effect_065h
    rmdir /s /q "%EFFECTS_DIR%\effect_065h"
)

if exist "%EFFECTS_DIR%\effect_065l" (
    echo 删除: effect_065l
    rmdir /s /q "%EFFECTS_DIR%\effect_065l"
)

if exist "%EFFECTS_DIR%\effect_066d" (
    echo 删除: effect_066d
    rmdir /s /q "%EFFECTS_DIR%\effect_066d"
)

if exist "%EFFECTS_DIR%\effect_066u" (
    echo 删除: effect_066u
    rmdir /s /q "%EFFECTS_DIR%\effect_066u"
)

if exist "%EFFECTS_DIR%\effect_068d" (
    echo 删除: effect_068d
    rmdir /s /q "%EFFECTS_DIR%\effect_068d"
)

if exist "%EFFECTS_DIR%\effect_068u" (
    echo 删除: effect_068u
    rmdir /s /q "%EFFECTS_DIR%\effect_068u"
)

if exist "%EFFECTS_DIR%\effect_074" (
    echo 删除: effect_074
    rmdir /s /q "%EFFECTS_DIR%\effect_074"
)

if exist "%EFFECTS_DIR%\effect_082d" (
    echo 删除: effect_082d
    rmdir /s /q "%EFFECTS_DIR%\effect_082d"
)

if exist "%EFFECTS_DIR%\effect_082u" (
    echo 删除: effect_082u
    rmdir /s /q "%EFFECTS_DIR%\effect_082u"
)

if exist "%EFFECTS_DIR%\effect_083" (
    echo 删除: effect_083
    rmdir /s /q "%EFFECTS_DIR%\effect_083"
)

if exist "%EFFECTS_DIR%\effect_102" (
    echo 删除: effect_102
    rmdir /s /q "%EFFECTS_DIR%\effect_102"
)

if exist "%EFFECTS_DIR%\effect_103" (
    echo 删除: effect_103
    rmdir /s /q "%EFFECTS_DIR%\effect_103"
)

if exist "%EFFECTS_DIR%\effect_107" (
    echo 删除: effect_107
    rmdir /s /q "%EFFECTS_DIR%\effect_107"
)

if exist "%EFFECTS_DIR%\effect_200" (
    echo 删除: effect_200
    rmdir /s /q "%EFFECTS_DIR%\effect_200"
)

if exist "%EFFECTS_DIR%\effect_203" (
    echo 删除: effect_203
    rmdir /s /q "%EFFECTS_DIR%\effect_203"
)

if exist "%EFFECTS_DIR%\effect_205" (
    echo 删除: effect_205
    rmdir /s /q "%EFFECTS_DIR%\effect_205"
)

if exist "%EFFECTS_DIR%\effect_209" (
    echo 删除: effect_209
    rmdir /s /q "%EFFECTS_DIR%\effect_209"
)

if exist "%EFFECTS_DIR%\effect_212" (
    echo 删除: effect_212
    rmdir /s /q "%EFFECTS_DIR%\effect_212"
)

if exist "%EFFECTS_DIR%\effect_213" (
    echo 删除: effect_213
    rmdir /s /q "%EFFECTS_DIR%\effect_213"
)

if exist "%EFFECTS_DIR%\effect_215" (
    echo 删除: effect_215
    rmdir /s /q "%EFFECTS_DIR%\effect_215"
)

if exist "%EFFECTS_DIR%\effect_216" (
    echo 删除: effect_216
    rmdir /s /q "%EFFECTS_DIR%\effect_216"
)

if exist "%EFFECTS_DIR%\effect_217" (
    echo 删除: effect_217
    rmdir /s /q "%EFFECTS_DIR%\effect_217"
)

if exist "%EFFECTS_DIR%\effect_219" (
    echo 删除: effect_219
    rmdir /s /q "%EFFECTS_DIR%\effect_219"
)

if exist "%EFFECTS_DIR%\effect_220" (
    echo 删除: effect_220
    rmdir /s /q "%EFFECTS_DIR%\effect_220"
)

if exist "%EFFECTS_DIR%\effect_221" (
    echo 删除: effect_221
    rmdir /s /q "%EFFECTS_DIR%\effect_221"
)

if exist "%EFFECTS_DIR%\effect_222" (
    echo 删除: effect_222
    rmdir /s /q "%EFFECTS_DIR%\effect_222"
)

if exist "%EFFECTS_DIR%\effect_223" (
    echo 删除: effect_223
    rmdir /s /q "%EFFECTS_DIR%\effect_223"
)

if exist "%EFFECTS_DIR%\effect_225" (
    echo 删除: effect_225
    rmdir /s /q "%EFFECTS_DIR%\effect_225"
)

if exist "%EFFECTS_DIR%\effect_227" (
    echo 删除: effect_227
    rmdir /s /q "%EFFECTS_DIR%\effect_227"
)

if exist "%EFFECTS_DIR%\effect_228" (
    echo 删除: effect_228
    rmdir /s /q "%EFFECTS_DIR%\effect_228"
)

if exist "%EFFECTS_DIR%\effect_229" (
    echo 删除: effect_229
    rmdir /s /q "%EFFECTS_DIR%\effect_229"
)

if exist "%EFFECTS_DIR%\zboss_appence_fontlight" (
    echo 删除: zboss_appence_fontlight
    rmdir /s /q "%EFFECTS_DIR%\zboss_appence_fontlight"
)

echo.
echo ========================================
echo   ✨ 删除完成！
echo ========================================
echo.
pause

