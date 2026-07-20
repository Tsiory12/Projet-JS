/**
 * services/utilisateur.service.js - Service de gestion des utilisateurs
 */

import api from './api.js';

export const utilisateurService = {
  /**
   * Récupération de tous les utilisateurs
   */
  getAll: (params = {}) => api.get('/utilisateurs', { params }),

  /**
   * Récupération d'un utilisateur par ID
   */
  getById: (id) => api.get(`/utilisateurs/${id}`),

  /**
   * Récupération des collaborateurs uniquement
   */
  getCollaborateurs: () => api.get('/utilisateurs/collaborateurs'),
};
