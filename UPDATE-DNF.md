# 🔄 Guide de Mise à Jour - Fonctionnalité DNF/DSQ/DNS

Cette mise à jour ajoute la possibilité de saisir les pilotes qui n'ont pas terminé dans les points :
- **DNF** (Did Not Finish) - Abandon
- **DSQ** - Disqualifié  
- **DNS** (Did Not Start) - Absent

Ces pilotes auront 0 points mais leur participation sera comptabilisée dans le classement général.

---

## 🎯 Ce qui change

### Backend
- Ajout d'une colonne `status` dans la table `results`
- La colonne `position` devient nullable (pour les DNF/DSQ/DNS)
- Mise à jour de la logique de sauvegarde des résultats

### Frontend
- Section "Autres participants" dans la saisie des résultats
- Bouton "+ Ajouter DNF / Disqualifié / Absent"
- Affichage des statuts dans le tableau des résultats

---

## 📋 Mise à Jour sur VPS

### ÉTAPE 1 : Sauvegarder la base de données

```bash
# Se connecter au VPS
ssh user@votre-ip-vps

# Sauvegarder la base de données actuelle
cd /var/www/gt3-championship/backend
cp gt3_championship.db gt3_championship.db.backup-$(date +%Y%m%d-%H%M%S)

# Vérifier la sauvegarde
ls -lh *.db*
```

### ÉTAPE 2 : Mettre à jour le backend

```bash
# Depuis ton PC Windows, transférer les nouveaux fichiers
scp backend/server.js user@votre-ip-vps:/var/www/gt3-championship/backend/
scp backend/database.js user@votre-ip-vps:/var/www/gt3-championship/backend/
scp backend/migrate.js user@votre-ip-vps:/var/www/gt3-championship/backend/
```

### ÉTAPE 3 : Migrer la base de données

```bash
# Sur le VPS
cd /var/www/gt3-championship/backend

# Lancer la migration
node migrate.js

# Tu devrais voir :
# Migration de la base de données...
# Ajout de la colonne status...
# ✓ Colonne status ajoutée avec succès
# Modification de la structure de la table results...
# ✓ Table results mise à jour avec succès
# ✓ Migration terminée !
```

### ÉTAPE 4 : Redémarrer le backend

```bash
# Redémarrer l'API
pm2 restart gt3-api

# Vérifier les logs
pm2 logs gt3-api --lines 20

# Vérifier le statut
pm2 status
```

### ÉTAPE 5 : Mettre à jour le frontend

```bash
# Sur ton PC, rebuild le frontend
cd frontend
npm run build

# Transférer sur le VPS
scp -r build/* user@votre-ip-vps:/var/www/html/gt3/
```

---

## ✅ Vérification

### 1. Tester l'API

```bash
# Sur le VPS
curl http://localhost:3001/api/pilots
# Devrait retourner la liste des pilotes
```

### 2. Tester le site

Ouvre ton navigateur et va sur ton site. Teste :

1. ✅ La page d'accueil s'affiche
2. ✅ Va dans un événement → "Gérer"
3. ✅ Tu devrais voir la section "Autres participants (DNF, Disqualifiés, Absents)"
4. ✅ Clique sur "+ Ajouter DNF / Disqualifié / Absent"
5. ✅ Sélectionne un pilote et un statut (DNF/DSQ/DNS)
6. ✅ Enregistre les résultats
7. ✅ Vérifie que le pilote apparaît dans les résultats avec son statut
8. ✅ Vérifie dans le classement général que sa participation est comptée

---

## 🎮 Utilisation

### Scénario d'exemple

**Situation** : Course de 24 pilotes, seulement 15 ont terminé la course.

**Saisie** :
1. Saisis P1 à P10 normalement (ceux qui ont marqué des points)
2. Clique sur "+ Ajouter DNF / Disqualifié / Absent"
3. Ajoute les pilotes P11 à P15 (qui ont terminé mais sans points) comme "DNF"
4. Ajoute les 9 autres pilotes :
   - Ceux qui ont abandonné → DNF
   - Ceux qui étaient absents → DNS
   - Ceux qui ont été disqualifiés → DSQ

**Résultat dans le classement** :
- Tous les pilotes auront "+1" dans la colonne "Courses"
- Seuls ceux dans le top 10 auront des points
- Les autres auront 0 points mais leur participation est comptée

---

## 🔧 En cas de problème

### La migration échoue

```bash
# Restaurer la sauvegarde
cd /var/www/gt3-championship/backend
cp gt3_championship.db.backup-XXXXXX gt3_championship.db

# Relancer la migration
node migrate.js
```

### Le backend ne redémarre pas

```bash
# Voir les logs d'erreur
pm2 logs gt3-api --lines 50

# Si problème de syntaxe, revérifier les fichiers transférés
```

### Le frontend ne s'affiche pas correctement

```bash
# Vérifier les fichiers transférés
ls -la /var/www/html/gt3/

# Vérifier les logs Apache
sudo tail -f /var/log/apache2/gt3-error.log
```

### Rollback complet si nécessaire

```bash
# Backend : restaurer l'ancienne DB
cd /var/www/gt3-championship/backend
cp gt3_championship.db.backup-XXXXXX gt3_championship.db
pm2 restart gt3-api

# Frontend : rebuild l'ancienne version sur ton PC et retransférer
```

---

## 📝 Notes Importantes

1. **Compatibilité ascendante** : Les anciennes courses (sans DNF/DSQ/DNS) continuent de fonctionner normalement
2. **Optionnel** : Tu n'es pas obligé d'ajouter des DNF/DSQ/DNS, tu peux continuer à saisir uniquement le top 10
3. **Pas de doublons** : Un pilote dans les résultats normaux ne peut pas être ajouté en DNF/DSQ/DNS et vice-versa
4. **0 points** : Les pilotes en DNF/DSQ/DNS ont toujours 0 points
5. **Participation comptée** : Leur participation apparaît dans la colonne "Courses" du classement

---

## 🎉 C'est prêt !

Ta mise à jour est terminée. Tu peux maintenant gérer tous les participants de tes courses, même ceux qui n'ont pas terminé dans les points !

Bon championnat ! 🏁
