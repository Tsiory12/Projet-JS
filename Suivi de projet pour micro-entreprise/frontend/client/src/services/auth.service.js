/**
 * services/auth.service.js - Service d'authentification
 * Appels API pour l'inscription, connexion et profil
 */

import api from './api.js';

export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Connexion d'un utilisateur
   */
  login: (credentials) => api.post('/auth/login', credentials),

  /**
   * Récupération du profil connecté
   */
  getProfile: () => api.get('/auth/profile'),

  /**
   * Mise à jour du profil
   */
  updateProfile: (data) => api.put('/auth/profile', data),
};
