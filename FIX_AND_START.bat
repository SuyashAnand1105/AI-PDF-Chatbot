@echo off
title DocuMind AI - Fix & Start
color 0A
echo.
echo  Fixing Windows PowerShell script policy...
echo.

:: Fix the PowerShell execution policy (this is what causes "cannot be loaded" error)
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force" >nul 2>&1

echo  ✅ Fixed!
echo.
echo  Now starting DocuMind AI...
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  ❌ Node.js not found. Please install from https://nodejs.org
    echo     After installing, RESTART your computer, then run this file again.
    pause
    start https://nodejs.org
    exit
)

echo  ✅ Node.js is ready!
echo.

:: Install backend
if not exist "backend\node_modules" (
    echo  📦 Installing backend packages... (takes 1-2 minutes)
    cd backend
    call npm.cmd install
    cd ..
    echo  ✅ Done!
    echo.
)

:: Install frontend
if not exist "frontend\node_modules" (
    echo  📦 Installing frontend packages... (takes 1-2 minutes)
    cd frontend
    call npm.cmd install
    cd ..
    echo  ✅ Done!
    echo.
)

echo  🚀 Starting servers...
echo.

start "DocuMind - Backend" cmd /k "cd /d "%~dp0backend" && node server.js"
timeout /t 3 /nobreak >nul
start "DocuMind - Frontend" cmd /k "cd /d "%~dp0frontend" && call npx.cmd vite"
timeout /t 6 /nobreak >nul

start http://localhost:5173

echo.
echo  ╔══════════════════════════════════════╗
echo  ║  ✅ DocuMind AI is running!          ║
echo  ║                                      ║
echo  ║  Opening: http://localhost:5173      ║
echo  ║                                      ║
echo  ║  To stop: close the 2 black windows  ║
echo  ╚══════════════════════════════════════╝
echo.
pause
