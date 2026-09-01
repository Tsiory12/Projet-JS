/**
 * routes/projet.routes.js - Routes de gestion des projets
 * GET    /api/projets
 * POST   /api/projets
 * GET    /api/projets/dashboard/stats
 * GET    /api/projets/:id
 * PUT    /api/projets/:id
 * DELETE /api/projets/:id
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getProjets,
  getProjetById,
  createProjet,
  updateProjet,
  deleteProjet,
  getDashboardStats,
} from '../controllers/projet.controller.js';
import { authenticate, isResponsable } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Toutes les routes projets nécessitent une authentification
router.use(authenticate);

// ============================================================
// Règles de validation
// ============================================================

const createProjetValidation = [
  body('titre')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 3, max: 200 }).withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('La description ne peut pas dépasser 2000 caractères'),
  body('dateDebut')
    .notEmpty().withMessage('La date de début est requise')
    .isISO8601().withMessage('Format de date invalide'),
  body('dateLimite')
    .notEmpty().withMessage('La date limite est requise')
    .isISO8601().withMessage('Format de date invalide'),
  body('statut')
    .optional()
    .isIn(['EN_COURS', 'EN_PAUSE', 'TERMINE', 'ANNULE']).withMessage('Statut invalide'),
];

const updateProjetValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  body('titre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('La description ne peut pas dépasser 2000 caractères'),
  body('statut')
    .optional()
    .isIn(['EN_COURS', 'EN_PAUSE', 'TERMINE', 'ANNULE']).withMessage('Statut invalide'),
];

// ============================================================
// Routes
// ============================================================

// GET /api/projets/dashboard/stats - Statistiques tableau de bord (AVANT /:id)
router.get('/dashboard/stats', isResponsable, getDashboardStats);

// GET /api/projets - Liste des projets
router.get('/', getProjets);

// POST /api/projets - Création d'un projet (Responsable seulement)
router.post('/', isResponsable, createProjetValidation, validate, createProjet);

// GET /api/projets/:id - Détail d'un projet
router.get('/:id', param('id').isInt({ min: 1 }).withMessage('ID invalide'), validate, getProjetById);

// PUT /api/projets/:id - Mise à jour d'un projet (Responsable seulement)
router.put('/:id', isResponsable, updateProjetValidation, validate, updateProjet);

// DELETE /api/projets/:id - Suppression d'un projet (Responsable seulement)
router.delete('/:id', isResponsable, param('id').isInt({ min: 1 }).withMessage('ID invalide'), validate, deleteProjet);

export default router;
