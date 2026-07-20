/**
 * middleware/error.middleware.js - Gestion globale des erreurs
 * Centralise le traitement des erreurs de l'API
 */

/**
 * Middleware pour les routes non trouvées (404)
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Middleware de gestion globale des erreurs
 * Doit être le dernier middleware de l'application
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Erreur interne du serveur';

  // Gestion des erreurs Prisma
  if (err.code) {
    switch (err.code) {
      // Violation de contrainte unique
      case 'P2002':
        statusCode = 409;
        const field = err.meta?.target?.[0] || 'champ';
        message = `Cette valeur existe déjà pour le champ: ${field}`;
        break;
      // Enregistrement non trouvé
      case 'P2025':
        statusCode = 404;
        message = 'Ressource non trouvée';
        break;
      // Violation de clé étrangère
      case 'P2003':
        statusCode = 400;
        message = 'Référence invalide: l\'entité liée n\'existe pas';
        break;
      // Erreur de connexion DB
      case 'P1001':
        statusCode = 503;
        message = 'Impossible de se connecter à la base de données';
        break;
      default:
        statusCode = 400;
        message = `Erreur de base de données: ${err.code}`;
    }
  }

  // Erreur de validation
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = err.message;
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token invalide ou expiré';
  }

  // Log de l'erreur en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Erreur:', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Classe d'erreur personnalisée pour l'API
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}
