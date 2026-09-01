/**
 * pages/RegisterPage.jsx - Page d'inscription
 * Formulaire complet avec choix du rôle
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Crown, Users } from 'lucide-react';

const RegisterPage = () => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('COLLABORATEUR');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      motDePasse: '',
      confirmPassword: '',
    },
  });

  const motDePasse = watch('motDePasse');

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await registerUser({ ...userData, role: selectedRole });
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Titre */}
      <div className="mb-6">
        <h2 className="text-3xl font-black text-white mb-2">Créer un compte</h2>
        <p className="text-[rgb(var(--color-text-muted))]">
          Rejoignez votre espace de travail collaboratif
        </p>
      </div>

      {/* Sélection du rôle */}
      <div className="mb-6">
        <label className="label">Votre rôle</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole('RESPONSABLE')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
              ${selectedRole === 'RESPONSABLE'
                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                : 'border-[rgb(var(--color-border)/0.4)] bg-[rgb(var(--color-surface-2))] text-[rgb(var(--color-text-muted))] hover:border-[rgb(var(--color-border))]'
              }`}
            id="role-responsable-btn"
          >
            <Crown size={24} />
            <span className="text-sm font-semibold">Responsable</span>
            <span className="text-[10px] opacity-70 text-center">Gérer les projets et tâches</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('COLLABORATEUR')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
              ${selectedRole === 'COLLABORATEUR'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-[rgb(var(--color-border)/0.4)] bg-[rgb(var(--color-surface-2))] text-[rgb(var(--color-text-muted))] hover:border-[rgb(var(--color-border))]'
              }`}
            id="role-collaborateur-btn"
          >
            <Users size={24} />
            <span className="text-sm font-semibold">Collaborateur</span>
            <span className="text-[10px] opacity-70 text-center">Suivre et mettre à jour les tâches</span>
          </button>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Nom et Prénom */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Prénom</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]" />
              <input
                type="text"
                placeholder="Marie"
                className={`input pl-9 ${errors.prenom ? 'input-error' : ''}`}
                {...register('prenom', { required: 'Prénom requis', minLength: { value: 2, message: 'Min. 2 caractères' } })}
              />
            </div>
            {errors.prenom && <p className="error-text">{errors.prenom.message}</p>}
          </div>
          <div>
            <label className="label">Nom</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]" />
              <input
                type="text"
                placeholder="Dupont"
                className={`input pl-9 ${errors.nom ? 'input-error' : ''}`}
                {...register('nom', { required: 'Nom requis', minLength: { value: 2, message: 'Min. 2 caractères' } })}
              />
            </div>
            {errors.nom && <p className="error-text">{errors.nom.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="label">Email professionnel</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]" />
            <input
              type="email"
              placeholder="marie@entreprise.com"
              className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
              {...register('email', {
                required: 'Email requis',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
              })}
            />
          </div>
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        {/* Mot de passe */}
        <div>
          <label className="label">Mot de passe</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 caractères"
              className={`input pl-9 pr-10 ${errors.motDePasse ? 'input-error' : ''}`}
              {...register('motDePasse', {
                required: 'Mot de passe requis',
                minLength: { value: 8, message: 'Min. 8 caractères' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Doit contenir maj., min. et chiffre',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))] hover:text-white"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.motDePasse && <p className="error-text">{errors.motDePasse.message}</p>}
        </div>

        {/* Confirmation */}
        <div>
          <label className="label">Confirmer le mot de passe</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Répéter le mot de passe"
              className={`input pl-9 ${errors.confirmPassword ? 'input-error' : ''}`}
              {...register('confirmPassword', {
                required: 'Confirmation requise',
                validate: (value) => value === motDePasse || 'Les mots de passe ne correspondent pas',
              })}
            />
          </div>
          {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
        </div>

        {/* Bouton */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full mt-2"
          id="register-submit-btn"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Création...
            </span>
          ) : (
            <>
              <UserPlus size={18} />
              Créer mon compte
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[rgb(var(--color-text-muted))] mt-6">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
          Se connecter
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
