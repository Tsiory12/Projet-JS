/**
 * pages/ProfilPage.jsx - Page de profil utilisateur
 * Affichage et modification des informations personnelles
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/auth.service.js';
import { useNotification } from '../context/NotificationContext.jsx';
import {
  User, Mail, Shield, Calendar, Save,
  Eye, EyeOff, Lock, Edit2, CheckCircle, X,
} from 'lucide-react';
import { formatDateTime } from '../utils/helpers.js';

const ProfilPage = () => {
  const { user, updateUser, isResponsable } = useAuth();
  const { notify } = useNotification();
  const [editMode, setEditMode] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  const [showAncienPass, setShowAncienPass] = useState(false);
  const [showNouveauPass, setShowNouveauPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Formulaire info perso
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { nom: user?.nom, prenom: user?.prenom, email: user?.email } });

  // Formulaire mot de passe
  const {
    register: regPass, handleSubmit: submitPass, reset: resetPass,
    watch: watchPass, formState: { errors: errPass, isSubmitting: isPassSub },
  } = useForm();

  const onSaveProfile = async (data) => {
    setIsSaving(true);
    try {
      const response = await authService.updateProfile(data);
      updateUser(response.data.data);
      notify('success', '✅ Profil mis à jour avec succès !');
      setEditMode(false);
    } catch (err) {
      notify('error', err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    try {
      await authService.updateProfile({
        ancienMotDePasse: data.ancienMotDePasse,
        nouveauMotDePasse: data.nouveauMotDePasse,
      });
      notify('success', '🔒 Mot de passe modifié avec succès !');
      resetPass();
      setShowPassForm(false);
    } catch (err) {
      notify('error', err.message || 'Erreur lors du changement de mot de passe');
    }
  };

  const nouveauPass = watchPass('nouveauMotDePasse');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-black text-white">Mon profil</h1>
        <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Carte avatar + rôle */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar grand */}
          <div className="avatar avatar-xl flex-shrink-0 shadow-lg shadow-amber-500/20">
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-black text-white">
              {user?.prenom} {user?.nom}
            </h2>
            <p className="text-[rgb(var(--color-text-muted))] mt-1">{user?.email}</p>

            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className={`badge ${isResponsable ? 'badge-primary' : 'badge-success'} px-3 py-1`}>
                {isResponsable ? 'Responsable' : 'Collaborateur'}
              </span>
              <span className="badge badge-neutral px-3 py-1 flex items-center gap-1">
                <Calendar size={12} />
                Depuis {formatDateTime(user?.dateCreation)}
              </span>
            </div>
          </div>

          <button
            onClick={() => { setEditMode(!editMode); reset({ nom: user?.nom, prenom: user?.prenom, email: user?.email }); }}
            className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            id="edit-profile-btn"
          >
            {editMode ? <><X size={14} /> Annuler</> : <><Edit2 size={14} /> Modifier</>}
          </button>
        </div>
      </div>

      {/* Formulaire de modification */}
      {editMode && (
        <div className="card animate-slideUp">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Edit2 size={16} className="text-amber-400" />
            Modifier mes informations
          </h3>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prénom</label>
                <input type="text" className={`input ${errors.prenom ? 'input-error' : ''}`}
                  {...register('prenom', { required: 'Prénom requis', minLength: { value: 2, message: 'Min. 2 car.' } })} />
                {errors.prenom && <p className="error-text">{errors.prenom.message}</p>}
              </div>
              <div>
                <label className="label">Nom</label>
                <input type="text" className={`input ${errors.nom ? 'input-error' : ''}`}
                  {...register('nom', { required: 'Nom requis', minLength: { value: 2, message: 'Min. 2 car.' } })} />
                {errors.nom && <p className="error-text">{errors.nom.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]" />
                <input type="email" className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                  {...register('email', { required: 'Email requis', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' } })} />
              </div>
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditMode(false)} className="btn btn-secondary">Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={isSaving} id="save-profile-btn">
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sauvegarde...
                  </span>
                ) : <><Save size={15} /> Sauvegarder</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Informations affichées */}
      {!editMode && (
        <div className="card">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <User size={16} className="text-amber-400" />
            Informations personnelles
          </h3>
          <div className="space-y-4">
            {[
              { icon: User, label: 'Prénom', value: user?.prenom },
              { icon: User, label: 'Nom', value: user?.nom },
              { icon: Mail, label: 'Email', value: user?.email },
              { icon: Shield, label: 'Rôle', value: isResponsable ? 'Responsable' : 'Collaborateur' },
              { icon: Calendar, label: 'Membre depuis', value: formatDateTime(user?.dateCreation) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-2 border-b border-[rgb(var(--color-border)/0.2)] last:border-0">
                <div className="w-8 h-8 rounded-lg bg-[rgb(var(--color-surface-2))] flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-[rgb(var(--color-text-muted))]" />
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--color-text-dim))] uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-medium text-white mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sécurité - Changement de mot de passe */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock size={16} className="text-amber-400" />
            Sécurité
          </h3>
          <button
            onClick={() => { setShowPassForm(!showPassForm); resetPass(); }}
            className="btn btn-secondary btn-sm"
            id="toggle-password-form-btn"
          >
            {showPassForm ? 'Annuler' : 'Changer le mot de passe'}
          </button>
        </div>

        {!showPassForm && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(var(--color-surface-2))]">
            <CheckCircle size={18} className="text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-white">Mot de passe sécurisé</p>
              <p className="text-xs text-[rgb(var(--color-text-dim))]">Votre compte est protégé avec bcrypt</p>
            </div>
          </div>
        )}

        {showPassForm && (
          <form onSubmit={submitPass(onChangePassword)} className="space-y-4 animate-slideUp">
            <div>
              <label className="label">Ancien mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]" />
                <input
                  type={showAncienPass ? 'text' : 'password'}
                  className={`input pl-9 pr-10 ${errPass.ancienMotDePasse ? 'input-error' : ''}`}
                  {...regPass('ancienMotDePasse', { required: 'Ancien mot de passe requis' })}
                />
                <button type="button" onClick={() => setShowAncienPass(!showAncienPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))] hover:text-white">
                  {showAncienPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errPass.ancienMotDePasse && <p className="error-text">{errPass.ancienMotDePasse.message}</p>}
            </div>
            <div>
              <label className="label">Nouveau mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]" />
                <input
                  type={showNouveauPass ? 'text' : 'password'}
                  placeholder="Min. 8 caractères"
                  className={`input pl-9 pr-10 ${errPass.nouveauMotDePasse ? 'input-error' : ''}`}
                  {...regPass('nouveauMotDePasse', {
                    required: 'Nouveau mot de passe requis',
                    minLength: { value: 8, message: 'Min. 8 caractères' },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Doit contenir maj., min. et chiffre' },
                  })}
                />
                <button type="button" onClick={() => setShowNouveauPass(!showNouveauPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))] hover:text-white">
                  {showNouveauPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errPass.nouveauMotDePasse && <p className="error-text">{errPass.nouveauMotDePasse.message}</p>}
            </div>
            <div>
              <label className="label">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-dim))]" />
                <input
                  type="password"
                  className={`input pl-9 ${errPass.confirmPass ? 'input-error' : ''}`}
                  {...regPass('confirmPass', {
                    required: 'Confirmation requise',
                    validate: (v) => v === nouveauPass || 'Les mots de passe ne correspondent pas',
                  })}
                />
              </div>
              {errPass.confirmPass && <p className="error-text">{errPass.confirmPass.message}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowPassForm(false); resetPass(); }} className="btn btn-secondary">Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={isPassSub} id="save-password-btn">
                {isPassSub ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Modification...
                  </span>
                ) : <><Lock size={14} /> Modifier</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilPage;
