# Diagrammes UML — Suivi de Projets pour Micro-Entreprise

> Tous les diagrammes sont écrits en syntaxe **Mermaid** et peuvent être visualisés sur [mermaid.live](https://mermaid.live)

---

## 1. Diagramme de Cas d'Utilisation

```mermaid
graph TB
    subgraph Système["🖥️ Système : Suivi de Projets"]

        subgraph Auth["Authentification"]
            UC1["Se connecter"]
            UC2["S'inscrire"]
            UC3["Se déconnecter"]
            UC4["Modifier son profil"]
        end

        subgraph ProjMgmt["Gestion des Projets"]
            UC5["Créer un projet"]
            UC6["Modifier un projet"]
            UC7["Supprimer un projet"]
            UC8["Consulter un projet"]
        end

        subgraph TacheMgmt["Gestion des Tâches"]
            UC9["Créer une tâche"]
            UC10["Modifier une tâche"]
            UC11["Supprimer une tâche"]
            UC12["Attribuer une tâche"]
            UC13["Modifier le statut"]
            UC14["Consulter ses tâches"]
        end

        subgraph Dashboard["Tableau de Bord"]
            UC15["Consulter tableau de bord Responsable"]
            UC16["Consulter tableau de bord Collaborateur"]
            UC17["Voir graphiques d'avancement"]
        end

    end

    Responsable(("👑\nResponsable"))
    Collaborateur(("👤\nCollaborateur"))

    Responsable --- UC1
    Responsable --- UC2
    Responsable --- UC3
    Responsable --- UC4
    Responsable --- UC5
    Responsable --- UC6
    Responsable --- UC7
    Responsable --- UC8
    Responsable --- UC9
    Responsable --- UC10
    Responsable --- UC11
    Responsable --- UC12
    Responsable --- UC13
    Responsable --- UC15
    Responsable --- UC17

    Collaborateur --- UC1
    Collaborateur --- UC2
    Collaborateur --- UC3
    Collaborateur --- UC4
    Collaborateur --- UC14
    Collaborateur --- UC13
    Collaborateur --- UC16
```

---

## 2. Diagramme de Classes

```mermaid
classDiagram
    direction TB

    class Utilisateur {
        +Int id
        +String nom
        +String prenom
        +String email
        +String motDePasse
        +Role role
        +DateTime dateCreation
        +DateTime updatedAt
        +register() Boolean
        +login() String~JWT~
        +updateProfile() Utilisateur
        +getProfile() Utilisateur
    }

    class Projet {
        +Int id
        +String titre
        +String description
        +DateTime dateDebut
        +DateTime dateLimite
        +ProjetStatut statut
        +Int responsableId
        +DateTime dateCreation
        +DateTime updatedAt
        +create() Projet
        +update() Projet
        +delete() Boolean
        +getProgression() Int
        +getStats() Object
    }

    class Tache {
        +Int id
        +String titre
        +String description
        +Priorite priorite
        +TacheStatut statut
        +DateTime dateLimite
        +Int projetId
        +Int? collaborateurId
        +DateTime dateCreation
        +DateTime updatedAt
        +create() Tache
        +update() Tache
        +delete() Boolean
        +updateStatut() Tache
        +isEnRetard() Boolean
    }

    class Role {
        <<enumeration>>
        RESPONSABLE
        COLLABORATEUR
    }

    class ProjetStatut {
        <<enumeration>>
        EN_COURS
        EN_PAUSE
        TERMINE
        ANNULE
    }

    class TacheStatut {
        <<enumeration>>
        A_FAIRE
        EN_COURS
        TERMINEE
    }

    class Priorite {
        <<enumeration>>
        FAIBLE
        MOYENNE
        HAUTE
    }

    Utilisateur "1" --> "0..*" Projet : gère (responsableId)
    Projet "1" --> "0..*" Tache : contient (projetId)
    Utilisateur "1" --> "0..*" Tache : est assigné à (collaborateurId)
    Utilisateur --> Role : a
    Projet --> ProjetStatut : a
    Tache --> TacheStatut : a
    Tache --> Priorite : a
```

---

## 3. Diagramme de Séquence — Création d'une tâche

```mermaid
sequenceDiagram
    actor R as Responsable
    participant FE as Frontend (React)
    participant API as API Express
    participant Auth as Middleware Auth
    participant Valid as Middleware Validation
    participant Ctrl as TacheController
    participant ORM as Prisma ORM
    participant DB as PostgreSQL

    R->>FE: Remplit le formulaire "Nouvelle tâche"
    R->>FE: Clique sur "Créer"

    FE->>FE: Validation React Hook Form (client)
    FE->>API: POST /api/taches<br/>Authorization: Bearer {JWT}<br/>Body: {titre, priorite, dateLimite, projetId, collaborateurId}

    API->>Auth: Vérifie le token JWT
    Auth->>DB: SELECT utilisateur WHERE id = decoded.id
    DB-->>Auth: Utilisateur trouvé
    Auth->>Auth: Vérifie rôle = RESPONSABLE
    Auth-->>API: req.user = utilisateur

    API->>Valid: Valide les champs (express-validator)
    Valid-->>API: ✅ Données valides

    API->>Ctrl: createTache(req, res, next)

    Ctrl->>ORM: projet.findUnique({where: {id: projetId}})
    ORM->>DB: SELECT * FROM projets WHERE id = ?
    DB-->>ORM: Projet trouvé
    ORM-->>Ctrl: Projet

    Ctrl->>Ctrl: Vérifie projet.responsableId === req.user.id

    Ctrl->>ORM: tache.create({data: {...}})
    ORM->>DB: INSERT INTO taches VALUES (...)
    DB-->>ORM: Tâche créée (id: 42)
    ORM-->>Ctrl: Tâche avec relations

    Ctrl-->>API: res.status(201).json({success: true, data: tache})
    API-->>FE: 201 Created — {success: true, data: {id: 42, titre: ...}}

    FE->>FE: Mise à jour du state (ajout tâche)
    FE->>FE: Toast notification "✅ Tâche créée"
    FE-->>R: Affiche la nouvelle tâche dans la liste
```

---

## 4. Diagramme d'Activité — Workflow complet

```mermaid
flowchart TD
    Start([🟢 Début]) --> Login

    Login["Connexion\n(email + mot de passe)"]
    Login --> VerifCreds{Identifiants\nvalides ?}
    VerifCreds -->|Non| ErrLogin["Afficher erreur\n'Email ou MDP incorrect'"]
    ErrLogin --> Login
    VerifCreds -->|Oui| GenToken["Générer JWT\n+ stocker localStorage"]

    GenToken --> VerifRole{Quel rôle ?}

    VerifRole -->|Responsable| DashResp["Dashboard Responsable\n(stats + graphiques)"]
    VerifRole -->|Collaborateur| DashCollab["Dashboard Collaborateur\n(mes tâches + échéances)"]

    DashResp --> ActionResp{Action du\nResponsable}

    ActionResp -->|Créer Projet| FormulaireProjet["Formulaire nouveau projet\n(titre, dates, description)"]
    FormulaireProjet --> ValiderProjet{Données\nvalides ?}
    ValiderProjet -->|Non| ErrProjet["Afficher erreurs\nde validation"]
    ErrProjet --> FormulaireProjet
    ValiderProjet -->|Oui| ProjetCree["POST /api/projets\n✅ Projet créé en DB"]

    ProjetCree --> CreerTache["Créer une tâche\ndans le projet"]
    CreerTache --> FormulaireTache["Formulaire tâche\n(titre, priorité, date limite)"]
    FormulaireTache --> AssignerCollab["Assigner à un\ncollaborateur ?"]
    AssignerCollab -->|Oui| SelectCollab["Sélectionner un collaborateur\ndans la liste"]
    AssignerCollab -->|Non| TacheSansAssign["Tâche non assignée"]
    SelectCollab --> TacheCree["POST /api/taches\n✅ Tâche créée + notification"]
    TacheSansAssign --> TacheCree

    TacheCree --> SuiviProjet["Suivre l'avancement\n(barre de progression)"]

    DashCollab --> ActionCollab{Action du\nCollaborateur}

    ActionCollab -->|Consulter tâches| ListeTaches["Voir mes tâches\n(liste + kanban)"]
    ActionCollab -->|Mettre à jour| ChangerStatut["Cliquer sur le statut\n(À faire → En cours → Terminée)"]

    ChangerStatut --> StatutValide{Tâche\nassignée ?}
    StatutValide -->|Non| Refuse["❌ Accès refusé\n(403 Forbidden)"]
    StatutValide -->|Oui| UpdateStatut["PATCH /api/taches/:id/status\n✅ Statut mis à jour"]

    UpdateStatut --> EstTerminee{Statut =\nTERMINEE ?}
    EstTerminee -->|Oui| NotifTerminee["🎉 Notification\n'Tâche terminée'"]
    EstTerminee -->|Non| MAJAffichage["Mise à jour\nde l'affichage"]
    NotifTerminee --> MAJAffichage

    MAJAffichage --> ProjetMAJ["Recalcul progression projet\n(côté client)"]
    SuiviProjet --> ProjetMAJ

    ProjetMAJ --> Deconnexion{Se\ndéconnecter ?}
    Deconnexion -->|Oui| ClearToken["Supprimer JWT\nlocalStorage"]
    ClearToken --> End([🔴 Fin])
    Deconnexion -->|Non| ActionResp
```

---

## 5. Diagramme ERD (Entité-Association)

```mermaid
erDiagram
    UTILISATEURS {
        int id PK
        varchar(100) nom
        varchar(100) prenom
        varchar(255) email UK
        varchar(255) motDePasse
        enum role "RESPONSABLE|COLLABORATEUR"
        timestamp dateCreation
        timestamp updatedAt
    }

    PROJETS {
        int id PK
        varchar(200) titre
        text description
        timestamp dateDebut
        timestamp dateLimite
        enum statut "EN_COURS|EN_PAUSE|TERMINE|ANNULE"
        int responsableId FK
        timestamp dateCreation
        timestamp updatedAt
    }

    TACHES {
        int id PK
        varchar(200) titre
        text description
        enum priorite "FAIBLE|MOYENNE|HAUTE"
        enum statut "A_FAIRE|EN_COURS|TERMINEE"
        timestamp dateLimite
        int projetId FK
        int collaborateurId FK
        timestamp dateCreation
        timestamp updatedAt
    }

    UTILISATEURS ||--o{ PROJETS : "gère (responsableId)"
    PROJETS ||--o{ TACHES : "contient (projetId)"
    UTILISATEURS ||--o{ TACHES : "est assigné (collaborateurId)"
```

---

## Résumé des Relations

| Relation | Cardinalité | Description |
|----------|------------|-------------|
| Utilisateur → Projet | `1..N` | Un responsable peut gérer plusieurs projets |
| Projet → Tâche | `1..N` | Un projet contient plusieurs tâches |
| Utilisateur → Tâche | `0..N` | Un collaborateur peut avoir plusieurs tâches assignées |
| Tâche → Utilisateur | `0..1` | Une tâche peut ne pas être assignée |

---

*Diagrammes générés avec Mermaid — Visualisation disponible sur [mermaid.live](https://mermaid.live)*
