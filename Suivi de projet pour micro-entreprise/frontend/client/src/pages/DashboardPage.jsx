/**
 * pages/DashboardPage.jsx - Routeur de tableau de bord
 * Redirige vers le bon dashboard selon le rôle de l'utilisateur
 */

import { useAuth } from '../context/AuthContext.jsx';
import DashboardResponsablePage from './DashboardResponsablePage.jsx';
import DashboardCollaborateurPage from './DashboardCollaborateurPage.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const DashboardPage = () => {
  const { isResponsable, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Chargement..." />
      </div>
    );
  }

  // Routage basé sur le rôle
  return isResponsable ? <DashboardResponsablePage /> : <DashboardCollaborateurPage />;
};

export default DashboardPage;
