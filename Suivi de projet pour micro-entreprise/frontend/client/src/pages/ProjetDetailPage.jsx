/**
 * pages/ProjetDetailPage.jsx - Détail d'un projet avec ses tâches
 * Vue complète avec statistiques, liste des tâches et gestion
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { projetService } from '../services/projet.service.js';
import { tacheService } from '../services/tache.service.js';
import { utilisateurService } from '../services/utilisateur.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ConfirmModal from '../components/common/ConfirmModal.jsx';
import {
  ArrowLeft, Plus, Calendar, Edit2, Trash2, X,
  CheckCircle2, Clock, Circle, AlertCircle, Users,
  ChevronDown, MoreVertical, FolderKanban,
} from 'lucide-react';
import {
  formatDate, formatDateForInput, getProjetStatutInfo,
  getTacheStatutInfo, getPrioriteInfo, isOverdue,
} from '../utils/helpers.js';
import TacheDetailModal from '../components/tasks/TacheDetailModal.jsx';

const PRIORITES = ['FAIBLE', 'MOYENNE', 'HAUTE'];
const STATUTS_TACHE = [
  { value: 'A_FAIRE', label: 'À faire' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminée' },
];

const ProjetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isResponsable } = useAuth();
  const { notifyTacheCreee, notifyTacheTerminee, notifyErreur } = useNotification();

  const [projet, setProjet] = useState(null);
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tacheModalOpen, setTacheModalOpen] = useState(false);
  const [editingTache, setEditingTache] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [filterStatut, setFilterStatut] = useState('');
  const [filterPriorite, setFilterPriorite] = useState('');
  const [detailTacheId, setDetailTacheId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const loadProject = async () => {
    try {
      const [projetRes, collabRes] = await Promise.all([
        projetService.getById(id),
        isResponsable ? utilisateurService.getCollaborateurs() : Promise.resolve({ data: { data: [] } }),
      ]);
      setProjet(projetRes.data.data);
      setCollaborateurs(collabRes.data.data);
    } catch (err) {
      notifyErreur('Projet introuvable');
      navigate('/projets');
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement du projet
  useEffect(() => {
    loadProject();
  }, [id]);

  const openCreateTache = () => {
    setEditingTache(null);
    reset({ titre: '', description: '', priorite: 'MOYENNE', statut: 'A_FAIRE', dateLimite: '', collaborateurId: '' });
    setTacheModalOpen(true);
  };

  const openEditTache = (tache) => {
    setEditingTache(tache);
    reset({
      titre: tache.titre,
      description: tache.description || '',
      priorite: tache.priorite,
      statut: tache.statut,
      dateLimite: formatDateForInput(tache.dateLimite),
      collaborateurId: tache.collaborateurId || '',
    });
    setTacheModalOpen(true);
    setOpenMenuId(null);
  };

  const onTacheSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        projetId: parseInt(id),
        collaborateurId: data.collaborateurId ? parseInt(data.collaborateurId) : null,
      };

      if (editingTache) {
        const res = await tacheService.update(editingTache.id, payload);
        setProjet((prev) => ({
          ...prev,
          taches: prev.taches.map((t) => t.id === editingTache.id ? res.data.data : t),
        }));
      } else {
        const res = await tacheService.create(payload);
        setProjet((prev) => ({
          ...prev,
          taches: [...prev.taches, res.data.data],
        }));
        notifyTacheCreee(data.titre);
      }
      setTacheModalOpen(false);
      reset();
    } catch (err) {
      notifyErreur(err.message);
    }
  };

  const updateStatut = async (tacheId, statut) => {
    try {
      const res = await tacheService.updateStatut(tacheId, statut);
      setProjet((prev) => ({
        ...prev,
        taches: prev.taches.map((t) => t.id === tacheId ? { ...t, statut } : t),
      }));
      if (statut === 'TERMINEE') {
        const tache = projet.taches.find((t) => t.id === tacheId);
        if (tache) notifyTacheTerminee(tache.titre);
      }
    } catch (err) {
      notifyErreur(err.message);
    }
  };

  const handleDeleteTache = async () => {
    setIsDeleting(true);
    try {
      await tacheService.delete(deleteTarget);
      setProjet((prev) => ({ ...prev, taches: prev.taches.filter((t) => t.id !== deleteTarget) }));
    } catch (err) {
      notifyErreur(err.message);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64"><LoadingSpinner size="large" text="Chargement du projet..." /></div>
  );

  if (!projet) return null;

  const tachesFiltrees = projet.taches.filter((t) => {
    if (filterStatut && t.statut !== filterStatut) return false;
    if (filterPriorite && t.priorite !== filterPriorite) return false;
    return true;
  });

  const statutInfo = getProjetStatutInfo(projet.statut);
  const prog = projet.stats?.progression ?? 0;

  const StatutIcon = ({ statut, onClick, disabled }) => {
    const icons = {
      A_FAIRE: <Circle size={18} className="text-[rgb(var(--color-text-dim))]" />,
      EN_COURS: <Clock size={18} className="text-blue-400" />,
      TERMINEE: <CheckCircle2 size={18} className="text-emerald-400" />,
    };
    if (disabled) return icons[statut] || icons.A_FAIRE;
    const nextStatut = { A_FAIRE: 'EN_COURS', EN_COURS: 'TERMINEE', TERMINEE: 'A_FAIRE' }[statut];
    return (
      <button onClick={() => onClick(nextStatut)} title="Changer le statut" className="hover:scale-110 transition-transform">
        {icons[statut] || icons.A_FAIRE}
      </button>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Retour + header */}
      <div>
        <Link to="/projets" className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-muted))] hover:text-white mb-4 transition-colors w-fit">
          <ArrowLeft size={16} /> Retour aux projets
        </Link>

        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <FolderKanban size={20} className="text-indigo-400" />
                </div>
                <span className={`badge ${statutInfo.className}`}>{statutInfo.label}</span>
              </div>
              <h1 className="text-2xl font-black text-white mb-2">{projet.titre}</h1>
              {projet.description && (
                <p className="text-sm text-[rgb(var(--color-text-muted))] leading-relaxed">{projet.description}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-[rgb(var(--color-text-dim))]">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> Début: {formatDate(projet.dateDebut)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> Limite: {formatDate(projet.dateLimite)}
                </span>
                {projet.responsable && (
                  <span className="flex items-center gap-1.5">
                    <Users size={14} /> {projet.responsable.prenom} {projet.responsable.nom}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[rgb(var(--color-text-muted))]">Progression</span>
              <span className="font-bold text-white">{prog}%</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${prog}%` }} />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-[rgb(var(--color-text-dim))]">
              <span><span className="text-white font-semibold">{projet.stats?.tachesTerminees || 0}</span> terminées</span>
              <span><span className="text-blue-400 font-semibold">{projet.stats?.tachesEnCours || 0}</span> en cours</span>
              <span><span className="text-[rgb(var(--color-text-dim))] font-semibold">{projet.stats?.tachesAFaire || 0}</span> à faire</span>
              {projet.stats?.tachesEnRetard > 0 && (
                <span className="text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} />{projet.stats.tachesEnRetard} en retard
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section tâches */}
      <div>
        <div className="section-header">
          <h2 className="text-lg font-bold text-white">
            Tâches <span className="text-sm font-normal text-[rgb(var(--color-text-muted))] ml-1">({tachesFiltrees.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            {/* Filtres */}
            <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}
              className="input text-xs py-1.5 px-3 min-w-0 w-32">
              <option value="">Tous statuts</option>
              <option value="A_FAIRE">À faire</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option>
            </select>
            <select value={filterPriorite} onChange={(e) => setFilterPriorite(e.target.value)}
              className="input text-xs py-1.5 px-3 min-w-0 w-32">
              <option value="">Priorité</option>
              <option value="FAIBLE">Faible</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="HAUTE">Haute</option>
            </select>
            {isResponsable && (
              <button onClick={openCreateTache} className="btn btn-primary btn-sm" id="create-tache-btn">
                <Plus size={14} /> Ajouter
              </button>
            )}
          </div>
        </div>

        {/* Liste des tâches */}
        {tachesFiltrees.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon"><CheckCircle2 size={40} /></div>
            <p className="font-semibold text-white">Aucune tâche</p>
            {isResponsable && (
              <button onClick={openCreateTache} className="btn btn-primary btn-sm mt-3">
                <Plus size={14} /> Créer une tâche
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {tachesFiltrees.map((tache) => {
              const prioriteInfo = getPrioriteInfo(tache.priorite);
              const statutInfo = getTacheStatutInfo(tache.statut);
              const retard = isOverdue(tache.dateLimite) && tache.statut !== 'TERMINEE';
              return (
                <div key={tache.id}
                  className={`card py-3.5 flex items-center gap-4 transition-all ${retard ? 'border-red-500/20' : ''}`}>
                  {/* Icône statut cliquable */}
                  <StatutIcon
                    statut={tache.statut}
                    onClick={(s) => updateStatut(tache.id, s)}
                    disabled={!isResponsable && tache.collaborateurId !== undefined}
                  />

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        onClick={() => setDetailTacheId(tache.id)}
                        className={`font-semibold text-sm cursor-pointer hover:text-indigo-400 transition-colors ${tache.statut === 'TERMINEE' ? 'line-through text-[rgb(var(--color-text-dim))]' : 'text-white'}`}
                      >
                        {tache.titre}
                      </p>
                      <span className={`badge ${prioriteInfo.className}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {prioriteInfo.icon} {prioriteInfo.label}
                      </span>
                      {retard && (
                        <span className="badge badge-danger" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          <AlertCircle size={10} /> Retard
                        </span>
                      )}
                    </div>
                    {tache.description && (
                      <p className="text-xs text-[rgb(var(--color-text-dim))] mt-0.5 truncate">{tache.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-[rgb(var(--color-text-dim))]">
                      <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(tache.dateLimite)}</span>
                      {tache.collaborateur && (
                        <span className="flex items-center gap-1">
                          <div className="avatar" style={{ width: 16, height: 16, fontSize: '8px' }}>
                            {tache.collaborateur.prenom?.charAt(0)}{tache.collaborateur.nom?.charAt(0)}
                          </div>
                          {tache.collaborateur.prenom} {tache.collaborateur.nom}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Statut + menu */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${statutInfo.className} hidden sm:flex`}>{statutInfo.label}</span>
                    {isResponsable && (
                      <div className="relative">
                        <button onClick={() => setOpenMenuId(openMenuId === tache.id ? null : tache.id)}
                          className="p-1.5 rounded-lg hover:bg-[rgb(var(--color-surface-2))] text-[rgb(var(--color-text-dim))]">
                          <MoreVertical size={15} />
                        </button>
                        {openMenuId === tache.id && (
                          <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={() => openEditTache(tache)}>
                              <Edit2 size={13} /> Modifier
                            </button>
                            <button className="dropdown-item danger" onClick={() => { setDeleteTarget(tache.id); setOpenMenuId(null); }}>
                              <Trash2 size={13} /> Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}

      {/* Modal Tâche */}
      {tacheModalOpen && (
        <div className="modal-overlay" onClick={() => setTacheModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingTache ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h2>
              <button onClick={() => setTacheModalOpen(false)} className="text-[rgb(var(--color-text-dim))] hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onTacheSubmit)} className="space-y-4">
              <div>
                <label className="label">Titre *</label>
                <input type="text" placeholder="Titre de la tâche" className={`input ${errors.titre ? 'input-error' : ''}`}
                  {...register('titre', { required: 'Titre requis' })} />
                {errors.titre && <p className="error-text">{errors.titre.message}</p>}
              </div>
              <div>
                <label className="label">Description</label>
                <textarea rows={2} placeholder="Description..." className="input resize-none" {...register('description')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Priorité</label>
                  <select className="input" {...register('priorite')}>
                    <option value="FAIBLE">Faible</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="HAUTE">Haute</option>
                  </select>
                </div>
                <div>
                  <label className="label">Statut</label>
                  <select className="input" {...register('statut')}>
                    <option value="A_FAIRE">À faire</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINEE">Terminée</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Date limite *</label>
                <input type="date" className={`input ${errors.dateLimite ? 'input-error' : ''}`}
                  {...register('dateLimite', { required: 'Date limite requise' })} />
                {errors.dateLimite && <p className="error-text">{errors.dateLimite.message}</p>}
              </div>
              {collaborateurs.length > 0 && (
                <div>
                  <label className="label">Assigner à</label>
                  <select className="input" {...register('collaborateurId')}>
                    <option value="">Non assigné</option>
                    {collaborateurs.map((c) => (
                      <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setTacheModalOpen(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="submit-tache-btn">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {editingTache ? 'Modification...' : 'Création...'}
                    </span>
                  ) : editingTache ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer la tâche"
        message="Cette action est irréversible."
        onConfirm={handleDeleteTache}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />

      <TacheDetailModal
        isOpen={!!detailTacheId}
        onClose={() => setDetailTacheId(null)}
        tacheId={detailTacheId}
        onStatutChange={() => loadProject()}
      />
    </div>
  );
};

export default ProjetDetailPage;
