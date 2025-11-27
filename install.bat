@echo off
title Math Adventure Game - Installer

echo.
echo ==========================================
echo   Math Adventure Game - Quick Setup
echo ==========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Node.js not found
    echo.
    echo Please install Node.js first:
    echo 1. Visit: https://nodejs.org/
    echo 2. Download LTS version
    echo 3. Install and restart this script
    echo.
    echo OR use Chinese mirror:
    echo https://npmmirror.com/mirrors/node/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js installed
node -v
npm -v
echo.

REM Install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take 2-3 minutes...
    echo.
    
    call npm install --registry=https://registry.npmmirror.com
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo Trying official registry...
        call npm install
    )
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Installation failed!
        echo Please check your network connection.
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo [OK] Dependencies installed!
) else (
    echo [OK] Dependencies already installed
)

echo.
echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo To start the game, run: start.bat
echo.
pause
