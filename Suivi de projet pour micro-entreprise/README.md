# 📊 Suivi de Projets pour Micro-Entreprise

> Application web full-stack de gestion de projets professionnels — Projet L3 Informatique (JavaScript Avancé)

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

---

## 📋 Table des matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [API REST](#-api-rest)
- [Rôles et Permissions](#-rôles-et-permissions)
- [Schéma de Base de Données](#-schéma-de-base-de-données)
- [Structure du Projet](#-structure-du-projet)

---

## 🎯 Présentation

Application web complète permettant à une micro-entreprise de gérer ses projets professionnels de manière collaborative. Elle dispose de deux types d'utilisateurs :

- **Responsable** : pilote les projets, crée les tâches et assigne les collaborateurs
- **Collaborateur** : consulte ses tâches assignées et met à jour leur progression

---

## ✨ Fonctionnalités

### 🔐 Authentification
- Inscription avec choix du rôle (Responsable / Collaborateur)
- Connexion sécurisée avec JWT (valide 7 jours)
- Hashage des mots de passe avec **bcrypt** (12 rounds)
- Protection automatique des routes selon le rôle
- Déconnexion avec nettoyage du token

### 👑 Responsable
- Créer, modifier, supprimer des projets
- Créer, modifier, supprimer des tâches dans ses projets
- Assigner des tâches à des collaborateurs
- Tableau de bord avec graphiques Chart.js
- Filtrer et rechercher projets et tâches
- Vue kanban et vue liste des tâches

### 👤 Collaborateur
- Consulter ses tâches assignées
- Mettre à jour le statut d'une tâche (À faire → En cours → Terminée)
- Tableau de bord personnel avec prochaines échéances
- Graphique de progression personnelle

### 📊 Tableaux de bord
- **Responsable** : nombre de projets/tâches, tâches en retard, graphiques Chart.js (barres + donuts)
- **Collaborateur** : mes tâches, tâches terminées/en cours, prochaines échéances (7 jours)

### 🔔 Notifications
- Notification lors de la création d'une tâche
- Notification lors de l'assignation d'une tâche
- Notification lors de la modification d'une tâche
- Notification lorsqu'une tâche est marquée comme terminée
- Historique des 50 dernières notifications

---

## 🏗️ Architecture

```
Suivi de projet pour micro-entreprise/
├── backend/
│   └── server/                  # API REST Node.js/Express
│       ├── src/
│       │   ├── app.js           # Configuration Express
│       │   ├── server.js        # Point d'entrée serveur
│       │   ├── config/          # Configuration (Prisma)
│       │   ├── controllers/     # Logique métier (MVC)
│       │   ├── middleware/      # Auth, erreurs, validation
│       │   ├── routes/          # Définition des routes API
│       │   ├── services/        # (couche service intégrée)
│       │   └── utils/           # JWT, bcrypt, seed
│       ├── prisma/
│       │   └── schema.prisma    # Schéma de la base de données
│       ├── .env                 # Variables d'environnement
│       └── package.json
│
├── frontend/
│   └── client/                  # Application React/Vite
│       └── src/
│           ├── assets/          # Images et ressources statiques
│           ├── components/      # Composants réutilisables
│           │   └── common/      # Spinner, Modal, ProtectedRoute...
│           ├── context/         # AuthContext, NotificationContext
│           ├── hooks/           # useProjets, useTaches
│           ├── layouts/         # MainLayout, AuthLayout
│           ├── pages/           # Pages de l'application
│           ├── services/        # Appels API (Axios)
│           └── utils/           # Fonctions utilitaires
│
├── UML/                         # Diagrammes UML
└── README.md
```

### Modèle MVC côté serveur

```
Requête HTTP
    ↓
Routes (routes/*.js)
    ↓
Middleware (auth, validation)
    ↓
Controller (controllers/*.js)   ← Logique métier
    ↓
Prisma ORM (config/prisma.js)
    ↓
PostgreSQL
```

---

## 🛠️ Technologies

### Back-end
| Technologie | Version | Rôle |
|-------------|---------|------|
| **Node.js** | 20+ | Runtime JavaScript |
| **Express.js** | 5.x | Framework HTTP |
| **Prisma ORM** | 6.x | ORM PostgreSQL |
| **PostgreSQL** | 15+ | Base de données |
| **jsonwebtoken** | 9.x | Authentification JWT |
| **bcryptjs** | 3.x | Hashage des mots de passe |
| **express-validator** | 7.x | Validation des entrées |
| **helmet** | 8.x | Sécurité des en-têtes HTTP |
| **cors** | 2.x | Gestion des origines cross |
| **morgan** | 1.x | Logging des requêtes |

### Front-end
| Technologie | Version | Rôle |
|-------------|---------|------|
| **React** | 19.x | Framework UI |
| **Vite** | 8.x | Bundler/Dev server |
| **React Router** | 7.x | Navigation SPA |
| **Axios** | 1.x | Requêtes HTTP |
| **Tailwind CSS** | 4.x | Styles utilitaires |
| **React Hook Form** | 7.x | Gestion des formulaires |
| **React Toastify** | 11.x | Notifications toast |
| **Chart.js** | 4.x | Graphiques |
| **react-chartjs-2** | 5.x | Wrapper React pour Chart.js |
| **date-fns** | 4.x | Manipulation des dates |
| **lucide-react** | 1.x | Icônes |

---

## 🚀 Installation

### Prérequis

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **PostgreSQL** ≥ 14 (installé et en cours d'exécution)

### 1. Cloner le projet

```bash
git clone <url-du-projet>
cd "Suivi de projet pour micro-entreprise"
```

### 2. Installer les dépendances Backend

```bash
cd backend/server
npm install
```

### 3. Installer les dépendances Frontend

```bash
cd frontend/client
npm install
```

---

## ⚙️ Configuration

### Base de données PostgreSQL

Créez la base de données PostgreSQL :

```sql
-- Connectez-vous à PostgreSQL
psql -U postgres

-- Créer la base de données
CREATE DATABASE suivi_projets_db;

-- Quitter
\q
```

### Variables d'environnement Backend

Éditez le fichier `backend/server/.env` :

```env
# Base de données - MODIFIER avec vos identifiants
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/suivi_projets_db?schema=public"

# JWT - Utiliser une chaîne aléatoire longue et sécurisée
JWT_SECRET="votre_secret_jwt_tres_long_et_securise_ici"
JWT_EXPIRES_IN="7d"

# Serveur
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# bcrypt - 12 rounds recommandés
BCRYPT_ROUNDS=12
```

> ⚠️ **Important** : Ne committez jamais le fichier `.env` ! Il est déjà dans le `.gitignore`.

---

## ▶️ Démarrage

### 1. Générer le client Prisma

```bash
cd backend/server
npx prisma generate
```

### 2. Appliquer les migrations (créer les tables)

```bash
cd backend/server
npx prisma migrate dev --name init
```

### 3. Peupler la base de données (données de démonstration)

```bash
cd backend/server
npm run db:seed
```

Cette commande crée :
- **1 Responsable** : `marie.dupont@entreprise.com` / `Password123`
- **3 Collaborateurs** : `lucas.martin@entreprise.com` / `Password123`
- **3 Projets** avec des statuts variés
- **15 Tâches** réparties sur les projets

### 4. Démarrer le serveur Backend

```bash
cd backend/server
npm run dev
```

> Le serveur démarre sur : **http://localhost:5000**  
> API disponible sur : **http://localhost:5000/api**

### 5. Démarrer le client Frontend

```bash
cd frontend/client
npm run dev
```

> L'application démarre sur : **http://localhost:5173**

---

## 📡 API REST

### Authentification

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| `POST` | `/api/auth/register` | Inscription | Public |
| `POST` | `/api/auth/login` | Connexion | Public |
| `GET` | `/api/auth/profile` | Mon profil | Authentifié |
| `PUT` | `/api/auth/profile` | Mettre à jour le profil | Authentifié |

### Projets

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| `GET` | `/api/projets` | Liste des projets | Authentifié |
| `POST` | `/api/projets` | Créer un projet | Responsable |
| `GET` | `/api/projets/dashboard/stats` | Stats tableau de bord | Responsable |
| `GET` | `/api/projets/:id` | Détail d'un projet | Authentifié |
| `PUT` | `/api/projets/:id` | Modifier un projet | Responsable |
| `DELETE` | `/api/projets/:id` | Supprimer un projet | Responsable |

### Tâches

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| `GET` | `/api/taches` | Liste des tâches | Authentifié |
| `POST` | `/api/taches` | Créer une tâche | Responsable |
| `GET` | `/api/taches/dashboard/stats` | Stats collaborateur | Authentifié |
| `GET` | `/api/taches/:id` | Détail d'une tâche | Authentifié |
| `PUT` | `/api/taches/:id` | Modifier une tâche | Authentifié |
| `DELETE` | `/api/taches/:id` | Supprimer une tâche | Responsable |
| `PATCH` | `/api/taches/:id/status` | Mettre à jour le statut | Authentifié |

### Utilisateurs

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| `GET` | `/api/utilisateurs` | Liste des utilisateurs | Responsable |
| `GET` | `/api/utilisateurs/collaborateurs` | Liste des collaborateurs | Responsable |
| `GET` | `/api/utilisateurs/:id` | Détail d'un utilisateur | Responsable |

### Exemples de requêtes

#### Connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marie.dupont@entreprise.com","motDePasse":"Password123"}'
```

#### Créer un projet (avec token)
```bash
curl -X POST http://localhost:5000/api/projets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "titre": "Mon nouveau projet",
    "description": "Description du projet",
    "dateDebut": "2026-01-01",
    "dateLimite": "2026-12-31"
  }'
```

---

## 🔐 Rôles et Permissions

| Action | Responsable | Collaborateur |
|--------|------------|---------------|
| Créer un projet | ✅ | ❌ |
| Modifier un projet | ✅ (ses projets) | ❌ |
| Supprimer un projet | ✅ (ses projets) | ❌ |
| Voir les projets | ✅ (tous ses projets) | ✅ (ses projets) |
| Créer une tâche | ✅ | ❌ |
| Modifier une tâche | ✅ (ses projets) | ✅ (ses tâches, certains champs) |
| Supprimer une tâche | ✅ (ses projets) | ❌ |
| Changer le statut | ✅ | ✅ (ses tâches assignées) |
| Assigner une tâche | ✅ | ❌ |
| Voir la liste des utilisateurs | ✅ | ❌ |
| Tableau de bord complet | ✅ | ❌ |
| Tableau de bord personnel | ❌ | ✅ |

---

## 🗄️ Schéma de Base de Données

```
┌─────────────────────────────┐
│         UTILISATEURS        │
├─────────────────────────────┤
│ id (PK)                     │
│ nom (VARCHAR 100)           │
│ prenom (VARCHAR 100)        │
│ email (UNIQUE)              │
│ motDePasse (VARCHAR 255)    │
│ role (RESPONSABLE│COLLAB.)  │
│ dateCreation (DATETIME)     │
│ updatedAt (DATETIME)        │
└───────────┬─────────────────┘
            │ 1..* projetsGeres
            │
            ▼
┌─────────────────────────────┐
│           PROJETS           │
├─────────────────────────────┤
│ id (PK)                     │
│ titre (VARCHAR 200)         │
│ description (TEXT)          │
│ dateDebut (DATETIME)        │
│ dateLimite (DATETIME)       │
│ statut (EN_COURS│...)       │
│ responsableId (FK→User)     │
│ dateCreation (DATETIME)     │
│ updatedAt (DATETIME)        │
└───────────┬─────────────────┘
            │ 1..* taches
            │
            ▼
┌─────────────────────────────┐
│           TACHES            │
├─────────────────────────────┤
│ id (PK)                     │
│ titre (VARCHAR 200)         │
│ description (TEXT)          │
│ priorite (FAIBLE│MOY.│HAUT) │
│ statut (A_FAIRE│EN_COURS│..)│
│ dateLimite (DATETIME)       │
│ projetId (FK→Projet)        │
│ collaborateurId (FK→User?)  │
│ dateCreation (DATETIME)     │
│ updatedAt (DATETIME)        │
└─────────────────────────────┘
```

### Énumérations

| Enum | Valeurs |
|------|---------|
| `Role` | `RESPONSABLE`, `COLLABORATEUR` |
| `ProjetStatut` | `EN_COURS`, `EN_PAUSE`, `TERMINE`, `ANNULE` |
| `TacheStatut` | `A_FAIRE`, `EN_COURS`, `TERMINEE` |
| `Priorite` | `FAIBLE`, `MOYENNE`, `HAUTE` |

---

## 🧱 Structure du Projet

```
backend/server/
├── src/
│   ├── app.js                    # Config Express, middlewares, routes
│   ├── server.js                 # Démarrage serveur, connexion DB
│   ├── config/
│   │   └── prisma.js             # Client Prisma singleton
│   ├── controllers/
│   │   ├── auth.controller.js    # Inscription, connexion, profil
│   │   ├── projet.controller.js  # CRUD projets + statistiques
│   │   ├── tache.controller.js   # CRUD tâches + statuts
│   │   └── utilisateur.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js    # Vérification JWT + rôles
│   │   ├── error.middleware.js   # Gestion d'erreurs globale
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── projet.routes.js
│   │   ├── tache.routes.js
│   │   └── utilisateur.routes.js
│   └── utils/
│       ├── jwt.utils.js          # Génération/vérification tokens
│       ├── password.utils.js     # Hash/compare bcrypt
│       └── seed.js               # Données de démonstration
└── prisma/
    └── schema.prisma             # Modèles Prisma

frontend/client/src/
├── App.jsx                       # Routeur principal React Router
├── main.jsx                      # Point d'entrée React
├── index.css                     # Design system + Tailwind
├── assets/                       # Ressources statiques
├── components/
│   └── common/
│       ├── ProtectedRoute.jsx    # Guard d'authentification
│       ├── LoadingSpinner.jsx    # Composant de chargement
│       └── ConfirmModal.jsx      # Modal de confirmation
├── context/
│   ├── AuthContext.jsx           # État global d'authentification
│   └── NotificationContext.jsx  # Système de notifications
├── hooks/
│   ├── useProjets.js             # Hook CRUD projets
│   └── useTaches.js              # Hook CRUD tâches
├── layouts/
│   ├── MainLayout.jsx            # Layout principal (sidebar + header)
│   └── AuthLayout.jsx            # Layout d'authentification
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx         # Router de dashboard (rôle)
│   ├── DashboardResponsablePage.jsx
│   ├── DashboardCollaborateurPage.jsx
│   ├── ProjetsPage.jsx
│   ├── ProjetDetailPage.jsx
│   ├── TachesPage.jsx            # Vue liste + kanban
│   └── ProfilPage.jsx
├── services/
│   ├── api.js                    # Instance Axios + intercepteurs
│   ├── auth.service.js
│   ├── projet.service.js
│   ├── tache.service.js
│   └── utilisateur.service.js
└── utils/
    └── helpers.js                # Formatage dates, statuts, etc.
```

---

## 🔒 Sécurité

- **JWT** : tokens signés avec secret configurable, expiration 7 jours
- **bcrypt** : hashage des mots de passe avec 12 rounds de sel
- **Helmet.js** : sécurisation des en-têtes HTTP (XSS, clickjacking...)
- **CORS** : origines autorisées configurables
- **Validation** : toutes les entrées validées avec `express-validator`
- **Protection des routes** : middleware vérifiant JWT et rôle sur chaque route sensible
- **Erreurs sécurisées** : les messages d'erreur ne révèlent pas les détails internes en production

---

## 🛠️ Scripts disponibles

### Backend
```bash
npm run dev          # Démarrer en mode développement (nodemon)
npm run start        # Démarrer en production
npm run db:generate  # Générer le client Prisma
npm run db:migrate   # Appliquer les migrations
npm run db:studio    # Interface graphique Prisma Studio
npm run db:seed      # Peupler avec des données de démonstration
npm run db:reset     # Réinitialiser la base de données
```

### Frontend
```bash
npm run dev          # Démarrer le serveur de développement (port 5173)
npm run build        # Construire pour la production
npm run preview      # Prévisualiser le build de production
npm run lint         # Analyser le code avec ESLint
```

---

## 👥 Comptes de démonstration

Après avoir exécuté `npm run db:seed` :

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Responsable | marie.dupont@entreprise.com | Password123 |
| Collaborateur | lucas.martin@entreprise.com | Password123 |
| Collaborateur | sophie.bernard@entreprise.com | Password123 |
| Collaborateur | julien.petit@entreprise.com | Password123 |

---

## 📝 Notes de développement

### Conventions de code
- **ES6+ Modules** (`import`/`export`) côté serveur et client
- **Async/Await** pour toutes les opérations asynchrones
- **JSDoc** pour documenter les fonctions importantes
- **Architecture MVC** stricte côté serveur
- Commentaires en français pour le contexte universitaire

### Points d'architecture notables
1. **Singleton Prisma** : une seule instance de `PrismaClient` partagée
2. **Intercepteurs Axios** : gestion automatique du token JWT et des erreurs 401
3. **Context React** : `AuthContext` et `NotificationContext` pour l'état global
4. **Hooks personnalisés** : `useProjets` et `useTaches` pour la logique de données
5. **Middleware en chaîne** : `authenticate → authorize → validate → controller`

---

*Projet réalisé dans le cadre du cours JavaScript Avancé — Licence 3 Informatique*
