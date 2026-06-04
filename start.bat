@echo off
echo ====================================
echo EcoLoop - Quick Start
echo ====================================
echo.

REM Check if Node is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Starting MongoDB...
echo Please ensure MongoDB is running in another terminal
echo If using local MongoDB, run: mongod
timeout /t 2

echo.
echo [2/4] Installing backend dependencies...
cd backend
if not exist node_modules (
    call npm install
) else (
    echo Backend dependencies already installed
)

echo.
echo [3/4] Installing frontend dependencies...
cd ..\frontend
if not exist node_modules (
    call npm install
) else (
    echo Frontend dependencies already installed
)

cd ..

echo.
echo ====================================
echo Starting EcoLoop Application
echo ====================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press ANY KEY to continue...
pause

REM Start backend in new window
start cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3

REM Start frontend in new window
start cmd /k "cd frontend && npm start"

echo.
echo EcoLoop is starting!
echo - Backend terminal: npm run dev
echo - Frontend terminal: npm start
echo - Browser will open automatically to http://localhost:3000
echo.
