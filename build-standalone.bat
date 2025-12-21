@echo off
chcp 65001 > nul
color 0B
cls

echo.
echo ============================================================
echo    🏁 GT3 Championship Manager - Build Standalone
echo ============================================================
echo.

echo 📦 Étape 1/5 : Build du frontend...
cd frontend
echo REACT_APP_API_URL=/api > .env
call npm install
call npm run build
cd ..
echo    ✓ Frontend OK
echo.

echo 📦 Étape 2/5 : Préparation backend...
cd backend
if exist public rmdir /s /q public
mkdir public
xcopy /E /I /Q ..\frontend\build\* public\
copy /Y package-standalone.json package.json
call npm install
cd ..
echo    ✓ Backend OK
echo.

echo 📦 Étape 3/5 : Installation PKG...
call npm install -g pkg
echo    ✓ PKG OK
echo.

echo 📦 Étape 4/5 : Compilation executable...
echo    (Ceci peut prendre 2-3 minutes...)
cd backend
call pkg server-standalone.js --targets node18-win-x64 --output ..\dist\ChampionshipManager.exe
cd ..
echo    ✓ Executable créé
echo.

echo 📦 Étape 5/5 : Package final...
if exist ChampionshipManager-Release rmdir /s /q ChampionshipManager-Release
mkdir ChampionshipManager-Release
copy dist\ChampionshipManager.exe ChampionshipManager-Release\
copy START_SERVER.bat ChampionshipManager-Release\
copy README.txt ChampionshipManager-Release\
echo    ✓ Package créé
echo.

echo ============================================================
echo    ✅ BUILD TERMINÉ !
echo ============================================================
echo.
echo 📁 Dossier : ChampionshipManager-Release\
echo.
echo 🚀 Pour tester :
echo    1. Ouvre ChampionshipManager-Release\
echo    2. Double-clic sur START_SERVER.bat
echo    3. Ouvre http://localhost:8081
echo.
echo ============================================================
echo.

pause
