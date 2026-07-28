@echo off
setlocal
cd /d "%~dp0"

echo.
echo AEJKY LIMOUSINE - VEHICLE TYPE DROPDOWN UPDATE
echo ==============================================
echo.

if not exist "app\professional-limousine-page.tsx" (
  echo ERROR: Extract this ZIP into the LIMOUSINE project root first.
  pause
  exit /b 1
)

echo Running production build...
call npm run build
if errorlevel 1 (
  echo.
  echo BUILD FAILED. Nothing will be pushed.
  pause
  exit /b 1
)

echo.
echo Build passed. Committing update...
git add app\professional-limousine-page.tsx
git commit -m "Add grouped vehicle type dropdown"

echo.
echo Pushing to GitHub...
git push origin main
if errorlevel 1 (
  echo.
  echo PUSH FAILED. Check GitHub login or remote settings.
  pause
  exit /b 1
)

echo.
echo DONE. Vercel should redeploy automatically.
pause
