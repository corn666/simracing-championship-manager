# Script de build automatique pour GT3 Championship Manager
# Par CAZA - 2025

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   GT3 Championship Manager - Build Standalone" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon dossier
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "ERREUR : Executez ce script depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Étape 1 : Builder le frontend
Write-Host "Etape 1/5 : Build du frontend React..." -ForegroundColor Yellow
Set-Location frontend

# Vérifier/créer le .env
$envContent = "REACT_APP_API_URL=/api"
Set-Content -Path ".env" -Value $envContent
Write-Host "   OK - Fichier .env cree (API: /api)" -ForegroundColor Green

# Installer les dépendances si nécessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "   -> Installation des dependances npm..." -ForegroundColor Gray
    npm install
}

# Builder
Write-Host "   -> Build en cours..." -ForegroundColor Gray
npm run build | Out-Null

if (Test-Path "build") {
    Write-Host "   OK - Frontend builde avec succes" -ForegroundColor Green
} else {
    Write-Host "   ERREUR lors du build du frontend" -ForegroundColor Red
    exit 1
}

Set-Location ..

# Étape 2 : Préparer le backend
Write-Host ""
Write-Host "Etape 2/5 : Preparation du backend..." -ForegroundColor Yellow
Set-Location backend

# Créer le dossier public
if (Test-Path "public") {
    Remove-Item -Recurse -Force "public"
}
New-Item -ItemType Directory -Path "public" | Out-Null

# Copier le build du frontend
Write-Host "   -> Copie des fichiers frontend..." -ForegroundColor Gray
Copy-Item -Recurse -Force "..\frontend\build\*" "public\"
Write-Host "   OK - Frontend copie dans backend/public" -ForegroundColor Green

# Copier le bon package.json
Copy-Item -Force "package-standalone.json" "package.json"
Write-Host "   OK - Configuration package.json OK" -ForegroundColor Green

# Installer les dépendances
if (-not (Test-Path "node_modules")) {
    Write-Host "   -> Installation des dependances backend..." -ForegroundColor Gray
    npm install | Out-Null
}

Set-Location ..

# Étape 3 : Installer PKG si nécessaire
Write-Host ""
Write-Host "Etape 3/5 : Verification de PKG..." -ForegroundColor Yellow
$pkgInstalled = Get-Command pkg -ErrorAction SilentlyContinue
if (-not $pkgInstalled) {
    Write-Host "   -> Installation de PKG..." -ForegroundColor Gray
    npm install -g pkg
    Write-Host "   OK - PKG installe" -ForegroundColor Green
} else {
    Write-Host "   OK - PKG deja installe" -ForegroundColor Green
}

# Étape 4 : Compiler l'executable
Write-Host ""
Write-Host "Etape 4/5 : Compilation de l executable..." -ForegroundColor Yellow

# Créer le dossier dist
if (-not (Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist" | Out-Null
}

Set-Location backend
Write-Host "   -> Compilation en cours (cela peut prendre 2-3 minutes)..." -ForegroundColor Gray
pkg server-standalone.js --targets node18-win-x64 --output ..\dist\ChampionshipManager.exe

Set-Location ..

if (Test-Path "dist\ChampionshipManager.exe") {
    $fileSize = (Get-Item "dist\ChampionshipManager.exe").Length / 1MB
    Write-Host "   OK - Executable cree avec succes ($([math]::Round($fileSize, 1)) MB)" -ForegroundColor Green
} else {
    Write-Host "   ERREUR lors de la compilation" -ForegroundColor Red
    exit 1
}

# Étape 5 : Créer le package de distribution
Write-Host ""
Write-Host "Etape 5/5 : Creation du package de distribution..." -ForegroundColor Yellow

$releaseFolder = "ChampionshipManager-Release"
if (Test-Path $releaseFolder) {
    Remove-Item -Recurse -Force $releaseFolder
}
New-Item -ItemType Directory -Path $releaseFolder | Out-Null

# Copier les fichiers nécessaires
Copy-Item "dist\ChampionshipManager.exe" "$releaseFolder\"
Copy-Item "START_SERVER.bat" "$releaseFolder\"
Copy-Item "README.txt" "$releaseFolder\"

# Créer un fichier de config exemple
$configContent = @"
# Configuration GT3 Championship Manager
# 
# Pour changer le port, decommentez et modifiez :
# PORT=8081
"@
$configPath = Join-Path $releaseFolder "config.txt"
Set-Content -Path $configPath -Value $configContent

Write-Host "   OK - Package cree dans $releaseFolder\" -ForegroundColor Green

# Créer un ZIP
Write-Host ""
Write-Host "Creation de l archive ZIP..." -ForegroundColor Yellow
$zipPath = "ChampionshipManager-v1.0.0.zip"
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}
Compress-Archive -Path "$releaseFolder\*" -DestinationPath $zipPath
$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "   OK - Archive creee : $zipPath ($([math]::Round($zipSize, 1)) MB)" -ForegroundColor Green

# Résumé final
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   BUILD TERMINE AVEC SUCCES !" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fichiers crees :" -ForegroundColor White
Write-Host "   - $releaseFolder\ChampionshipManager.exe" -ForegroundColor Cyan
Write-Host "   - $releaseFolder\START_SERVER.bat" -ForegroundColor Cyan
Write-Host "   - $releaseFolder\README.txt" -ForegroundColor Cyan
Write-Host "   - $zipPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour tester :" -ForegroundColor White
Write-Host "   1. Ouvre le dossier $releaseFolder\" -ForegroundColor Gray
Write-Host "   2. Double-clic sur START_SERVER.bat" -ForegroundColor Gray
Write-Host "   3. Ouvre http://localhost:8081" -ForegroundColor Gray
Write-Host ""
Write-Host "Pour distribuer :" -ForegroundColor White
Write-Host "   Partage le fichier $zipPath" -ForegroundColor Gray
Write-Host ""
Write-Host "Bon championnat !" -ForegroundColor Green
Write-Host ""
