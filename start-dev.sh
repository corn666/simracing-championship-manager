#!/bin/bash

echo "🏁 Démarrage de GT3 Championship Manager..."
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installez-le depuis https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Backend
echo "📦 Installation et démarrage du backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances backend..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "Création du fichier .env..."
    cp .env.example .env
fi

echo "Démarrage du serveur backend sur le port 3001..."
node server.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

cd ..

# Attendre que le backend démarre
sleep 3

# Frontend
echo ""
echo "📦 Installation et démarrage du frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances frontend..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "Création du fichier .env..."
    cp .env.example .env
fi

echo ""
echo "✅ L'application démarre..."
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:3001"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les serveurs"
echo ""

# Démarrer le frontend
npm start

# Cleanup au Ctrl+C
trap "echo ''; echo 'Arrêt des serveurs...'; kill $BACKEND_PID 2>/dev/null; exit 0" INT TERM

wait
