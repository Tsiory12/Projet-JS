/**
 * services/api.js - Configuration Axios et intercepteurs
 * Point central pour toutes les requêtes HTTP vers l'API
 */

import axios from 'axios';

// Instance Axios configurée
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// Intercepteur de requête : Ajout du token JWT
// ============================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Intercepteur de réponse : Gestion des erreurs globales
// ============================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Token expiré ou invalide → déconnexion automatique
    if (response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirection vers login si pas déjà sur la page de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Construction d'un message d'erreur lisible
    const message =
      response?.data?.message ||
      error.message ||
      'Une erreur inattendue est survenue';

    return Promise.reject({ message, status: response?.status, data: response?.data });
  }
);

export default api;
