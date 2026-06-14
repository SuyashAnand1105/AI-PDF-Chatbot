@echo off
title DocuMind AI - Startup
color 0B
echo.
echo  ╔══════════════════════════════════════╗
echo  ║      DocuMind AI - Starting...       ║
echo  ╚══════════════════════════════════════╝
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  ❌ Node.js is NOT installed!
    echo.
    echo  Please download and install Node.js from:
    echo  https://nodejs.org  (click the LTS button)
    echo.
    echo  After installing, RESTART YOUR COMPUTER and run START.bat again.
    echo.
    pause
    start https://nodejs.org
    exit
)

echo  ✅ Node.js found!
echo.

:: Install backend dependencies if needed
if not exist "backend\node_modules" (
    echo  📦 Installing backend packages (first time only)...
    cd backend
    call npm.cmd install
    cd ..
    echo  ✅ Backend packages installed!
    echo.
)

:: Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo  📦 Installing frontend packages (first time only)...
    cd frontend
    call npm.cmd install
    cd ..
    echo  ✅ Frontend packages installed!
    echo.
)

echo  🚀 Starting Backend Server...
start "DocuMind Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

echo  ⏳ Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo  🎨 Starting Frontend...
start "DocuMind Frontend" cmd /k "cd /d "%~dp0frontend" && call npx.cmd vite"

echo  ⏳ Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo  ✅ DocuMind AI is running!
echo.
echo  🌐 Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo  ╔══════════════════════════════════════╗
echo  ║  App is open in your browser!        ║
echo  ║                                      ║
echo  ║  Backend:  http://localhost:5000     ║
echo  ║  Frontend: http://localhost:5173     ║
echo  ║                                      ║
echo  ║  Close the two black windows to stop ║
echo  ╚══════════════════════════════════════╝
echo.
pause
