/**
 * middleware/auth.middleware.js - Middleware d'authentification JWT
 * Vérifie et décode le token JWT pour les routes protégées
 */

import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

/**
 * Middleware de vérification du token JWT
 * Ajoute l'utilisateur authentifié à req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Récupération du token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token manquant.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Vérification et décodage du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupération de l'utilisateur depuis la base de données
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        dateCreation: true,
      },
    });

    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé. Token invalide.',
      });
    }

    // Ajout de l'utilisateur à la requête
    req.user = utilisateur;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expirée. Veuillez vous reconnecter.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide.',
      });
    }
    next(error);
  }
};

/**
 * Middleware d'autorisation par rôle
 * @param {...string} roles - Rôles autorisés
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôle requis: ${roles.join(' ou ')}.`,
      });
    }

    next();
  };
};

/**
 * Middleware pour le rôle Responsable uniquement
 */
export const isResponsable = authorize('RESPONSABLE');

/**
 * Middleware pour les deux rôles
 */
export const isAuthenticated = authenticate;
