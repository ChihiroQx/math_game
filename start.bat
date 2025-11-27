@echo off
title Math Adventure Game

echo.
echo ==========================================
echo   Math Adventure Game
echo ==========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not installed!
    echo Please run: install.bat first
    echo.
    pause
    exit /b 1
)

REM Check dependencies
if not exist "node_modules" (
    echo [ERROR] Dependencies not installed!
    echo Please run: install.bat first
    echo.
    pause
    exit /b 1
)

echo Starting dev server...
echo Browser will open automatically
echo Press Ctrl+C to stop
echo.

call npm run dev

pause
