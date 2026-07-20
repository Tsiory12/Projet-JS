/**
 * services/projet.service.js - Service de gestion des projets
 */

import api from './api.js';

export const projetService = {
  /**
   * Récupération de tous les projets
   */
  getAll: (params = {}) => api.get('/projets', { params }),

  /**
   * Récupération d'un projet par ID
   */
  getById: (id) => api.get(`/projets/${id}`),

  /**
   * Création d'un projet
   */
  create: (data) => api.post('/projets', data),

  /**
   * Mise à jour d'un projet
   */
  update: (id, data) => api.put(`/projets/${id}`, data),

  /**
   * Suppression d'un projet
   */
  delete: (id) => api.delete(`/projets/${id}`),

  /**
   * Statistiques du tableau de bord responsable
   */
  getDashboardStats: () => api.get('/projets/dashboard/stats'),
};
