@echo off
echo ========================================
echo   Push sur GitHub
echo ========================================
echo.

echo [1/5] Initialisation Git...
git init

echo.
echo [2/5] Ajout du remote GitHub...
git remote add origin https://github.com/corn666/simracing-championship-manager.git

echo.
echo [3/5] Ajout des fichiers...
git add .

echo.
echo [4/5] Commit...
git commit -m "Initial commit - GT3 Championship Manager"

echo.
echo [5/5] Push vers GitHub...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo   Push termine !
echo ========================================
echo.
echo Visite : https://github.com/corn666/simracing-championship-manager
echo.
pause
