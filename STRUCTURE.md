# Structure du Projet GT3 Championship Manager

```
gt3-championship/
│
├── README.md                    # Documentation complète
├── DEPLOY.md                    # Guide de déploiement VPS
├── .gitignore                   # Fichiers à ignorer par Git
├── start-dev.sh                 # Script de démarrage rapide (développement)
│
├── backend/                     # API Node.js + Express
│   ├── package.json            # Dépendances backend
│   ├── .env.example            # Exemple de configuration
│   ├── server.js               # Serveur Express + Routes API
│   └── database.js             # Configuration SQLite + schéma
│
└── frontend/                    # Application React
    ├── package.json            # Dépendances frontend
    ├── .env.example            # Exemple de configuration
    │
    ├── public/
    │   └── index.html          # HTML principal
    │
    └── src/
        ├── index.js            # Point d'entrée React
        ├── App.js              # Composant principal + Router
        │
        ├── components/
        │   └── Navigation.js   # Barre de navigation
        │
        ├── pages/
        │   ├── Home.js                  # Page d'accueil
        │   ├── Pilots.js                # Gestion des pilotes
        │   ├── Championships.js         # Liste des championnats
        │   ├── ChampionshipDetail.js    # Détail + classement
        │   ├── Events.js                # Liste des événements
        │   └── EventDetail.js           # Détail + saisie résultats
        │
        ├── services/
        │   └── api.js          # Service API (fetch)
        │
        └── styles/
            └── App.css         # Styles globaux
```

## Description des fichiers clés

### Backend

**server.js** (390 lignes)
- Configuration Express + CORS
- Routes API pour pilotes, championnats, événements, résultats
- Système de points automatique
- Gestion des classements

**database.js** (70 lignes)
- Configuration SQLite
- Schéma de la base de données (5 tables)
- Initialisation automatique

### Frontend

**pages/Pilots.js**
- Liste des pilotes
- Formulaire d'ajout
- Badge Humain/IA
- Suppression

**pages/Championships.js**
- Liste des championnats
- Formulaire de création
- Sélection multiple des participants
- Lien vers les détails

**pages/ChampionshipDetail.js**
- Podium visuel (top 3)
- Tableau de classement complet
- Liste des courses du championnat
- Statistiques

**pages/Events.js**
- Liste des événements
- Formulaire de création
- Case à cocher "Course de championnat"
- Sélection du championnat
- Statut des courses

**pages/EventDetail.js**
- Informations de l'événement
- Changement de statut (À venir / En cours / Terminée)
- Saisie des résultats (P1 à P10)
- Menu déroulant intelligent sans doublons
- Attribution automatique des points
- Tableau des résultats enregistrés

**services/api.js**
- Fonctions fetch pour toutes les routes API
- Gestion centralisée des appels HTTP

**styles/App.css** (600+ lignes)
- Design moderne avec dégradés
- Composants stylisés (cards, boutons, tableaux)
- Podium visuel
- Badges de statut
- Responsive design

## Base de données SQLite

**Tables:**
1. `pilots` - Pilotes (id, name, is_human)
2. `championships` - Championnats (id, name, total_races)
3. `championship_participants` - Liaison pilotes ↔ championnats
4. `events` - Événements (id, name, circuit, date, championship_id, status)
5. `results` - Résultats (id, event_id, pilot_id, position, points)

## Fonctionnalités Implémentées

✅ Gestion de 24 pilotes maximum
✅ Championnats multiples simultanés
✅ Courses championnat ET courses libres
✅ Statuts d'événements (À venir, En cours, Terminée)
✅ Saisie intelligente avec menus déroulants sans doublons
✅ Système de points : 25-18-15-12-10-8-6-4-2-1
✅ Classements en temps réel
✅ Podium visuel
✅ Suppression d'événements (retire automatiquement du classement)
✅ Interface responsive
✅ Design moderne et intuitif

## Points techniques importants

- **Menus déroulants intelligents**: Chaque pilote sélectionné disparaît des menus suivants
- **Attribution automatique des points**: Le backend calcule les points selon la position
- **Classement dynamique**: Le classement se met à jour automatiquement après chaque course
- **Intégrité référentielle**: SQLite avec CASCADE pour supprimer proprement les données liées
- **API RESTful**: Routes claires et logiques
- **React Router**: Navigation fluide sans rechargement de page

## Technologies

- **Frontend**: React 18, React Router 6
- **Backend**: Node.js 16+, Express 4
- **Base de données**: SQLite 3
- **Style**: CSS pur (pas de framework)
- **State management**: useState + useEffect (pas de Redux)
