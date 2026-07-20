/**
 * hooks/useTaches.js - Hook personnalisé pour la gestion des tâches
 */

import { useState, useEffect, useCallback } from 'react';
import { tacheService } from '../services/tache.service.js';
import { useNotification } from '../context/NotificationContext.jsx';

export const useTaches = (params = {}) => {
  const [taches, setTaches] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    notifyTacheCreee,
    notifyTacheModifiee,
    notifyTacheTerminee,
    notifyTacheAssignee,
    notifyErreur,
  } = useNotification();

  const fetchTaches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await tacheService.getAll(params);
      setTaches(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchTaches();
  }, [fetchTaches]);

  const createTache = async (data) => {
    try {
      const response = await tacheService.create(data);
      const newTache = response.data.data;
      setTaches((prev) => [newTache, ...prev]);
      notifyTacheCreee(newTache.titre);
      if (newTache.collaborateur) {
        notifyTacheAssignee(
          newTache.titre,
          `${newTache.collaborateur.prenom} ${newTache.collaborateur.nom}`
        );
      }
      return { success: true, data: newTache };
    } catch (err) {
      notifyErreur(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateTache = async (id, data) => {
    try {
      const response = await tacheService.update(id, data);
      const updatedTache = response.data.data;
      setTaches((prev) => prev.map((t) => (t.id === id ? updatedTache : t)));
      notifyTacheModifiee(updatedTache.titre);
      return { success: true, data: updatedTache };
    } catch (err) {
      notifyErreur(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateStatut = async (id, statut) => {
    try {
      const response = await tacheService.updateStatut(id, statut);
      const updatedTache = response.data.data;
      setTaches((prev) => prev.map((t) => (t.id === id ? updatedTache : t)));
      if (statut === 'TERMINEE') {
        notifyTacheTerminee(updatedTache.titre);
      }
      return { success: true, data: updatedTache };
    } catch (err) {
      notifyErreur(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteTache = async (id) => {
    try {
      await tacheService.delete(id);
      setTaches((prev) => prev.filter((t) => t.id !== id));
      return { success: true };
    } catch (err) {
      notifyErreur(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    taches,
    pagination,
    isLoading,
    error,
    refetch: fetchTaches,
    createTache,
    updateTache,
    updateStatut,
    deleteTache,
  };
};
