/**
 * layouts/MainLayout.jsx - Layout principal de l'application
 * Contient la sidebar, le header et la zone de contenu principale
 */

import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  Briefcase,
  Settings,
  Sun,
  Moon,
  AlertTriangle,
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout, isResponsable } = useAuth();
  const { unreadCount, notifications, markAllAsRead } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  useEffect(() => {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    setTheme(currentTheme);
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation selon le rôle
  const navItems = isResponsable
    ? [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
        { to: '/projets', icon: FolderKanban, label: 'Projets' },
        { to: '/taches', icon: CheckSquare, label: 'Tâches' },
        { to: '/profil', icon: User, label: 'Profil' },
      ]
    : [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Mon tableau de bord' },
        { to: '/taches', icon: CheckSquare, label: 'Mes tâches' },
        { to: '/profil', icon: User, label: 'Profil' },
      ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[rgb(var(--color-border)/0.3)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white leading-tight">Suivi Projets</h1>
            <p className="text-[10px] text-[rgb(var(--color-text-dim))] uppercase tracking-widest">
              Micro-Entreprise
            </p>
          </div>
        </div>
      </div>

      {/* Profil utilisateur */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(var(--color-surface-2))] border border-[rgb(var(--color-border)/0.3)]">
          <div className="avatar">
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-[rgb(var(--color-text-dim))] truncate">
              {isResponsable ? 'Responsable' : 'Collaborateur'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/20'
                : 'text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-2))] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={isActive ? 'text-amber-400' : 'text-[rgb(var(--color-text-dim))] group-hover:text-white'}
                />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-amber-400 opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="p-3 border-t border-[rgb(var(--color-border)/0.3)]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger)/0.08)] transition-all duration-200 group"
        >
          <LogOut size={18} className="group-hover:text-[rgb(var(--color-danger))]" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--color-bg))]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-[rgb(var(--color-surface))] border-r border-[rgb(var(--color-border)/0.3)] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile - Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 bg-[rgb(var(--color-surface))] flex flex-col z-10 animate-slideIn">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[rgb(var(--color-surface-2))] text-[rgb(var(--color-text-muted))]"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border)/0.3)] flex-shrink-0">
          <div className="max-w-7xl mx-auto w-full px-4 lg:px-6 flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              {/* Bouton menu mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-[rgb(var(--color-surface-2))] text-[rgb(var(--color-text-muted))]"
              >
                <Menu size={20} />
              </button>
              <div className="hidden sm:block">
                <h2 className="text-sm text-[rgb(var(--color-text-dim))]">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Bouton Dark/Light Mode */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-[rgb(var(--color-surface-2))] text-[rgb(var(--color-text-muted))] hover:text-white transition-all"
                title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Cloche de notifications */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); markAllAsRead(); }}
                  className="relative p-2 rounded-xl hover:bg-[rgb(var(--color-surface-2))] text-[rgb(var(--color-text-muted))] hover:text-white transition-all"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown notifications */}
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-[rgb(var(--color-surface-2))] border border-[rgb(var(--color-border)/0.5)] rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                    <div className="p-3 border-b border-[rgb(var(--color-border)/0.3)] flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="text-[rgb(var(--color-text-dim))] hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-[rgb(var(--color-text-dim))]">
                          Aucune notification
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((notif) => (
                          <div
                            key={notif.id}
                            className="px-3 py-2.5 border-b border-[rgb(var(--color-border)/0.2)] hover:bg-[rgb(var(--color-surface-3))] transition-colors"
                          >
                            <p className="text-xs text-[rgb(var(--color-text-muted))]">{notif.message}</p>
                            <p className="text-[10px] text-[rgb(var(--color-text-dim))] mt-0.5">
                              {new Date(notif.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar */}
              <NavLink to="/profil" className="flex items-center gap-2">
                <div className="avatar">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </div>
              </NavLink>
            </div>
          </div>
        </header>

        {/* Zone de contenu scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>

    {/* Modal de confirmation de déconnexion */}
    {showLogoutConfirm && (
      <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
        <div className="modal max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[rgb(var(--color-danger)/0.1)] flex items-center justify-center mb-4">
              <AlertTriangle size={24} className="text-[rgb(var(--color-danger))]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Confirmer la déconnexion</h3>
            <p className="text-sm text-[rgb(var(--color-text-muted))] mb-6">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-[rgb(var(--color-text-muted))] bg-[rgb(var(--color-surface-2))] hover:bg-[rgb(var(--color-surface-3))] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger)/0.8)] transition-all"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
};

export default MainLayout;
