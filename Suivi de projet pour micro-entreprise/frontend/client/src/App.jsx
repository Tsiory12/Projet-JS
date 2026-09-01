/**
 * App.jsx - Configuration du routeur React
 * Définition de toutes les routes de l'application
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contextes
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

// Layouts
import AuthLayout from './layouts/AuthLayout.jsx';
import MainLayout from './layouts/MainLayout.jsx';

// Guards
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Pages d'authentification
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Pages protégées
import DashboardPage from './pages/DashboardPage.jsx';
import ProjetsPage from './pages/ProjetsPage.jsx';
import ProjetDetailPage from './pages/ProjetDetailPage.jsx';
import TachesPage from './pages/TachesPage.jsx';
import ProfilPage from './pages/ProfilPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          {/* Conteneur de notifications Toast */}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            theme="dark"
            toastStyle={{
              background: 'rgb(var(--color-surface-2))',
              border: '1px solid rgb(var(--color-border) / 0.5)',
              borderRadius: '12px',
              color: 'rgb(var(--color-text))',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            }}
          />

          <Routes>
            {/* ================================================
                Routes publiques (Auth)
                ================================================ */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* ================================================
                Routes protégées (Authentification requise)
                ================================================ */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                {/* Tableau de bord */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Projets */}
                <Route path="/projets" element={<ProjetsPage />} />
                <Route path="/projets/nouveau" element={<ProjetsPage />} />
                <Route path="/projets/:id" element={<ProjetDetailPage />} />

                {/* Tâches */}
                <Route path="/taches" element={<TachesPage />} />

                {/* Profil */}
                <Route path="/profil" element={<ProfilPage />} />
              </Route>
            </Route>

            {/* ================================================
                Redirections
                ================================================ */}
            {/* Racine → Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
