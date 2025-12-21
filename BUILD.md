# 🚀 Guide de Build - Executable Standalone

Ce guide explique comment créer un **executable standalone** de GT3 Championship Manager.

## 📦 Résultat final

```
📁 ChampionshipManager/
   ├── ChampionshipManager.exe      ⭐ L'executable (tout en un)
   ├── START_SERVER.bat             🚀 Script de démarrage pratique
   ├── gt3_championship.db          💾 Base de données (créée au 1er lancement)
   └── README.txt                   📖 Instructions
```

**Un seul double-clic** sur `START_SERVER.bat` et c'est parti ! 🎉

---

## 🛠️ Étapes de Build

### Prérequis

Sur ton PC Windows :
- Node.js 18+ installé
- npm installé

### Étape 1 : Préparer le frontend

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances (si pas déjà fait)
npm install

# IMPORTANT : Modifier le .env pour l'API locale
echo REACT_APP_API_URL=/api > .env

# Builder le frontend
npm run build
```

### Étape 2 : Copier le build dans le backend

```bash
# Depuis la racine du projet
# Créer le dossier public dans backend
mkdir backend\public

# Copier tout le contenu du build
xcopy /E /I frontend\build\* backend\public\
```

### Étape 3 : Builder l'executable

```bash
# Aller dans le dossier backend
cd backend

# Copier le bon package.json
copy package-standalone.json package.json

# Installer les dépendances
npm install

# Installer PKG globalement
npm install -g pkg

# Builder l'executable Windows
pkg server-standalone.js --targets node18-win-x64 --output ../dist/ChampionshipManager.exe
```

### Étape 4 : Créer le package de distribution

```bash
# Créer le dossier de distribution
mkdir ..\ChampionshipManager-Release

# Copier l'executable
copy ..\dist\ChampionshipManager.exe ..\ChampionshipManager-Release\

# Copier le script de démarrage
copy ..\START_SERVER.bat ..\ChampionshipManager-Release\

# Copier le README
copy ..\README.txt ..\ChampionshipManager-Release\
```

---

## 🎯 Utilisation

### Premier lancement

1. Double-clic sur `START_SERVER.bat`
2. Le serveur démarre
3. La base de données `gt3_championship.db` est créée automatiquement
4. Ouvre ton navigateur sur `http://localhost:8081`

### Accès depuis un autre PC

1. Lance le serveur sur le PC principal (double-clic sur START_SERVER.bat)
2. Note l'IP affichée (ex: `http://192.168.1.15:8081`)
3. Sur un autre PC du réseau, ouvre `http://192.168.1.15:8081`

### Arrêter le serveur

Appuie sur `Ctrl+C` dans la fenêtre du serveur

---

## 🔧 Configuration

### Changer le port

Édite `START_SERVER.bat` et ajoute avant le lancement :
```batch
set PORT=9000
ChampionshipManager.exe
```

### Firewall Windows

Si tu ne peux pas accéder depuis un autre PC :

1. Ouvre le Pare-feu Windows
2. Autoriser une application
3. Ajoute `ChampionshipManager.exe`
4. Coche "Privé" et "Public"

---

## 📁 Structure interne de l'executable

L'executable contient :
- Le serveur Node.js + Express
- Toutes les dépendances npm (sqlite3, cors, etc.)
- Le frontend React compilé (dans le dossier public/)
- La gestion de la base de données SQLite

**Taille de l'exe : ~60-80 MB** (tout inclus, aucune installation requise)

---

## 🎮 Fonctionnalités avancées possibles

### Import automatique depuis AMS2

Tu peux ajouter une route pour lire les fichiers de résultats :

```javascript
// Dans server-standalone.js
app.post('/api/import-ams2', (req, res) => {
  const fs = require('fs');
  const resultsPath = 'C:\\Program Files\\Steam\\...\\results.json';
  
  // Lire et parser le fichier
  const data = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  
  // Parser et importer automatiquement
  // ... logique d'import
  
  res.json({ success: true });
});
```

### Backup automatique

```javascript
// Backup de la DB toutes les heures
setInterval(() => {
  const fs = require('fs');
  const backupPath = `backup_${Date.now()}.db`;
  fs.copyFileSync('gt3_championship.db', backupPath);
}, 3600000); // 1 heure
```

---

## ❓ Troubleshooting

### L'executable ne démarre pas

- Vérifie que le port 8081 n'est pas déjà utilisé
- Lance en tant qu'administrateur
- Vérifie l'antivirus (peut bloquer l'exe)

### "Cannot find module"

- Le dossier `public/` doit être à côté de l'exe
- Rebuilder avec PKG en incluant les assets

### Base de données corrompue

- Supprime `gt3_championship.db`
- Relance l'exe (crée une nouvelle DB)

---

## 🚀 Distribution

Pour distribuer à tes amis :

1. Zippe le dossier `ChampionshipManager-Release`
2. Partage le ZIP
3. Ils dézippent et double-cliquent sur `START_SERVER.bat`

**C'est tout !** Pas d'installation, pas de configuration, ça marche out-of-the-box ! 📦

---

## 📊 Build pour d'autres plateformes

### Linux
```bash
pkg server-standalone.js --targets node18-linux-x64 --output ChampionshipManager-linux
```

### macOS
```bash
pkg server-standalone.js --targets node18-macos-x64 --output ChampionshipManager-macos
```

---

## 🎉 C'est prêt !

Tu as maintenant un **executable standalone portable** que tu peux :
- ✅ Lancer d'un double-clic
- ✅ Copier sur une clé USB
- ✅ Partager avec tes potes
- ✅ Accéder depuis n'importe quel PC du réseau
- ✅ Utiliser sans installer Node.js

Bon championnat ! 🏁
