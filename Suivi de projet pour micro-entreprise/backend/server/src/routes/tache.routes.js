/**
 * routes/tache.routes.js - Routes de gestion des tâches
 * GET    /api/taches
 * POST   /api/taches
 * GET    /api/taches/dashboard/stats
 * GET    /api/taches/:id
 * PUT    /api/taches/:id
 * DELETE /api/taches/:id
 * PATCH  /api/taches/:id/status
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getTaches,
  getTacheById,
  createTache,
  updateTache,
  deleteTache,
  updateTacheStatut,
  getCollaborateurStats,
  getTacheCommentaires,
  createTacheCommentaire,
} from '../controllers/tache.controller.js';
import { authenticate, isResponsable } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Toutes les routes tâches nécessitent une authentification
router.use(authenticate);

// ============================================================
// Règles de validation
// ============================================================

const createTacheValidation = [
  body('titre')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 3, max: 200 }).withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('La description ne peut pas dépasser 2000 caractères'),
  body('priorite')
    .optional()
    .isIn(['FAIBLE', 'MOYENNE', 'HAUTE']).withMessage('Priorité invalide'),
  body('statut')
    .optional()
    .isIn(['A_FAIRE', 'EN_COURS', 'TERMINEE']).withMessage('Statut invalide'),
  body('dateLimite')
    .notEmpty().withMessage('La date limite est requise')
    .isISO8601().withMessage('Format de date invalide'),
  body('projetId')
    .notEmpty().withMessage('L\'ID du projet est requis')
    .isInt({ min: 1 }).withMessage('ID de projet invalide'),
  body('collaborateurId')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de collaborateur invalide'),
];

const updateStatutValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  body('statut')
    .notEmpty().withMessage('Le statut est requis')
    .isIn(['A_FAIRE', 'EN_COURS', 'TERMINEE']).withMessage(
      'Statut invalide. Valeurs acceptées: A_FAIRE, EN_COURS, TERMINEE'
    ),
];

// ============================================================
// Routes
// ============================================================

// GET /api/taches/dashboard/stats - Statistiques collaborateur (AVANT /:id)
router.get('/dashboard/stats', getCollaborateurStats);

// GET /api/taches - Liste des tâches
router.get('/', getTaches);

// POST /api/taches - Création d'une tâche (Responsable seulement)
router.post('/', isResponsable, createTacheValidation, validate, createTache);

// GET /api/taches/:id - Détail d'une tâche
router.get('/:id', getTacheById);

// PUT /api/taches/:id - Mise à jour complète d'une tâche
router.put('/:id', updateTache);

// DELETE /api/taches/:id - Suppression d'une tâche (Responsable seulement)
router.delete('/:id', isResponsable, deleteTache);

// PATCH /api/taches/:id/status - Mise à jour du statut uniquement
router.patch('/:id/status', updateStatutValidation, validate, updateTacheStatut);

// GET /api/taches/:id/commentaires - Récupérer les commentaires d'une tâche
router.get('/:id/commentaires', getTacheCommentaires);

// POST /api/taches/:id/commentaires - Ajouter un commentaire sur une tâche
router.post('/:id/commentaires', [
  body('contenu').trim().notEmpty().withMessage('Le contenu du commentaire est requis'),
], validate, createTacheCommentaire);

export default router;
