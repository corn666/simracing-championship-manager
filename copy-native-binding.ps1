# Script pour copier le fichier .node de better-sqlite3

$nodeFile = Get-ChildItem -Path "backend\node_modules\better-sqlite3" -Filter "better_sqlite3.node" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

if ($nodeFile) {
    Write-Host "Fichier .node trouve: $($nodeFile.FullName)" -ForegroundColor Green
    
    # Copier à côté de l'exe
    if (Test-Path "ChampionshipManager-Release\ChampionshipManager.exe") {
        Copy-Item $nodeFile.FullName "ChampionshipManager-Release\better_sqlite3.node" -Force
        Write-Host "Fichier .node copie dans ChampionshipManager-Release\" -ForegroundColor Green
    }
    
    if (Test-Path "dist\ChampionshipManager.exe") {
        Copy-Item $nodeFile.FullName "dist\better_sqlite3.node" -Force
        Write-Host "Fichier .node copie dans dist\" -ForegroundColor Green
    }
} else {
    Write-Host "ATTENTION: Fichier better_sqlite3.node non trouve!" -ForegroundColor Red
    Write-Host "Le .exe ne fonctionnera probablement pas." -ForegroundColor Red
}
