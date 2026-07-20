/**
 * services/tache.service.js - Service de gestion des tâches
 */

import api from './api.js';

export const tacheService = {
  /**
   * Récupération de toutes les tâches
   */
  getAll: (params = {}) => api.get('/taches', { params }),

  /**
   * Récupération d'une tâche par ID
   */
  getById: (id) => api.get(`/taches/${id}`),

  /**
   * Création d'une tâche
   */
  create: (data) => api.post('/taches', data),

  /**
   * Mise à jour complète d'une tâche
   */
  update: (id, data) => api.put(`/taches/${id}`, data),

  /**
   * Suppression d'une tâche
   */
  delete: (id) => api.delete(`/taches/${id}`),

  /**
   * Mise à jour du statut uniquement
   */
  updateStatut: (id, statut) => api.patch(`/taches/${id}/status`, { statut }),

  /**
   * Statistiques du tableau de bord collaborateur
   */
  getDashboardStats: () => api.get('/taches/dashboard/stats'),

  /**
   * Récupérer les commentaires d'une tâche
   */
  getCommentaires: (id) => api.get(`/taches/${id}/commentaires`),

  /**
   * Ajouter un commentaire à une tâche
   */
  createCommentaire: (id, contenu) => api.post(`/taches/${id}/commentaires`, { contenu }),
};
