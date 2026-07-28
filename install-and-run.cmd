@echo off
setlocal
cd /d "%~dp0"
echo.
echo ========================================
echo  A3 PREMIUM LIMOUSINE - INSTALL
ECHO ========================================
echo.
if exist .next rmdir /S /Q .next
if exist node_modules\.cache rmdir /S /Q node_modules\.cache
call npm install
if errorlevel 1 goto error
call npm run build
if errorlevel 1 goto error
echo.
echo Build successful. Starting website...
call npm run dev
exit /b 0
:error
echo.
echo Installation or build failed. Review the error above.
pause
exit /b 1
