/**
 * components/tasks/TacheDetailModal.jsx - Modal de détails de tâche et commentaires
 * Affiche les informations complètes d'une tâche et permet d'ajouter/lire des commentaires.
 */

import { useState, useEffect, useRef } from 'react';
import {
  X, MessageSquare, Send, Calendar, AlertCircle,
  Clock, CheckCircle2, Circle, User, ShieldAlert
} from 'lucide-react';
import { tacheService } from '../../services/tache.service.js';
import {
  formatDate, formatDateTime, getPrioriteInfo,
  getTacheStatutInfo, isOverdue, getInitiales, getUserColor, timeAgo
} from '../../utils/helpers.js';
import { toast } from 'react-toastify';

const TacheDetailModal = ({ isOpen, onClose, tacheId, onStatutChange }) => {
  const [tache, setTache] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && tacheId) {
      fetchTaskDetails();
      fetchComments();
    }
  }, [isOpen, tacheId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await tacheService.getById(tacheId);
      setTache(res.data.data);
    } catch (err) {
      toast.error('Impossible de charger les détails de la tâche.');
      console.error(err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const res = await tacheService.getCommentaires(tacheId);
      setComments(res.data.data);
      // Auto scroll to bottom
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Impossible de charger les commentaires.', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const nextStatus = e.target.value;
    try {
      await tacheService.updateStatut(tacheId, nextStatus);
      setTache(prev => ({ ...prev, statut: nextStatus }));
      toast.success('Statut de la tâche mis à jour !');
      if (onStatutChange) {
        onStatutChange(tacheId, nextStatus);
      }
    } catch (err) {
      toast.error('Erreur lors du changement de statut.');
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await tacheService.createCommentaire(tacheId, newComment.trim());
      setComments(prev => [...prev, res.data.data]);
      setNewComment('');
      // Auto scroll to bottom
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      toast.error('Erreur lors de l\'ajout du commentaire.');
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal max-w-2xl flex flex-col h-[85vh] p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header de la modal */}
        <div className="p-6 border-b border-[rgb(var(--color-border)/0.3)] flex items-center justify-between flex-shrink-0">
          <div>
            {tache?.projet && (
              <span className="badge badge-primary mb-1">
                {tache.projet.titre}
              </span>
            )}
            <h2 className="text-xl font-bold text-white leading-tight">
              {loading ? 'Chargement...' : tache?.titre}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgb(var(--color-surface-2))] text-[rgb(var(--color-text-dim))] hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-sm text-[rgb(var(--color-text-muted))]">Chargement des détails...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Contenu Défilant */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Description */}
              {tache?.description && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[rgb(var(--color-text-dim))] uppercase tracking-wider">
                    Description
                  </h4>
                  <p className="text-sm bg-[rgb(var(--color-surface-2))] p-4 rounded-xl border border-[rgb(var(--color-border)/0.2)] text-[rgb(var(--color-text-muted))] whitespace-pre-wrap leading-relaxed">
                    {tache.description}
                  </p>
                </div>
              )}

              {/* Métadonnées en Grille */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Colonne 1: Échéance et priorité */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-[rgb(var(--color-text-dim))]" />
                    <div>
                      <h5 className="text-xs font-bold text-[rgb(var(--color-text-dim))] uppercase">Date Limite</h5>
                      <p className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                        {formatDate(tache?.dateLimite)}
                        {isOverdue(tache?.dateLimite) && tache?.statut !== 'TERMINEE' && (
                          <span className="badge badge-danger flex items-center gap-1 text-[9px] py-0 px-1.5">
                            <AlertCircle size={10} /> Retard
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-[rgb(var(--color-text-dim))]" />
                    <div>
                      <h5 className="text-xs font-bold text-[rgb(var(--color-text-dim))] uppercase">Priorité</h5>
                      <span className={`badge ${getPrioriteInfo(tache?.priorite).className} mt-1`}>
                        {getPrioriteInfo(tache?.priorite).label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Colonne 2: Assignation et Statut */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-[rgb(var(--color-text-dim))]" />
                    <div>
                      <h5 className="text-xs font-bold text-[rgb(var(--color-text-dim))] uppercase">Assignation</h5>
                      {tache?.collaborateur ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`avatar w-6 h-6 text-[9px] bg-gradient-to-br ${getUserColor(tache.collaborateur.id)}`}>
                            {getInitiales(tache.collaborateur.nom, tache.collaborateur.prenom)}
                          </div>
                          <span className="text-sm font-medium">
                            {tache.collaborateur.prenom} {tache.collaborateur.nom}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-[rgb(var(--color-text-dim))] mt-0.5">Non assignée</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[rgb(var(--color-text-dim))]" />
                    <div className="flex-1">
                      <h5 className="text-xs font-bold text-[rgb(var(--color-text-dim))] uppercase mb-1">Statut</h5>
                      <select
                        value={tache?.statut}
                        onChange={handleStatusChange}
                        className="input py-1.5 px-3 text-xs w-full max-w-[160px]"
                      >
                        <option value="A_FAIRE">À faire</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="TERMINEE">Terminée</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Séparateur */}
              <div className="divider" />

              {/* Section Commentaires */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white">
                  <MessageSquare size={18} className="text-indigo-400" />
                  <h3 className="font-bold text-sm">Commentaires ({comments.length})</h3>
                </div>

                {/* Liste des commentaires */}
                <div className="space-y-3">
                  {commentsLoading ? (
                    <div className="text-center py-4 text-xs text-[rgb(var(--color-text-dim))]">
                      Chargement de la discussion...
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-[rgb(var(--color-border)/0.2)] rounded-xl bg-[rgb(var(--color-surface-2))/0.3]">
                      <p className="text-xs text-[rgb(var(--color-text-dim))]">
                        Aucun commentaire sur cette tâche. Lancez la discussion !
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex gap-3 bg-[rgb(var(--color-surface-2))] p-3.5 rounded-xl border border-[rgb(var(--color-border)/0.2)] transition-all hover:border-[rgb(var(--color-border)/0.5)]"
                      >
                        <div className={`avatar w-8 h-8 text-xs bg-gradient-to-br ${getUserColor(comment.auteur.id)}`}>
                          {getInitiales(comment.auteur.nom, comment.auteur.prenom)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-white">
                                {comment.auteur.prenom} {comment.auteur.nom}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                comment.auteur.role === 'RESPONSABLE'
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {comment.auteur.role === 'RESPONSABLE' ? 'Responsable' : 'Collaborateur'}
                              </span>
                            </div>
                            <span className="text-[10px] text-[rgb(var(--color-text-dim))]">
                              {timeAgo(comment.dateCreation)}
                            </span>
                          </div>
                          <p className="text-xs text-[rgb(var(--color-text-muted))] leading-relaxed whitespace-pre-wrap">
                            {comment.contenu}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={commentsEndRef} />
                </div>
              </div>
            </div>

            {/* Zone de saisie du commentaire */}
            <form
              onSubmit={handleAddComment}
              className="p-4 border-t border-[rgb(var(--color-border)/0.3)] bg-[rgb(var(--color-surface))] flex items-center gap-2 flex-shrink-0"
            >
              <input
                type="text"
                placeholder="Écrire un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input py-2 px-3 text-xs"
                disabled={submittingComment}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm flex-shrink-0"
                disabled={!newComment.trim() || submittingComment}
              >
                {submittingComment ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TacheDetailModal;
