/**
 * routes/utilisateur.routes.js - Routes de gestion des utilisateurs
 * GET /api/utilisateurs
 * GET /api/utilisateurs/collaborateurs
 * GET /api/utilisateurs/:id
 */

import { Router } from 'express';
import {
  getUtilisateurs,
  getUtilisateurById,
  getCollaborateurs,
} from '../controllers/utilisateur.controller.js';
import { authenticate, isResponsable } from '../middleware/auth.middleware.js';

const router = Router();

// Toutes les routes utilisateurs nécessitent une authentification
router.use(authenticate);

// GET /api/utilisateurs/collaborateurs - Liste des collaborateurs seulement
router.get('/collaborateurs', isResponsable, getCollaborateurs);

// GET /api/utilisateurs - Liste de tous les utilisateurs (Responsable)
router.get('/', isResponsable, getUtilisateurs);

// GET /api/utilisateurs/:id - Détail d'un utilisateur
router.get('/:id', isResponsable, getUtilisateurById);

export default router;
