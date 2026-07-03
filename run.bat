@echo off
color 0F
title SAVI'S collection Launcher
echo =======================================================
echo            SAVI'S COLLECTION STORE LAUNCHER
echo =======================================================
echo.
echo Starting SAVI'S Backend (API Server and Telegram Bot)...
start "SAVI'S Backend (Port 5000)" cmd /k "color 0F && cd backend && npm run dev"
echo.
echo Starting SAVI'S Frontend (Vite React Web App)...
start "SAVI'S Frontend (Port 5173)" cmd /k "color 0F && cd frontend && npm run dev"
echo.
echo Waiting for servers to initialize...
timeout /t 3 >nul
start http://localhost:5173
echo.
echo =======================================================
echo  Launch triggered successfully!
echo  - Backend running at http://localhost:5000
echo  - Frontend running at http://localhost:5173
echo =======================================================
echo.
pause
