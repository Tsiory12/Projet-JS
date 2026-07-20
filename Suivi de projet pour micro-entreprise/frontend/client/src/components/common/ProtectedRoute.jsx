/**
 * components/common/ProtectedRoute.jsx - Route protégée par authentification
 * Redirige vers /login si l'utilisateur n'est pas connecté
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Route protégée - Nécessite une authentification
 */
const ProtectedRoute = ({ requiredRole = null }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Afficher un spinner pendant le chargement de l'état d'auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))]">
        <LoadingSpinner size="large" text="Chargement..." />
      </div>
    );
  }

  // Redirection vers login si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Vérification du rôle si spécifié
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
