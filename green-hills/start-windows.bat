@echo off
title Green Hills website
cd /d "%~dp0"

set PY=python
where py >nul 2>nul && set PY=py
where %PY% >nul 2>nul || (echo Python is not installed. Get it from https://www.python.org/downloads/ & pause & exit /b)
where npm >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org & pause & exit /b)

echo.
echo === 1/4 Building the website ===
cd frontend
if not exist node_modules call npm install
call npm run build || (echo Build failed & pause & exit /b)
cd ..

echo.
echo === 2/4 Installing Django ===
cd backend
%PY% -m pip install -q -r requirements.txt

echo.
echo === 3/4 Preparing the database ===
%PY% manage.py migrate --noinput

if not exist .admin_created (
  echo.
  echo Create your admin login for the bookings panel:
  %PY% manage.py createsuperuser && echo done> .admin_created
)

echo.
echo === 4/4 Starting ===
echo.
echo  On this PC:     http://127.0.0.1:8010
echo  Admin panel:    http://127.0.0.1:8010/admin
echo.
echo  On your PHONE (must be on the same Wi-Fi as this PC), open:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do for /f "tokens=* delims= " %%b in ("%%a") do echo                  http://%%b:8010
echo  (if two addresses show, try the one starting with 192.168)
echo.
echo  If Windows asks to allow Python through the firewall, tick "Private networks" and click Allow.
echo  Keep this window open while you test. Close it to stop the website.
echo.
start "" http://127.0.0.1:8010
%PY% manage.py runserver 0.0.0.0:8010
pause
