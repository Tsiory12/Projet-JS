/**
 * layouts/AuthLayout.jsx - Layout pour les pages d'authentification
 * Design visuel pour Login et Register
 */

import { Outlet } from 'react-router-dom';
import { Briefcase, FolderKanban, CheckSquare, LayoutDashboard } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-[rgb(var(--color-bg))]">
      {/* Panel gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex-col items-center justify-center p-12">
        {/* Cercles décoratifs */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl" />

        {/* Contenu branding */}
        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-8 shadow-2xl shadow-indigo-500/30">
            <Briefcase size={36} className="text-white" />
          </div>

          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            Suivi de Projets
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Micro-Entreprise
            </span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed mb-12">
            Gérez vos projets, assignez vos tâches et suivez l'avancement de votre équipe en temps réel.
          </p>

          {/* Features */}
          <div className="space-y-4 text-left">
            {[
              { icon: <FolderKanban className="text-indigo-400" size={24} />, title: 'Gestion de projets', desc: 'Créez et pilotez vos projets facilement' },
              { icon: <CheckSquare className="text-purple-400" size={24} />, title: 'Suivi des tâches', desc: 'Assignez et suivez chaque tâche' },
              { icon: <LayoutDashboard className="text-pink-400" size={24} />, title: 'Tableaux de bord', desc: 'Visualisez l\'avancement en temps réel' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="flex-shrink-0 mt-0.5">{f.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-slate-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel droit - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo mobile uniquement */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Briefcase size={20} className="text-white" />
            </div>
            <span className="font-bold text-white">Suivi Projets</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
