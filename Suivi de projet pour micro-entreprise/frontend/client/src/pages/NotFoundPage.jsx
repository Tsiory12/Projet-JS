/**
 * pages/NotFoundPage.jsx - Page 404
 */

import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-[rgb(var(--color-danger)/0.1)] flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="text-[rgb(var(--color-danger))]" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2">404</h1>
        <p className="text-lg text-[rgb(var(--color-text-muted))] mb-6">Page introuvable</p>
        <p className="text-sm text-[rgb(var(--color-text-dim))] mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          <Home size={16} /> Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
