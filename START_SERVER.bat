@echo off
chcp 65001 > nul
color 0A
cls

echo.
echo ============================================================
echo    GT3 Championship Manager - Serveur
echo ============================================================
echo.

REM Obtenir l'adresse IP locale
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo Demarrage du serveur...
echo.
echo Serveur accessible sur :
echo    - Local:  http://localhost:8081
echo    - Reseau: http://%IP%:8081
echo.
echo Base de donnees: gt3_championship.db
echo.
echo Ouvrez votre navigateur sur http://localhost:8081
echo    (ou depuis un autre PC: http://%IP%:8081)
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo ============================================================
echo.

REM Lancer le serveur
ChampionshipManager.exe

pause
