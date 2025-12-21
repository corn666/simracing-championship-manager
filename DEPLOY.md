# 🚀 Guide de Déploiement Rapide sur VPS

## Prérequis sur le VPS
```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js (version 18 LTS recommandée)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer Apache
sudo apt install -y apache2

# Installer PM2 pour gérer le backend
sudo npm install -g pm2
```

## 1. Transférer les fichiers sur le VPS

```bash
# Depuis votre machine locale
scp -r gt3-championship user@votre-vps-ip:/home/user/

# Ou utilisez git
ssh user@votre-vps-ip
cd /home/user
git clone [votre-repo] gt3-championship
```

## 2. Configuration du Backend

```bash
cd /home/user/gt3-championship/backend

# Installer les dépendances
npm install --production

# Créer le fichier .env
nano .env
```

Contenu de `.env`:
```
PORT=3001
```

```bash
# Lancer le backend avec PM2
pm2 start server.js --name gt3-api

# Sauvegarder la config PM2
pm2 save

# Auto-démarrage au boot
pm2 startup
# Exécutez la commande affichée

# Vérifier le statut
pm2 status
pm2 logs gt3-api
```

## 3. Build et Déploiement du Frontend

```bash
cd /home/user/gt3-championship/frontend

# Créer le .env avec l'URL de votre VPS
nano .env
```

Contenu de `.env`:
```
REACT_APP_API_URL=http://VOTRE_IP_VPS:3001/api
```

```bash
# Installer les dépendances
npm install

# Build pour production
npm run build

# Déplacer le build vers Apache
sudo mkdir -p /var/www/gt3-championship
sudo cp -r build/* /var/www/gt3-championship/
sudo chown -R www-data:www-data /var/www/gt3-championship
```

## 4. Configuration Apache

```bash
# Créer la configuration du site
sudo nano /etc/apache2/sites-available/gt3-championship.conf
```

Contenu:
```apache
<VirtualHost *:80>
    ServerName votre-domaine.com
    # ou utilisez ServerName votre-ip-vps si pas de domaine
    
    DocumentRoot /var/www/gt3-championship

    <Directory /var/www/gt3-championship>
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

# Activer le site
sudo a2ensite gt3-championship

# Désactiver le site par défaut (optionnel)
sudo a2dissite 000-default

# Redémarrer Apache
sudo systemctl restart apache2
```

## 5. Configuration du Firewall

```bash
# Autoriser HTTP, HTTPS et le port API
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 'Apache Full'

# Activer le firewall (si pas déjà fait)
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

## 6. Tester l'installation

```bash
# Tester le backend
curl http://localhost:3001/api/pilots

# Depuis votre navigateur
http://votre-ip-vps          # Frontend
http://votre-ip-vps:3001/api/pilots  # Backend API
```

## 7. (Optionnel) HTTPS avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-apache

# Obtenir un certificat (nécessite un nom de domaine)
sudo certbot --apache -d votre-domaine.com

# Le renouvellement automatique est configuré automatiquement
# Tester le renouvellement
sudo certbot renew --dry-run
```

Après HTTPS, modifier le frontend `.env`:
```
REACT_APP_API_URL=https://votre-domaine.com:3001/api
```

Puis rebuild et redéployer:
```bash
cd /home/user/gt3-championship/frontend
npm run build
sudo cp -r build/* /var/www/gt3-championship/
```

## 8. Maintenance

### Voir les logs du backend
```bash
pm2 logs gt3-api
```

### Redémarrer le backend
```bash
pm2 restart gt3-api
```

### Backup de la base de données
```bash
cp /home/user/gt3-championship/backend/gt3_championship.db \
   /home/user/gt3-championship/backend/gt3_championship.db.backup-$(date +%Y%m%d)
```

### Mise à jour de l'application
```bash
# Backend
cd /home/user/gt3-championship/backend
git pull  # ou transférez les nouveaux fichiers
npm install
pm2 restart gt3-api

# Frontend
cd /home/user/gt3-championship/frontend
git pull
npm install
npm run build
sudo cp -r build/* /var/www/gt3-championship/
```

## Dépannage

### Le backend ne démarre pas
```bash
pm2 logs gt3-api --lines 50
```

### Apache ne sert pas le site
```bash
sudo systemctl status apache2
sudo tail -f /var/log/apache2/error.log
```

### Le frontend ne se connecte pas au backend
- Vérifiez que le backend tourne: `pm2 status`
- Vérifiez le fichier .env du frontend
- Vérifiez le firewall: `sudo ufw status`
- Testez l'API: `curl http://localhost:3001/api/pilots`

### Erreur CORS
Modifiez `backend/server.js`:
```javascript
app.use(cors({
  origin: 'http://votre-domaine.com'  // ou votre IP
}));
```

## 🎉 C'est prêt !

Votre application est maintenant accessible via:
- Frontend: http://votre-ip-vps
- Backend API: http://votre-ip-vps:3001

Bon championnat ! 🏁
