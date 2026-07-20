/**
 * utils/password.utils.js - Utilitaires de gestion des mots de passe
 * Hashage et comparaison avec bcrypt
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

/**
 * Hashe un mot de passe en clair
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<string>} Mot de passe hashé
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compare un mot de passe en clair avec son hash
 * @param {string} password - Mot de passe en clair
 * @param {string} hashedPassword - Hash stocké
 * @returns {Promise<boolean>} true si correspondance
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
