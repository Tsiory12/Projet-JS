/**
 * pages/TachesPage.jsx - Liste globale des tâches
 * Vue kanban et liste avec filtres, mise à jour de statut
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTaches } from '../hooks/useTaches.js';
import { useProjets } from '../hooks/useProjets.js';
import { utilisateurService } from '../services/utilisateur.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ConfirmModal from '../components/common/ConfirmModal.jsx';
import {
  Search, Plus, Filter, CheckSquare, X, Edit2,
  Trash2, CheckCircle2, Clock, Circle, Calendar,
  AlertCircle, MoreVertical, Columns, List,
} from 'lucide-react';
import {
  formatDate, formatDateForInput, getTacheStatutInfo,
  getPrioriteInfo, isOverdue, getInitiales,
} from '../utils/helpers.js';
import { useEffect } from 'react';
import TacheDetailModal from '../components/tasks/TacheDetailModal.jsx';

const COLONNES_KANBAN = [
  { key: 'A_FAIRE', label: 'À faire', icon: Circle, color: 'text-[rgb(var(--color-text-dim))]', borderColor: 'border-[rgb(var(--color-border)/0.5)]' },
  { key: 'EN_COURS', label: 'En cours', icon: Clock, color: 'text-blue-400', borderColor: 'border-blue-500/30' },
  { key: 'TERMINEE', label: 'Terminée', icon: CheckCircle2, color: 'text-emerald-400', borderColor: 'border-emerald-500/30' },
];

const TachesPage = () => {
  const { isResponsable } = useAuth();
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterPriorite, setFilterPriorite] = useState('');
  const [filterProjet, setFilterProjet] = useState('');
  const [view, setView] = useState('liste'); // 'liste' | 'kanban'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTache, setEditingTache] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [detailTacheId, setDetailTacheId] = useState(null);

  const { taches, isLoading, refetch, createTache, updateTache, updateStatut, deleteTache } = useTaches({
    ...(search && { search }),
    ...(filterStatut && { statut: filterStatut }),
    ...(filterPriorite && { priorite: filterPriorite }),
    ...(filterProjet && { projetId: filterProjet }),
  });

  const { projets } = useProjets();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (isResponsable) {
      utilisateurService.getCollaborateurs()
        .then((r) => setCollaborateurs(r.data.data))
        .catch(() => {});
    }
  }, [isResponsable]);

  const openCreate = () => {
    setEditingTache(null);
    reset({ titre: '', description: '', priorite: 'MOYENNE', statut: 'A_FAIRE', dateLimite: '', projetId: '', collaborateurId: '' });
    setModalOpen(true);
  };

  const openEdit = (tache) => {
    setEditingTache(tache);
    reset({
      titre: tache.titre,
      description: tache.description || '',
      priorite: tache.priorite,
      statut: tache.statut,
      dateLimite: formatDateForInput(tache.dateLimite),
      projetId: tache.projetId || '',
      collaborateurId: tache.collaborateurId || '',
    });
    setModalOpen(true);
    setOpenMenuId(null);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      projetId: parseInt(data.projetId),
      collaborateurId: data.collaborateurId ? parseInt(data.collaborateurId) : null,
    };
    if (editingTache) {
      await updateTache(editingTache.id, payload);
    } else {
      await createTache(payload);
    }
    setModalOpen(false);
    reset();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteTache(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
  };

  const TacheCard = ({ tache, compact = false }) => {
    const prioriteInfo = getPrioriteInfo(tache.priorite);
    const statutInfo = getTacheStatutInfo(tache.statut);
    const retard = isOverdue(tache.dateLimite) && tache.statut !== 'TERMINEE';

    return (
      <div className={`card py-3.5 flex items-center gap-3 transition-all ${retard ? 'border-red-500/20' : ''} ${compact ? 'mb-2' : ''}`}>
        {/* Bouton statut */}
        <button
          onClick={() => {
            const next = { A_FAIRE: 'EN_COURS', EN_COURS: 'TERMINEE', TERMINEE: 'A_FAIRE' }[tache.statut];
            updateStatut(tache.id, next);
          }}
          title="Changer le statut"
          className="flex-shrink-0 hover:scale-110 transition-transform"
        >
          {tache.statut === 'A_FAIRE' && <Circle size={18} className="text-[rgb(var(--color-text-dim))]" />}
          {tache.statut === 'EN_COURS' && <Clock size={18} className="text-blue-400" />}
          {tache.statut === 'TERMINEE' && <CheckCircle2 size={18} className="text-emerald-400" />}
        </button>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <p
              onClick={() => setDetailTacheId(tache.id)}
              className={`text-sm font-semibold cursor-pointer hover:text-indigo-400 transition-colors ${tache.statut === 'TERMINEE' ? 'line-through text-[rgb(var(--color-text-dim))]' : 'text-white'}`}
            >
              {tache.titre}
            </p>
            <span className={`badge ${prioriteInfo.className}`} style={{ fontSize: '10px', padding: '1px 5px' }}>
              {prioriteInfo.label}
            </span>
            {retard && (
              <span className="badge badge-danger" style={{ fontSize: '10px', padding: '1px 5px' }}>
                <AlertCircle size={9} /> Retard
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-[rgb(var(--color-text-dim))]">
            {tache.projet && (
              <Link to={`/projets/${tache.projet.id}`} className="hover:text-indigo-400 transition-colors truncate max-w-[150px]">
                📁 {tache.projet.titre}
              </Link>
            )}
            <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(tache.dateLimite)}</span>
            {tache.collaborateur && (
              <span className="flex items-center gap-1">
                <div className="avatar" style={{ width: 16, height: 16, fontSize: '8px' }}>
                  {getInitiales(tache.collaborateur.nom, tache.collaborateur.prenom)}
                </div>
                {tache.collaborateur.prenom}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!compact && <span className={`badge ${statutInfo.className} hidden md:flex`}>{statutInfo.label}</span>}
          {isResponsable && (
            <div className="relative">
              <button onClick={() => setOpenMenuId(openMenuId === tache.id ? null : tache.id)}
                className="p-1.5 rounded-lg hover:bg-[rgb(var(--color-surface-2))] text-[rgb(var(--color-text-dim))]">
                <MoreVertical size={14} />
              </button>
              {openMenuId === tache.id && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={() => openEdit(tache)}><Edit2 size={12} /> Modifier</button>
                  <button className="dropdown-item danger" onClick={() => { setDeleteId(tache.id); setOpenMenuId(null); }}>
                    <Trash2 size={12} /> Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-black text-white">Tâches</h1>
          <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">{taches.length} tâche{taches.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle vue */}
          <div className="flex bg-[rgb(var(--color-surface-2))] rounded-lg p-1 gap-1">
            <button onClick={() => setView('liste')}
              className={`p-1.5 rounded-md transition-all ${view === 'liste' ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-[rgb(var(--color-text-dim))] hover:text-white'}`}
              title="Vue liste">
              <List size={16} />
            </button>
            <button onClick={() => setView('kanban')}
              className={`p-1.5 rounded-md transition-all ${view === 'kanban' ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-[rgb(var(--color-text-dim))] hover:text-white'}`}
              title="Vue kanban">
              <Columns size={16} />
            </button>
          </div>
          {isResponsable && (
            <button onClick={openCreate} className="btn btn-primary" id="create-tache-global-btn">
              <Plus size={16} /> Nouvelle tâche
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" id="tache-search" />
        </div>
        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="input w-36" id="tache-filter-statut">
          <option value="">Tous statuts</option>
          <option value="A_FAIRE">À faire</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINEE">Terminée</option>
        </select>
        <select value={filterPriorite} onChange={(e) => setFilterPriorite(e.target.value)} className="input w-36" id="tache-filter-priorite">
          <option value="">Priorité</option>
          <option value="FAIBLE">Faible</option>
          <option value="MOYENNE">Moyenne</option>
          <option value="HAUTE">Haute</option>
        </select>
        {isResponsable && (
          <select value={filterProjet} onChange={(e) => setFilterProjet(e.target.value)} className="input w-44" id="tache-filter-projet">
            <option value="">Tous projets</option>
            {projets.map((p) => <option key={p.id} value={p.id}>{p.titre}</option>)}
          </select>
        )}
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="large" text="Chargement..." /></div>
      ) : taches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CheckSquare size={48} /></div>
          <p className="text-lg font-semibold text-white">Aucune tâche</p>
          <p className="text-sm mt-1">
            {isResponsable ? 'Créez votre première tâche' : 'Aucune tâche ne vous est assignée'}
          </p>
        </div>
      ) : view === 'liste' ? (
        /* VUE LISTE */
        <div className="space-y-2">
          {taches.map((tache) => <TacheCard key={tache.id} tache={tache} />)}
        </div>
      ) : (
        /* VUE KANBAN */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
          {COLONNES_KANBAN.map(({ key, label, icon: Icon, color, borderColor }) => {
            const col = taches.filter((t) => t.statut === key);
            return (
              <div key={key} className={`rounded-xl border-2 ${borderColor} bg-[rgb(var(--color-surface)/0.5)] p-3`}>
                <div className={`flex items-center gap-2 mb-3 ${color}`}>
                  <Icon size={16} />
                  <h3 className="font-bold text-sm text-white">{label}</h3>
                  <span className="ml-auto w-5 h-5 rounded-full bg-[rgb(var(--color-surface-2))] text-[10px] font-bold text-[rgb(var(--color-text-muted))] flex items-center justify-center">
                    {col.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {col.length === 0 ? (
                    <p className="text-xs text-[rgb(var(--color-text-dim))] text-center py-4">Aucune tâche</p>
                  ) : (
                    col.map((tache) => <TacheCard key={tache.id} tache={tache} compact />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}

      {/* Modal Tâche */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingTache ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[rgb(var(--color-text-dim))] hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Titre *</label>
                <input type="text" placeholder="Titre de la tâche" className={`input ${errors.titre ? 'input-error' : ''}`}
                  {...register('titre', { required: 'Titre requis' })} />
                {errors.titre && <p className="error-text">{errors.titre.message}</p>}
              </div>
              <div>
                <label className="label">Description</label>
                <textarea rows={2} className="input resize-none" placeholder="Description..." {...register('description')} />
              </div>
              {isResponsable && (
                <div>
                  <label className="label">Projet *</label>
                  <select className={`input ${errors.projetId ? 'input-error' : ''}`}
                    {...register('projetId', { required: 'Projet requis' })}>
                    <option value="">Sélectionner un projet</option>
                    {projets.map((p) => <option key={p.id} value={p.id}>{p.titre}</option>)}
                  </select>
                  {errors.projetId && <p className="error-text">{errors.projetId.message}</p>}
                </div>
              )}
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
              {isResponsable && collaborateurs.length > 0 && (
                <div>
                  <label className="label">Assigner à</label>
                  <select className="input" {...register('collaborateurId')}>
                    <option value="">Non assigné</option>
                    {collaborateurs.map((c) => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="submit-tache-modal-btn">
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
        isOpen={!!deleteId}
        title="Supprimer la tâche"
        message="Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />

      <TacheDetailModal
        isOpen={!!detailTacheId}
        onClose={() => setDetailTacheId(null)}
        tacheId={detailTacheId}
        onStatutChange={() => refetch()}
      />
    </div>
  );
};

export default TachesPage;
