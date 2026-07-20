/**
 * context/AuthContext.jsx - Contexte d'authentification global
 * Gestion de l'état de connexion, du token JWT et de l'utilisateur
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service.js';
import { toast } from 'react-toastify';

// Création du contexte
const AuthContext = createContext(null);

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

/**
 * Provider d'authentification
 * Enveloppe l'application et fournit l'état d'auth à tous les composants
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ============================================================
  // Initialisation : Récupération depuis le localStorage
  // ============================================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Vérification de la validité du token avec le serveur
          try {
            const response = await authService.getProfile();
            const updatedUser = response.data.data;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } catch {
            // Token invalide → déconnexion
            logout(false);
          }
        }
      } catch (error) {
        console.error('Erreur d\'initialisation auth:', error);
        logout(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ============================================================
  // Connexion
  // ============================================================
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const { token: newToken, utilisateur } = response.data.data;

      // Stockage dans localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(utilisateur));

      // Mise à jour du state
      setToken(newToken);
      setUser(utilisateur);
      setIsAuthenticated(true);

      toast.success(`Bienvenue, ${utilisateur.prenom} !`);
      return { success: true, user: utilisateur };
    } catch (error) {
      toast.error(error.message || 'Erreur de connexion');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================
  // Inscription
  // ============================================================
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      const { token: newToken, utilisateur } = response.data.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(utilisateur));

      setToken(newToken);
      setUser(utilisateur);
      setIsAuthenticated(true);

      toast.success('Compte créé avec succès !');
      return { success: true, user: utilisateur };
    } catch (error) {
      toast.error(error.message || 'Erreur lors de l\'inscription');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================
  // Déconnexion
  // ============================================================
  const logout = useCallback((showMessage = true) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    if (showMessage) {
      toast.info('Vous avez été déconnecté.');
    }
  }, []);

  // ============================================================
  // Mise à jour du profil
  // ============================================================
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  // ============================================================
  // Vérifications de rôle
  // ============================================================
  const isResponsable = user?.role === 'RESPONSABLE';
  const isCollaborateur = user?.role === 'COLLABORATEUR';

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    isResponsable,
    isCollaborateur,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
