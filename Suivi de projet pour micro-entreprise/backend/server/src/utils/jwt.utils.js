/**
 * utils/jwt.utils.js - Utilitaires JWT
 * Génération et vérification des tokens JWT
 */

import jwt from 'jsonwebtoken';

/**
 * Génère un token JWT d'accès
 * @param {Object} payload - Données à encoder (id, email, role)
 * @returns {string} Token JWT signé
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'suivi-projets-api',
    audience: 'suivi-projets-client',
  });
};

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Token à vérifier
 * @returns {Object} Payload décodé
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'suivi-projets-api',
    audience: 'suivi-projets-client',
  });
};

/**
 * Formate la réponse avec le token pour le client
 * @param {Object} utilisateur - Données de l'utilisateur
 * @returns {Object} Réponse formatée avec token
 */
export const formatAuthResponse = (utilisateur) => {
  const token = generateToken({
    id: utilisateur.id,
    email: utilisateur.email,
    role: utilisateur.role,
  });

  return {
    token,
    utilisateur: {
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role: utilisateur.role,
      dateCreation: utilisateur.dateCreation,
    },
  };
};
