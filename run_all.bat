@echo off
title Haberfoni Baslatma Yoneticisi
color 0A
cls

echo ==============================================
echo      Haberfoni Baslatma Yoneticisi
echo ==============================================
echo.
echo 1) Sistemi Baslat (Normal Kullanim - Veri Kaybi Yok)
echo 2) Veritabanini Kur / Guncelle (Sadece ilk kurulumda)
echo.
set /p secim="Lutfen islem secin (1 veya 2): "

cd /d "%~dp0"

if "%secim%"=="2" (
    echo.
    echo [BILGI] Veritabani semasi guncelleniyor...
    cd backend
    call npx prisma db push
    
    echo [BILGI] Varsayilan veriler -seed- yukleniyor...
    call npx prisma db seed
    cd ..
    
    echo.
    echo [BASARILI] Veritabani islemleri tamamlandi. Sistem baslatiliyor...
)

echo.
echo [BILGI] Backend (NestJS + Bot) baslatiliyor (Yeni Pencere)...
start "Haberfoni Backend" cmd /k "cd backend && npm run start:dev"

echo Lutfen backendin baslamasi icin 5 saniye bekleyin...
timeout /t 5

echo [BILGI] Frontend (Vite) baslatiliyor (Yeni Pencere)...
start "Haberfoni Frontend" cmd /k "npm run dev"

echo.
echo [BASARILI] Tum servisler baslatildi.
pause
