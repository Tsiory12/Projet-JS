/**
 * hooks/useProjets.js - Hook personnalisé pour la gestion des projets
 * Encapsule la logique de chargement et mutation des projets
 */

import { useState, useEffect, useCallback } from 'react';
import { projetService } from '../services/projet.service.js';
import { useNotification } from '../context/NotificationContext.jsx';

export const useProjets = (params = {}) => {
  const [projets, setProjets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { notifyProjetCree, notifyErreur } = useNotification();

  const fetchProjets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projetService.getAll(params);
      setProjets(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchProjets();
  }, [fetchProjets]);

  const createProjet = async (data) => {
    try {
      const response = await projetService.create(data);
      const newProjet = response.data.data;
      setProjets((prev) => [newProjet, ...prev]);
      notifyProjetCree(newProjet.titre);
      return { success: true, data: newProjet };
    } catch (err) {
      notifyErreur(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateProjet = async (id, data) => {
    try {
      const response = await projetService.update(id, data);
      const updatedProjet = response.data.data;
      setProjets((prev) => prev.map((p) => (p.id === id ? updatedProjet : p)));
      return { success: true, data: updatedProjet };
    } catch (err) {
      notifyErreur(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteProjet = async (id) => {
    try {
      await projetService.delete(id);
      setProjets((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      notifyErreur(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    projets,
    pagination,
    isLoading,
    error,
    refetch: fetchProjets,
    createProjet,
    updateProjet,
    deleteProjet,
  };
};
