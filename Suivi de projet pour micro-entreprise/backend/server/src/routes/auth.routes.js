/**
 * routes/auth.routes.js - Routes d'authentification
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/profile
 * PUT  /api/auth/profile
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// ============================================================
// Règles de validation
// ============================================================

const registerValidation = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('prenom')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le prénom doit contenir entre 2 et 100 caractères'),
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Format d\'email invalide')
    .normalizeEmail(),
  body('motDePasse')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage(
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  body('role')
    .optional()
    .isIn(['RESPONSABLE', 'COLLABORATEUR']).withMessage('Rôle invalide'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Format d\'email invalide'),
  body('motDePasse')
    .notEmpty().withMessage('Le mot de passe est requis'),
];

// ============================================================
// Routes publiques
// ============================================================

// POST /api/auth/register - Inscription
router.post('/register', registerValidation, validate, register);

// POST /api/auth/login - Connexion
router.post('/login', loginValidation, validate, login);

// ============================================================
// Routes protégées (authentification requise)
// ============================================================

// GET /api/auth/profile - Récupération du profil
router.get('/profile', authenticate, getProfile);

// PUT /api/auth/profile - Mise à jour du profil
router.put('/profile', authenticate, updateProfile);

export default router;
