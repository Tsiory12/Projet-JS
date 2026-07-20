/**
 * pages/DashboardResponsablePage.jsx - Tableau de bord du Responsable
 * Affiche les statistiques globales et les graphiques d'avancement avec Chart.js
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { projetService } from '../services/projet.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  FolderKanban,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  Plus,
  Calendar,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { formatDate, getProjetStatutInfo } from '../utils/helpers.js';

// Enregistrement des composants Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const chartDefaults = {
  plugins: {
    legend: {
      labels: {
        color: 'rgb(150, 150, 180)',
        font: { family: 'Inter', size: 12 },
      },
    },
  },
};

const DashboardResponsablePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await projetService.getDashboardStats();
        setStats(response.data.data);
      } catch (err) {
        console.error('Erreur stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Chargement du tableau de bord..." />
      </div>
    );
  }

  // ============================================================
  // Données Chart.js
  // ============================================================

  // Graphique en barres - Progression des projets
  const barChartData = {
    labels: stats?.projetProgression?.map((p) => p.titre.substring(0, 20) + '...') || [],
    datasets: [
      {
        label: 'Progression (%)',
        data: stats?.projetProgression?.map((p) => p.progression) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    ...chartDefaults,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: 'rgba(55, 55, 80, 0.4)' },
        ticks: { color: 'rgb(150, 150, 180)', font: { size: 11, family: 'Inter' } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(55, 55, 80, 0.4)' },
        ticks: {
          color: 'rgb(150, 150, 180)',
          font: { size: 11, family: 'Inter' },
          callback: (v) => `${v}%`,
        },
      },
    },
    plugins: {
      ...chartDefaults.plugins,
      title: {
        display: true,
        text: 'Progression des projets',
        color: 'rgb(230, 230, 250)',
        font: { size: 14, family: 'Inter', weight: 'bold' },
        padding: { bottom: 16 },
      },
    },
  };

  // Graphique donut - Répartition des priorités
  const prioriteData = stats?.taches?.parPriorite || [];
  const doughnutData = {
    labels: ['Faible', 'Moyenne', 'Haute'],
    datasets: [
      {
        data: [
          prioriteData.find((p) => p.priorite === 'FAIBLE')?._count?.priorite || 0,
          prioriteData.find((p) => p.priorite === 'MOYENNE')?._count?.priorite || 0,
          prioriteData.find((p) => p.priorite === 'HAUTE')?._count?.priorite || 0,
        ],
        backgroundColor: ['rgba(34, 197, 94, 0.7)', 'rgba(234, 179, 8, 0.7)', 'rgba(239, 68, 68, 0.7)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(234, 179, 8, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    ...chartDefaults,
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      ...chartDefaults.plugins,
      title: {
        display: true,
        text: 'Répartition des priorités',
        color: 'rgb(230, 230, 250)',
        font: { size: 14, family: 'Inter', weight: 'bold' },
        padding: { bottom: 16 },
      },
    },
  };

  // Graphique donut - Statut des tâches
  const tacheStatutData = stats?.taches?.parStatut || [];
  const tacheStatutDoughnut = {
    labels: ['À faire', 'En cours', 'Terminées'],
    datasets: [
      {
        data: [
          tacheStatutData.find((s) => s.statut === 'A_FAIRE')?._count?.statut || 0,
          tacheStatutData.find((s) => s.statut === 'EN_COURS')?._count?.statut || 0,
          tacheStatutData.find((s) => s.statut === 'TERMINEE')?._count?.statut || 0,
        ],
        backgroundColor: ['rgba(100, 100, 130, 0.7)', 'rgba(59, 130, 246, 0.7)', 'rgba(34, 197, 94, 0.7)'],
        borderColor: ['rgba(100, 100, 130, 1)', 'rgba(59, 130, 246, 1)', 'rgba(34, 197, 94, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-black text-white">
            Bonjour, {user?.prenom} 👋
          </h1>
          <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">
            Voici un aperçu de l'avancement de vos projets
          </p>
        </div>
        <Link to="/projets/nouveau" className="btn btn-primary" id="new-project-btn">
          <Plus size={16} />
          Nouveau projet
        </Link>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FolderKanban size={22} />}
          label="Total projets"
          value={stats?.projets?.total || 0}
          color="bg-indigo-500/10 text-indigo-400"
          trend="+2 ce mois"
        />
        <StatCard
          icon={<CheckSquare size={22} />}
          label="Total tâches"
          value={stats?.taches?.total || 0}
          color="bg-blue-500/10 text-blue-400"
          trend={`${stats?.taches?.terminees || 0} terminées`}
        />
        <StatCard
          icon={<AlertCircle size={22} />}
          label="En retard"
          value={stats?.taches?.enRetard || 0}
          color="bg-red-500/10 text-red-400"
          isAlert={stats?.taches?.enRetard > 0}
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="Tâches terminées"
          value={stats?.taches?.terminees || 0}
          color="bg-emerald-500/10 text-emerald-400"
          trend="Ce trimestre"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Barre - Progression */}
        <div className="card lg:col-span-2">
          <div style={{ height: '280px' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Donut - Statuts tâches */}
        <div className="card">
          <div style={{ height: '280px' }}>
            <Doughnut data={tacheStatutDoughnut} options={{ ...doughnutOptions, plugins: { ...doughnutOptions.plugins, title: { ...doughnutOptions.plugins.title, text: 'Statut des tâches' } } }} />
          </div>
        </div>
      </div>

      {/* Répartition priorités + Projets récents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Donut - Priorités */}
        <div className="card">
          <div style={{ height: '240px' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Projets récents */}
        <div className="card lg:col-span-2">
          <div className="section-header mb-4">
            <h3 className="text-base font-bold text-white">Projets récents</h3>
            <Link to="/projets" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.projetProgression?.length === 0 ? (
              <p className="text-sm text-[rgb(var(--color-text-dim))] text-center py-6">
                Aucun projet pour l'instant
              </p>
            ) : (
              stats?.projetProgression?.map((projet) => {
                const statutInfo = getProjetStatutInfo(projet.statut);
                return (
                  <Link
                    key={projet.id}
                    to={`/projets/${projet.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-[rgb(var(--color-surface-2))] transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                          {projet.titre}
                        </p>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          <span className={`badge ${statutInfo.className}`}>{statutInfo.label}</span>
                          <span className="text-sm font-bold text-[rgb(var(--color-text-muted))]">
                            {projet.progression}%
                          </span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${projet.progression}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Calendar size={11} className="text-[rgb(var(--color-text-dim))]" />
                        <span className="text-[11px] text-[rgb(var(--color-text-dim))]">
                          {projet.tachesTerminees}/{projet.totalTaches} tâches · Échéance {formatDate(projet.dateLimite)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant carte statistique
const StatCard = ({ icon, label, value, color, trend, isAlert }) => (
  <div className={`stat-card ${isAlert ? 'border-red-500/20' : ''}`}>
    <div className={`stat-icon ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5">{label}</p>
      {trend && (
        <p className="text-[10px] text-[rgb(var(--color-text-dim))] mt-1 flex items-center gap-1">
          <Clock size={10} />
          {trend}
        </p>
      )}
    </div>
  </div>
);

export default DashboardResponsablePage;
