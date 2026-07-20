/**
 * app.js - Configuration principale de l'application Express
 * Suivi de Projets pour Micro-Entreprise
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from 'dotenv';

// Chargement des variables d'environnement
config();

// Import des routes
import authRoutes from './routes/auth.routes.js';
import projetRoutes from './routes/projet.routes.js';
import tacheRoutes from './routes/tache.routes.js';
import utilisateurRoutes from './routes/utilisateur.routes.js';

// Import du middleware d'erreur
import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();

// ============================================================
// Middlewares de sécurité et configuration
// ============================================================

// Sécurité des en-têtes HTTP
app.use(helmet());

// Compression des réponses
app.use(compression());

// Logging des requêtes en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsing du corps des requêtes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// Routes de l'API
// ============================================================

const API_PREFIX = '/api';

// Route de santé
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({
    status: 'OK',
    message: 'Suivi de Projets API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Routes principales
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/projets`, projetRoutes);
app.use(`${API_PREFIX}/taches`, tacheRoutes);
app.use(`${API_PREFIX}/utilisateurs`, utilisateurRoutes);

// ============================================================
// Gestion des erreurs
// ============================================================

// Gestionnaire de route non trouvée (404)
app.use(notFound);

// Gestionnaire d'erreurs global
app.use(errorHandler);

export default app;
