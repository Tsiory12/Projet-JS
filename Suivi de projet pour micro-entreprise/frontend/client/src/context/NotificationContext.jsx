/**
 * context/NotificationContext.jsx - Contexte des notifications
 * Gestion des notifications en temps réel pour les actions utilisateur
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification doit être utilisé dans un NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Ajoute une notification et affiche un toast
   */
  const notify = useCallback((type, message, options = {}) => {
    const notification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [notification, ...prev].slice(0, 50));

    // Affichage toast selon le type
    const toastOptions = {
      position: 'top-right',
      autoClose: 4000,
      ...options,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
    }
  }, []);

  /**
   * Notifications prédéfinies pour les actions métier
   */
  const notifyTacheCreee = (titre) =>
    notify('success', `✅ Tâche créée: "${titre}"`);

  const notifyTacheAssignee = (titre, collaborateur) =>
    notify('info', `📋 Tâche "${titre}" assignée à ${collaborateur}`);

  const notifyTacheModifiee = (titre) =>
    notify('info', `✏️ Tâche modifiée: "${titre}"`);

  const notifyTacheTerminee = (titre) =>
    notify('success', `🎉 Tâche terminée: "${titre}"`);

  const notifyProjetCree = (titre) =>
    notify('success', `🚀 Projet créé: "${titre}"`);

  const notifyErreur = (message) =>
    notify('error', message);

  /**
   * Marquer toutes les notifications comme lues
   */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  /**
   * Supprimer une notification
   */
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    notify,
    notifyTacheCreee,
    notifyTacheAssignee,
    notifyTacheModifiee,
    notifyTacheTerminee,
    notifyProjetCree,
    notifyErreur,
    markAllAsRead,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
