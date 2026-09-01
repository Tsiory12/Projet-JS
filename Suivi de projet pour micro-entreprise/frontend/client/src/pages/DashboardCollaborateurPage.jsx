/**
 * pages/DashboardCollaborateurPage.jsx - Tableau de bord du Collaborateur
 * Affiche les tâches assignées, statistiques et prochaines échéances
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { tacheService } from '../services/tache.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Target,
  ArrowRight,
  Calendar,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import {
  formatDate,
  getTacheStatutInfo,
  getPrioriteInfo,
  daysUntil,
} from '../utils/helpers.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const DashboardCollaborateurPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await tacheService.getDashboardStats();
        setStats(response.data.data);
      } catch (err) {
        console.error('Erreur stats collaborateur:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Chargement..." />
      </div>
    );
  }

  const parStatut = stats?.parStatut || [];
  const aFaire = parStatut.find((s) => s.statut === 'A_FAIRE')?._count?.statut || 0;
  const enCours = parStatut.find((s) => s.statut === 'EN_COURS')?._count?.statut || 0;
  const terminees = parStatut.find((s) => s.statut === 'TERMINEE')?._count?.statut || 0;

  const doughnutData = {
    labels: ['À faire', 'En cours', 'Terminées'],
    datasets: [
      {
        data: [aFaire, enCours, terminees],
        backgroundColor: [
          'rgba(100, 100, 130, 0.8)',
          'rgba(94, 231, 216, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: ['rgb(100,100,130)', 'rgb(94,231,216)', 'rgb(34,197,94)'],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        labels: { color: 'rgb(150,150,180)', font: { family: 'Inter', size: 12 } },
      },
      title: {
        display: true,
        text: 'Mes tâches par statut',
        color: 'rgb(230,230,250)',
        font: { size: 14, family: 'Inter', weight: 'bold' },
        padding: { bottom: 16 },
      },
    },
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-black text-white">
            Mon espace, {user?.prenom}
          </h1>
          <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">
            Suivez et mettez à jour vos tâches assignées
          </p>
        </div>
        <Link to="/taches" className="btn btn-primary" id="view-tasks-btn">
          <CheckSquare size={16} />
          Mes tâches
        </Link>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-amber-500/10 text-amber-400">
            <Target size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{stats?.total || 0}</p>
            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5">Total tâches</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-teal-500/10 text-teal-400">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{enCours}</p>
            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5">En cours</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-emerald-500/10 text-emerald-400">
            <CheckSquare size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{terminees}</p>
            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5">Terminées</p>
          </div>
        </div>
        <div className="stat-card border-red-500/20">
          <div className="stat-icon bg-red-500/10 text-red-400">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{stats?.enRetard || 0}</p>
            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5">En retard</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graphique */}
        <div className="card">
          <div style={{ height: '260px' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Prochaines échéances */}
        <div className="card lg:col-span-2">
          <div className="section-header mb-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-white">
              <Flame size={16} className="text-orange-400" />
              Prochaines échéances (7 jours)
            </h3>
            <Link to="/taches" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {!stats?.prochaines || stats.prochaines.length === 0 ? (
              <div className="empty-state py-8">
                <CheckCircle2 size={40} className="text-emerald-500/70 mb-3" />
                <p className="text-sm font-semibold text-white">Aucune échéance proche</p>
                <p className="text-xs mt-1">Toutes vos tâches sont à jour !</p>
              </div>
            ) : (
              stats.prochaines.map((tache) => {
                const jours = daysUntil(tache.dateLimite);
                const statutInfo = getTacheStatutInfo(tache.statut);
                const prioriteInfo = getPrioriteInfo(tache.priorite);
                const isUrgent = jours <= 2;

                return (
                  <Link
                    key={tache.id}
                    to="/taches"
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-[rgb(var(--color-surface-2))] group ${isUrgent ? 'border border-red-500/20' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[rgb(var(--color-surface-2))] flex-shrink-0">
                      <p className={`text-lg font-black ${isUrgent ? 'text-red-400' : 'text-white'}`}>{jours}</p>
                      <p className="text-[9px] text-[rgb(var(--color-text-dim))]">jours</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                        {tache.titre}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge badge-sm ${prioriteInfo.className}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {prioriteInfo.label}
                        </span>
                        <span className="text-xs text-[rgb(var(--color-text-dim))] flex items-center gap-1">
                          <Calendar size={10} />
                          {tache.projet?.titre}
                        </span>
                      </div>
                    </div>
                    <span className={`badge ${statutInfo.className}`}>{statutInfo.label}</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Progression globale */}
      {stats?.total > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Ma progression globale</h3>
            <span className="text-2xl font-black gradient-text">
              {Math.round((terminees / stats.total) * 100)}%
            </span>
          </div>
          <div className="progress-bar" style={{ height: '10px' }}>
            <div
              className="progress-fill"
              style={{ width: `${Math.round((terminees / stats.total) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-[rgb(var(--color-text-dim))] mt-2">
            {terminees} terminées sur {stats.total} tâches assignées
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardCollaborateurPage;
