/**
 * utils/helpers.js - Fonctions utilitaires communes
 */

import { format, isAfter, isBefore, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================================
// Formatage des dates
// ============================================================

/**
 * Formate une date en français
 */
export const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy', { locale: fr });
};

/**
 * Formate une date complète avec heure
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy à HH:mm', { locale: fr });
};

/**
 * Formate une date pour un input date
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  return format(new Date(date), 'yyyy-MM-dd');
};

/**
 * Retourne le temps relatif (ex: "il y a 3 jours")
 */
export const timeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { locale: fr, addSuffix: true });
};

/**
 * Vérifie si une date est dépassée
 */
export const isOverdue = (date) => {
  if (!date) return false;
  return isBefore(new Date(date), new Date());
};

/**
 * Calcule les jours restants avant la date limite
 */
export const daysUntil = (date) => {
  if (!date) return null;
  const now = new Date();
  const target = new Date(date);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
};

// ============================================================
// Helpers pour les statuts et priorités
// ============================================================

/**
 * Retourne les informations visuelles d'un statut de projet
 */
export const getProjetStatutInfo = (statut) => {
  const statuts = {
    EN_COURS: { label: 'En cours', className: 'badge-info', color: '#3b82f6' },
    EN_PAUSE: { label: 'En pause', className: 'badge-warning', color: '#eab308' },
    TERMINE: { label: 'Terminé', className: 'badge-success', color: '#22c55e' },
    ANNULE: { label: 'Annulé', className: 'badge-danger', color: '#ef4444' },
  };
  return statuts[statut] || { label: statut, className: 'badge-neutral', color: '#6b7280' };
};

/**
 * Retourne les informations visuelles d'un statut de tâche
 */
export const getTacheStatutInfo = (statut) => {
  const statuts = {
    A_FAIRE: { label: 'À faire', className: 'badge-neutral', color: '#6b7280' },
    EN_COURS: { label: 'En cours', className: 'badge-info', color: '#3b82f6' },
    TERMINEE: { label: 'Terminée', className: 'badge-success', color: '#22c55e' },
  };
  return statuts[statut] || { label: statut, className: 'badge-neutral', color: '#6b7280' };
};

/**
 * Retourne les informations visuelles d'une priorité
 */
export const getPrioriteInfo = (priorite) => {
  const priorites = {
    FAIBLE: { label: 'Faible', className: 'badge-success', color: '#22c55e', icon: '↓' },
    MOYENNE: { label: 'Moyenne', className: 'badge-warning', color: '#eab308', icon: '→' },
    HAUTE: { label: 'Haute', className: 'badge-danger', color: '#ef4444', icon: '↑' },
  };
  return priorites[priorite] || { label: priorite, className: 'badge-neutral', color: '#6b7280', icon: '•' };
};

// ============================================================
// Helpers pour les initiales et avatars
// ============================================================

/**
 * Génère les initiales d'un utilisateur
 */
export const getInitiales = (nom, prenom) => {
  const n = nom ? nom.charAt(0).toUpperCase() : '';
  const p = prenom ? prenom.charAt(0).toUpperCase() : '';
  return `${p}${n}` || '?';
};

/**
 * Génère une couleur consistante pour un utilisateur (basée sur l'ID)
 */
export const getUserColor = (id) => {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-green-600',
    'from-orange-500 to-amber-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-blue-600',
  ];
  return colors[id % colors.length];
};

// ============================================================
// Helpers de validation
// ============================================================

/**
 * Valide une adresse email
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Tronque un texte à une longueur donnée
 */
export const truncate = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

/**
 * Formate un nombre avec séparateur de milliers
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Calcule le pourcentage de progression
 */
export const calculateProgression = (done, total) => {
  if (!total || total === 0) return 0;
  return Math.round((done / total) * 100);
};
