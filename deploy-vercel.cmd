@echo off
setlocal
cd /d "%~dp0"
if exist .next rmdir /S /Q .next
call npm install
if errorlevel 1 goto error
call npm run build
if errorlevel 1 goto error
call vercel --prod
if errorlevel 1 goto error
exit /b 0
:error
echo Deployment stopped because a command failed.
pause
exit /b 1
