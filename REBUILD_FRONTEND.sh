#!/bin/bash

echo "========================================"
echo "  Rebuild Frontend pour Standalone"
echo "========================================"
echo ""

echo "[1/4] Build du frontend..."
cd frontend
npm run build

echo ""
echo "[2/4] Copie du frontend vers le backend..."
cp -r build/* ../backend/public/

echo ""
echo "[3/4] Copie vers ChampionshipManager-Release..."
if [ -d "../backend/ChampionshipManager-Release/public" ]; then
    cp -r build/* ../backend/ChampionshipManager-Release/public/
fi

echo ""
echo "[4/4] Terminé !"
echo ""
echo "========================================"
echo "  Frontend rebuildé avec succès !"
echo "========================================"
echo ""
echo "Redémarrez le serveur (.exe) pour voir les changements"
echo ""
