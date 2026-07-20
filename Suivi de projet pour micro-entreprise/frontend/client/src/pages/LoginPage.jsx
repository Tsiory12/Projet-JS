/**
 * pages/LoginPage.jsx - Page de connexion
 * Formulaire avec React Hook Form et validation
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      email: '',
      motDePasse: '',
    },
  });

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError('motDePasse', { message: result.error });
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Titre */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white mb-2">Bienvenue 👋</h2>
        <p className="text-[rgb(var(--color-text-muted))]">
          Connectez-vous à votre espace de travail
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="label">Email</label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]"
            />
            <input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
              {...register('email', {
                required: 'L\'email est requis',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email invalide',
                },
              })}
            />
          </div>
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="motDePasse" className="label">Mot de passe</label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]"
            />
            <input
              id="motDePasse"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`input pl-10 pr-10 ${errors.motDePasse ? 'input-error' : ''}`}
              {...register('motDePasse', {
                required: 'Le mot de passe est requis',
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.motDePasse && <p className="error-text">{errors.motDePasse.message}</p>}
        </div>

        {/* Bouton connexion */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full mt-2"
          id="login-submit-btn"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connexion...
            </span>
          ) : (
            <>
              <LogIn size={18} />
              Se connecter
            </>
          )}
        </button>
      </form>

      {/* Compte démo */}
      <div className="mt-6 p-4 rounded-xl bg-[rgb(var(--color-surface-2))] border border-[rgb(var(--color-border)/0.3)]">
        <p className="text-xs font-semibold text-[rgb(var(--color-text-muted))] mb-2 uppercase tracking-wider">
          🔑 Comptes de démonstration
        </p>
        <div className="space-y-1 text-xs text-[rgb(var(--color-text-dim))]">
          <p><span className="text-indigo-400">Responsable:</span> marie.dupont@entreprise.com</p>
          <p><span className="text-emerald-400">Collaborateur:</span> lucas.martin@entreprise.com</p>
          <p className="text-[rgb(var(--color-text-dim))]">Mot de passe: <span className="text-white font-mono">Password123</span></p>
        </div>
      </div>

      {/* Lien inscription */}
      <p className="text-center text-sm text-[rgb(var(--color-text-muted))] mt-6">
        Pas encore de compte ?{' '}
        <Link
          to="/register"
          className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          id="register-link"
        >
          S'inscrire
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
