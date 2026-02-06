@echo off
title Haberfoni Haber Botu
color 0A
cls

echo ==============================================
echo   Haberfoni Haber Botu Baslatiliyor...
echo ==============================================
echo.

cd /d "%~dp0"

:: Node.js kontrolu
where node >nul 2>nul
if %errorlevel% neq 0 goto ERROR_NODE

:: Bot klasorunu kontrol et
if not exist "bot" goto ERROR_FOLDER

cd bot

:: Node modules kontrolu
if exist "node_modules" goto RUN_BOT

echo [BILGI] Ilk kurulum yapiliyor (paketler yukleniyor)...
echo Bu islem internet hizina gore 1-2 dakika surebilir.
call npm install
if %errorlevel% neq 0 goto ERROR_INSTALL

:RUN_BOT
echo.
echo [BILGI] Bot calistiriliyor...
echo [BILGI] Durdurmak icin bu pencereyi kapatin (X) veya Ctrl+C yapin.
echo.

call npm start
if %errorlevel% neq 0 goto ERROR_RUN

pause
exit

:ERROR_NODE
color 0C
echo [HATA] Node.js yuklu degil veya PATH'e ekli degil!
echo Lutfen Node.js yukleyin: https://nodejs.org/
echo.
pause
exit

:ERROR_FOLDER
color 0C
echo [HATA] 'bot' klasoru bulunamadi!
echo Scriptin, proje ana dizininde oldugundan emin olun.
pause
exit

:ERROR_INSTALL
color 0C
echo [HATA] Paket yukleme basarisiz oldu. Internet baglantinizi kontrol edin.
pause
exit

:ERROR_RUN
color 0C
echo.
echo [HATA] Bot bir hata ile kapandi.
echo Yukaridaki hata mesajini kontrol edin.
pause
exit
