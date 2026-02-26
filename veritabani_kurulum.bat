@echo off
echo ===================================================
echo Haberfoni Veritabani Kurulum ve Baslatma Scripti
echo ===================================================

echo.
echo [1/3] Backend klasorune geciliyor...
cd backend

echo.
echo [2/3] Prisma veritabani semasi guncelleniyor (db push)...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [HATA] Veritabani semasi olusturulamadi. Lutfen MySQL baglantinizi .env dosyasindan kontrol edin.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Varsayilan veriler yukleniyor (seed)...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo [HATA] Varsayilan veriler yuklenemedi.
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo Kurulum Basarili! Veritabani hazir.
echo Backend'i baslatmak icin:
echo   cd backend
echo   npm start veya npm run start:prod
echo ===================================================
pause
