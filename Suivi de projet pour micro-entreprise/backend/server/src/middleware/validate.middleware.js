/**
 * middleware/validate.middleware.js - Middleware de validation des données
 * Utilise express-validator pour valider les entrées
 */

import { validationResult } from 'express-validator';

/**
 * Middleware de traitement des erreurs de validation
 * À utiliser après les règles express-validator
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Données invalides',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};
