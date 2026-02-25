@echo off
title Haberfoni Tum Sistem
color 0A
cls

echo ==============================================
echo   Haberfoni Backend ve Frontend Baslatiliyor...
echo ==============================================
echo.

cd /d "%~dp0"

:: Start backend in a new window
echo [BILGI] Backend (NestJS + Bot) baslatiliyor (Yeni Pencere)...
start "Haberfoni Backend" cmd /k "cd backend && npm run start:dev"

:: Wait a few seconds to let backend start
timeout /t 3 /nobreak >nul

:: Start frontend in this window
echo [BILGI] Frontend (Vite) baslatiliyor...
npm run dev
