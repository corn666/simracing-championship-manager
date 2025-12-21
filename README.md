# 🏁 GT3 Championship Manager pour Automobilista 2

Application web complète pour gérer vos championnats GT3 sur Automobilista 2.

## 🎯 Fonctionnalités

### ✅ Gestion des Pilotes
- Ajout de 24 participants maximum
- Différenciation Humain / IA
- Modification et suppression

### ✅ Championnats
- Création de championnats avec nombre de courses défini
- Sélection des participants du championnat
- Classements en temps réel avec podium visuel
- Historique des courses

### ✅ Événements (Courses)
- Création de courses (championnat ou libres)
- Gestion du statut : À venir / En cours / Terminée
- Saisie intelligente des résultats avec menus déroulants sans doublons
- Système de points automatique : 25-18-15-12-10-8-6-4-2-1

### ✅ Interface
- Design moderne et responsive
- Navigation intuitive
- Tableaux de classement détaillés
- Podium visuel pour les championnats

## 🛠️ Technologies

- **Frontend**: React 18 + React Router
- **Backend**: Node.js + Express
- **Base de données**: SQLite
- **Style**: CSS personnalisé avec dégradés

## 📦 Installation

### Prérequis
- Node.js 16+ et npm
- Un serveur Linux (VPS)
- Apache (optionnel, pour la production)

### 1. Installation du Backend

```bash
cd backend
npm install
cp .env.example .env
# Modifier .env si nécessaire
npm start
```

Le backend sera accessible sur `http://localhost:3001`

### 2. Installation du Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Modifier REACT_APP_API_URL avec l'IP de votre VPS si nécessaire
npm start
```

Le frontend sera accessible sur `http://localhost:3000`

## 🚀 Déploiement sur VPS

### Backend (API)

1. **Installation sur le VPS**
```bash
# Transférer le dossier backend sur votre VPS
cd /var/www/gt3-championship/backend
npm install --production
```

2. **Configuration avec PM2 (recommandé)**
```bash
# Installer PM2 globalement
npm install -g pm2

# Lancer l'API
pm2 start server.js --name gt3-api

# Auto-démarrage au boot
pm2 startup
pm2 save
```

3. **Créer le fichier .env**
```bash
nano .env
```
```
PORT=3001
```

### Frontend (React)

1. **Build pour production**
```bash
cd frontend
# Modifier .env avec l'URL de votre VPS
nano .env
# REACT_APP_API_URL=http://votre-ip-vps:3001/api

npm run build
```

2. **Configuration Apache**
```bash
# Transférer le dossier build vers /var/www/gt3-championship
sudo nano /etc/apache2/sites-available/gt3-championship.conf
```

```apache
<VirtualHost *:80>
    ServerName votre-domaine.com
    DocumentRoot /var/www/gt3-championship/build

    <Directory /var/www/gt3-championship/build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Pour React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/gt3-error.log
    CustomLog ${APACHE_LOG_DIR}/gt3-access.log combined
</VirtualHost>
```

```bash
# Activer les modules nécessaires
sudo a2enmod rewrite
sudo a2ensite gt3-championship
sudo systemctl reload apache2
```

### Alternative: Serveur Node.js simple

Si vous ne voulez pas utiliser Apache, vous pouvez servir le build avec un serveur Node :

```bash
npm install -g serve
serve -s build -p 80
```

## 🔧 Configuration

### Variables d'environnement

**Backend (.env)**
```
PORT=3001
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://votre-ip-vps:3001/api
```

### Base de données

La base de données SQLite (`gt3_championship.db`) est créée automatiquement au premier lancement du backend.

**Emplacement**: `backend/gt3_championship.db`

**Backup manuel**:
```bash
cp backend/gt3_championship.db backend/gt3_championship.db.backup
```

## 📊 Structure de la base de données

- **pilots**: Liste des pilotes (id, name, is_human)
- **championships**: Championnats (id, name, total_races)
- **championship_participants**: Liaison pilotes ↔ championnats
- **events**: Événements/courses (id, name, circuit, date, championship_id, status)
- **results**: Résultats (id, event_id, pilot_id, position, points)

## 🎮 Utilisation

### Workflow typique

1. **Créer les pilotes** (24 max)
   - Menu "Pilotes" → Ajouter chaque pilote
   - Cocher "Pilote humain" pour les humains

2. **Créer un championnat**
   - Menu "Championnats" → Nouveau championnat
   - Définir le nom et le nombre de courses
   - Sélectionner les participants (cocher les pilotes)

3. **Créer un événement**
   - Menu "Événements" → Nouvel événement
   - Remplir les infos (nom, circuit, date)
   - Cocher "Course de championnat" si applicable
   - Sélectionner le championnat

4. **Saisir les résultats**
   - Cliquer sur "Gérer" pour un événement
   - Sélectionner les pilotes dans l'ordre d'arrivée (P1 à P10)
   - Les pilotes déjà sélectionnés n'apparaissent plus dans les menus suivants
   - Enregistrer les résultats

5. **Voir le classement**
   - Menu "Championnats" → Voir le classement
   - Podium visuel + tableau complet

## 🔒 Sécurité

Pour la production, considérez :

1. **HTTPS** : Utilisez Let's Encrypt avec Certbot
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d votre-domaine.com
```

2. **Firewall** : Limitez l'accès au port 3001
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw enable
```

3. **CORS** : Le backend accepte toutes les origines par défaut. Modifiez `server.js` pour restreindre :
```javascript
app.use(cors({
  origin: 'https://votre-domaine.com'
}));
```

## 🐛 Dépannage

### Le frontend ne se connecte pas au backend
- Vérifiez que le backend tourne : `pm2 status`
- Vérifiez l'URL dans `.env` du frontend
- Vérifiez le firewall : `sudo ufw status`

### Erreur de base de données
- Vérifiez les permissions : `ls -la backend/`
- Supprimez et recréez la DB : `rm backend/gt3_championship.db` puis redémarrez

### Apache ne redirige pas correctement
- Vérifiez que mod_rewrite est activé : `sudo a2enmod rewrite`
- Vérifiez les logs : `tail -f /var/log/apache2/gt3-error.log`

## 📝 API Endpoints

### Pilotes
- `GET /api/pilots` - Liste des pilotes
- `POST /api/pilots` - Créer un pilote
- `DELETE /api/pilots/:id` - Supprimer un pilote

### Championnats
- `GET /api/championships` - Liste des championnats
- `GET /api/championships/:id` - Détails d'un championnat
- `POST /api/championships` - Créer un championnat
- `DELETE /api/championships/:id` - Supprimer un championnat
- `GET /api/championships/:id/standings` - Classement
- `GET /api/championships/:id/events` - Courses du championnat

### Événements
- `GET /api/events` - Liste des événements
- `GET /api/events/:id` - Détails d'un événement
- `POST /api/events` - Créer un événement
- `DELETE /api/events/:id` - Supprimer un événement
- `PATCH /api/events/:id/status` - Changer le statut
- `POST /api/events/:id/results` - Enregistrer les résultats

## 📄 Licence

Projet personnel - Libre d'utilisation

## 🏎️ Bon championnat !

Profitez bien de vos courses GT3 sur Automobilista 2 ! 🏁
