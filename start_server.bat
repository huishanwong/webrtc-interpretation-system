@echo off
chcp 65001 >nul
title Interpretation System - Windows Server
cd /d "%~dp0"

:: 1. Check if node_modules exists, if not, auto-run npm install
if not exist "node_modules" (
    echo ⚙️ [Setup] 'node_modules' not found. Installing project dependencies (npm install)...
    call npm install
    echo ✅ Dependencies installed successfully!
)

:: 2. Check if mkcert.exe exists in the folder, if not, download it automatically
if not exist "mkcert.exe" (
    echo ⚙️ [Setup] 'mkcert.exe' not found. Downloading automatically...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe' -OutFile 'mkcert.exe'"
)

:: 3. Install local CA trusting
mkcert.exe -install >nul 2>&1

:: 4. Auto-detect Local IP
set IP_ADDR=127.0.0.1
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0.*0.0.0.0') do (set IP_ADDR=%%a)

cls
echo ===============================================
echo      Interpretation System ^| Windows Live Server
echo ===============================================
echo.
echo [1/3] 📡 Detecting Network... Done! (IP: %IP_ADDR%)

:: 5. Update Certificates (Fixed filenames: key.pem & cert.pem)
echo [2/3] 🔐 Updating Certificates...
mkcert.exe -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 %IP_ADDR% >nul 2>&1

:: 6. Launch Server & Browser
echo [3/3] 🚀 Launching Server...
echo.
echo -----------------------------------------------
echo    📌 Listener:  https://%IP_ADDR%:3000
echo    🔐 Admin:     https://%IP_ADDR%:3000/admin.html
echo    📊 Monitor:   https://%IP_ADDR%:3000/monitor.html
echo -----------------------------------------------
echo.

:: Delay launching browser to ensure server is ready
start "" "https://localhost:3000/monitor.html"

:: Run Node.js
node server.js
pause