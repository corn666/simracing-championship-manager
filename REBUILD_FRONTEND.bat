@echo off
echo ========================================
echo   Rebuild Frontend pour Standalone
echo ========================================
echo.

echo [1/4] Build du frontend...
cd frontend
call npm run build

echo.
echo [2/4] Copie du frontend vers le backend...
xcopy /E /I /Y build\..\backend\public

echo.
echo [3/4] Copie vers ChampionshipManager-Release...
if exist ..\backend\ChampionshipManager-Release\public (
    xcopy /E /I /Y build ..\backend\ChampionshipManager-Release\public
)

echo.
echo [4/4] Termine !
echo.
echo ========================================
echo   Frontend rebuilde avec succes !
echo ========================================
echo.
echo Redemarrez le serveur (.exe) pour voir les changements
echo.
pause
