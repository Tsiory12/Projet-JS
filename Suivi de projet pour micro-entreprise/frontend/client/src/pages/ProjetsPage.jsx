/**
 * pages/ProjetsPage.jsx - Liste et gestion des projets
 * CRUD complet : créer, modifier, supprimer, consulter les projets
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useProjets } from '../hooks/useProjets.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ConfirmModal from '../components/common/ConfirmModal.jsx';
import {
  Plus, Search, FolderKanban, Calendar, X,
  Edit2, Trash2, Eye, MoreVertical, Filter,
} from 'lucide-react';
import {
  formatDate, formatDateForInput, getProjetStatutInfo, calculateProgression,
} from '../utils/helpers.js';

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'EN_PAUSE', label: 'En pause' },
  { value: 'TERMINE', label: 'Terminé' },
  { value: 'ANNULE', label: 'Annulé' },
];

const ProjetsPage = () => {
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProjet, setEditingProjet] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const { projets, isLoading, createProjet, updateProjet, deleteProjet } = useProjets({
    ...(search && { search }),
    ...(statut && { statut }),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm();

  const openCreate = () => {
    setEditingProjet(null);
    reset({ titre: '', description: '', dateDebut: '', dateLimite: '', statut: 'EN_COURS' });
    setModalOpen(true);
  };

  const openEdit = (projet) => {
    setEditingProjet(projet);
    reset({
      titre: projet.titre,
      description: projet.description || '',
      dateDebut: formatDateForInput(projet.dateDebut),
      dateLimite: formatDateForInput(projet.dateLimite),
      statut: projet.statut,
    });
    setModalOpen(true);
    setOpenMenuId(null);
  };

  const onSubmit = async (data) => {
    if (editingProjet) {
      await updateProjet(editingProjet.id, data);
    } else {
      await createProjet(data);
    }
    setModalOpen(false);
    reset();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteProjet(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-black text-white">Projets</h1>
          <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">
            {projets.length} projet{projets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary" id="create-projet-btn">
          <Plus size={16} />
          Nouveau projet
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
            id="project-search"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]" />
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="input pl-9 pr-4 appearance-none cursor-pointer min-w-[180px]"
            id="project-filter-statut"
          >
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille des projets */}
      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="large" text="Chargement des projets..." /></div>
      ) : projets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FolderKanban size={48} /></div>
          <p className="text-lg font-semibold text-white">Aucun projet trouvé</p>
          <p className="text-sm mt-1">Créez votre premier projet pour commencer</p>
          <button onClick={openCreate} className="btn btn-primary mt-4">
            <Plus size={16} /> Créer un projet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projets.map((projet) => {
            const statutInfo = getProjetStatutInfo(projet.statut);
            const prog = projet.stats?.progression ?? 0;
            return (
              <div key={projet.id} className="card hover:border-amber-500/30 transition-all group relative">
                {/* Menu contextuel */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === projet.id ? null : projet.id)}
                    className="p-1.5 rounded-lg hover:bg-[rgb(var(--color-surface-2))] text-[rgb(var(--color-text-dim))] hover:text-white transition-all"
                    id={`projet-menu-${projet.id}`}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === projet.id && (
                    <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/projets/${projet.id}`} className="dropdown-item" onClick={() => setOpenMenuId(null)}>
                        <Eye size={14} /> Voir le détail
                      </Link>
                      <button className="dropdown-item" onClick={() => openEdit(projet)}>
                        <Edit2 size={14} /> Modifier
                      </button>
                      <button className="dropdown-item danger" onClick={() => { setDeleteId(projet.id); setOpenMenuId(null); }}>
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="pr-8">
                  <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <FolderKanban size={20} className="text-amber-400" />
                    </div>
                    <span className={`badge ${statutInfo.className}`}>{statutInfo.label}</span>
                  </div>

                  <Link to={`/projets/${projet.id}`}>
                    <h3 className="font-bold text-white group-hover:text-amber-300 transition-colors truncate-2 mb-2">
                      {projet.titre}
                    </h3>
                  </Link>

                  {projet.description && (
                    <p className="text-xs text-[rgb(var(--color-text-dim))] truncate-2 mb-4">{projet.description}</p>
                  )}

                  {/* Barre de progression */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[rgb(var(--color-text-dim))]">Progression</span>
                      <span className="font-bold text-white">{prog}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${prog}%` }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-[rgb(var(--color-text-dim))]">
                    <span className="flex items-center gap-1">
                      <span className="text-emerald-400 font-semibold">{projet.stats?.tachesTerminees || 0}</span>
                      /{projet.stats?.totalTaches || 0} tâches
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(projet.dateLimite)}
                    </span>
                  </div>

                  {/* Responsable */}
                  {projet.responsable && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgb(var(--color-border)/0.3)]">
                      <div className="avatar" style={{ width: 24, height: 24, fontSize: '10px' }}>
                        {projet.responsable.prenom?.charAt(0)}{projet.responsable.nom?.charAt(0)}
                      </div>
                      <span className="text-xs text-[rgb(var(--color-text-dim))]">
                        {projet.responsable.prenom} {projet.responsable.nom}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overlay clique extérieur menu */}
      {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}

      {/* Modal Créer/Modifier */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingProjet ? 'Modifier le projet' : 'Nouveau projet'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[rgb(var(--color-text-dim))] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Titre *</label>
                <input
                  type="text" placeholder="Titre du projet"
                  className={`input ${errors.titre ? 'input-error' : ''}`}
                  {...register('titre', { required: 'Titre requis', minLength: { value: 3, message: 'Min. 3 caractères' } })}
                />
                {errors.titre && <p className="error-text">{errors.titre.message}</p>}
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  rows={3} placeholder="Description du projet..."
                  className="input resize-none"
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date de début *</label>
                  <input type="date" className={`input ${errors.dateDebut ? 'input-error' : ''}`}
                    {...register('dateDebut', { required: 'Date début requise' })} />
                  {errors.dateDebut && <p className="error-text">{errors.dateDebut.message}</p>}
                </div>
                <div>
                  <label className="label">Date limite *</label>
                  <input type="date" className={`input ${errors.dateLimite ? 'input-error' : ''}`}
                    {...register('dateLimite', { required: 'Date limite requise' })} />
                  {errors.dateLimite && <p className="error-text">{errors.dateLimite.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Statut</label>
                <select className="input" {...register('statut')}>
                  <option value="EN_COURS">En cours</option>
                  <option value="EN_PAUSE">En pause</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="ANNULE">Annulé</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="submit-projet-btn">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {editingProjet ? 'Modification...' : 'Création...'}
                    </span>
                  ) : editingProjet ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer le projet"
        message="Tous les tâches associées seront également supprimées. Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjetsPage;
