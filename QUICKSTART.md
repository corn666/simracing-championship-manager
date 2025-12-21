# 🏁 GT3 Championship Manager - Démarrage Rapide

## 🎯 Ce que tu as

Une application web complète pour gérer tes championnats GT3 sur AMS2 avec :
- ✅ Gestion de 24 pilotes (humains + IA)
- ✅ Championnats multiples
- ✅ Courses championnat + courses libres
- ✅ Saisie intelligente des résultats (menus déroulants sans doublons)
- ✅ Système de points automatique : 25-18-15-12-10-8-6-4-2-1
- ✅ Classements en temps réel avec podium visuel
- ✅ Interface moderne et responsive

## 📦 Installation Locale (Développement)

### 1. Extraire l'archive
```bash
tar -xzf gt3-championship.tar.gz
cd gt3-championship
```

### 2. Démarrage rapide avec le script
```bash
./start-dev.sh
```

**OU manuellement :**

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
# Backend sur http://localhost:3001
```

### Frontend (dans un autre terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm start
# Frontend sur http://localhost:3000
```

## 🚀 Déploiement sur VPS

Voir le fichier **DEPLOY.md** pour le guide complet, mais voici les étapes clés :

### 1. Installer les prérequis sur le VPS
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs apache2
sudo npm install -g pm2
```

### 2. Transférer les fichiers
```bash
scp -r gt3-championship user@votre-vps-ip:/home/user/
```

### 3. Backend (API)
```bash
cd /home/user/gt3-championship/backend
npm install --production
nano .env  # PORT=3001
pm2 start server.js --name gt3-api
pm2 save
pm2 startup
```

### 4. Frontend
```bash
cd /home/user/gt3-championship/frontend
nano .env  # REACT_APP_API_URL=http://VOTRE_IP:3001/api
npm install
npm run build
sudo cp -r build/* /var/www/gt3-championship/
```

### 5. Apache
```bash
sudo nano /etc/apache2/sites-available/gt3-championship.conf
# Copier la config depuis DEPLOY.md
sudo a2enmod rewrite
sudo a2ensite gt3-championship
sudo systemctl restart apache2
```

### 6. Firewall
```bash
sudo ufw allow 80/tcp
sudo ufw allow 3001/tcp
sudo ufw enable
```

## 📖 Utilisation

### Workflow typique :

1. **Créer les 24 pilotes**
   - Menu "Pilotes" → Ajouter un par un
   - Cocher "Pilote humain" pour les 5 humains

2. **Créer un championnat**
   - Menu "Championnats" → Nouveau championnat
   - Nom : "Championnat GT3 Hiver 2024"
   - Nombre de courses : 10
   - Cocher les 24 participants

3. **Créer un événement**
   - Menu "Événements" → Nouvel événement
   - Nom : "Course #1 - Spa"
   - Circuit : "Spa-Francorchamps"
   - Date : choisir la date
   - ✅ Cocher "Course de championnat"
   - Sélectionner le championnat

4. **Après la course**
   - Cliquer sur "Gérer" pour l'événement
   - Changer le statut en "Terminée"
   - Saisir les résultats : P1 à P10
   - Les pilotes sélectionnés disparaissent des menus suivants (pas de doublon !)
   - Enregistrer

5. **Voir le classement**
   - Menu "Championnats" → Voir le classement
   - Podium visuel avec les 3 premiers
   - Tableau complet avec tous les participants

## 📁 Fichiers Importants

- **README.md** : Documentation complète
- **DEPLOY.md** : Guide détaillé de déploiement VPS
- **STRUCTURE.md** : Structure du projet et détails techniques
- **start-dev.sh** : Script de démarrage rapide

## 🔧 Configuration

### Backend (.env)
```
PORT=3001
```

### Frontend (.env)
```
# Local
REACT_APP_API_URL=http://localhost:3001/api

# Production VPS
REACT_APP_API_URL=http://VOTRE_IP_VPS:3001/api
```

## 🐛 Problèmes Courants

### Le frontend ne se connecte pas au backend
- Vérifier que le backend tourne : `pm2 status` ou regarder le terminal
- Vérifier l'URL dans `.env` du frontend
- Vérifier le firewall si sur VPS

### Erreur de base de données
- La base SQLite est créée automatiquement au premier lancement
- Emplacement : `backend/gt3_championship.db`

### Apache ne marche pas
- Vérifier que mod_rewrite est activé : `sudo a2enmod rewrite`
- Regarder les logs : `sudo tail -f /var/log/apache2/error.log`

## 📊 API Endpoints

**Pilotes**
- GET `/api/pilots` - Liste
- POST `/api/pilots` - Créer
- DELETE `/api/pilots/:id` - Supprimer

**Championnats**
- GET `/api/championships` - Liste
- GET `/api/championships/:id` - Détails
- GET `/api/championships/:id/standings` - Classement
- POST `/api/championships` - Créer
- DELETE `/api/championships/:id` - Supprimer

**Événements**
- GET `/api/events` - Liste
- GET `/api/events/:id` - Détails
- POST `/api/events` - Créer
- PATCH `/api/events/:id/status` - Changer statut
- POST `/api/events/:id/results` - Enregistrer résultats
- DELETE `/api/events/:id` - Supprimer

## 🎮 Caractéristiques Techniques

- **React 18** avec React Router 6
- **Node.js + Express** pour l'API
- **SQLite** pour la base de données (fichier local)
- **Design responsive** avec CSS pur
- **Menus intelligents** : pas de doublons dans la saisie
- **Points automatiques** : calcul selon la position
- **Classement dynamique** : mis à jour après chaque course

## 💡 Astuces

- Tu peux avoir plusieurs championnats en cours en même temps
- Les courses "libres" (sans championnat) n'affectent pas le classement
- Si tu supprimes une course, les points sont retirés automatiquement du classement
- La base de données SQLite est un simple fichier - facile à backup !

## 🏎️ Bon championnat !

Tout est prêt, il ne te reste plus qu'à :
1. Installer avec `./start-dev.sh` (ou déployer sur ton VPS)
2. Créer tes pilotes
3. Lancer ton championnat
4. Profiter de tes courses GT3 ! 🏁

Pour plus de détails, consulte les fichiers README.md et DEPLOY.md.
