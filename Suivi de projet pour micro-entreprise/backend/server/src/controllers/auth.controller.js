/**
 * controllers/auth.controller.js - Contrôleur d'authentification
 * Gestion de l'inscription, connexion et profil utilisateur
 * Architecture MVC côté serveur
 */

import { prisma } from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.utils.js';
import { formatAuthResponse } from '../utils/jwt.utils.js';
import { ApiError } from '../middleware/error.middleware.js';

// ============================================================
// SERVICE D'AUTHENTIFICATION (couche service intégrée)
// ============================================================

/**
 * Inscription d'un nouvel utilisateur
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    const { nom, prenom, email, motDePasse, role } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ApiError('Un compte avec cet email existe déjà.', 409);
    }

    // Validation du rôle (sécurité)
    const allowedRoles = ['RESPONSABLE', 'COLLABORATEUR'];
    const userRole = allowedRoles.includes(role) ? role : 'COLLABORATEUR';

    // Hashage du mot de passe
    const hashedPassword = await hashPassword(motDePasse);

    // Création de l'utilisateur
    const newUser = await prisma.utilisateur.create({
      data: {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.toLowerCase().trim(),
        motDePasse: hashedPassword,
        role: userRole,
      },
    });

    // Génération du token et réponse
    const authData = formatAuthResponse(newUser);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès.',
      data: authData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connexion d'un utilisateur existant
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, motDePasse } = req.body;

    // Recherche de l'utilisateur
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!utilisateur) {
      throw new ApiError('Email ou mot de passe incorrect.', 401);
    }

    // Vérification du mot de passe
    const isPasswordValid = await comparePassword(motDePasse, utilisateur.motDePasse);

    if (!isPasswordValid) {
      throw new ApiError('Email ou mot de passe incorrect.', 401);
    }

    // Génération du token et réponse
    const authData = formatAuthResponse(utilisateur);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      data: authData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupération du profil de l'utilisateur connecté
 * @route GET /api/auth/profile
 * @access Privé (authentifié)
 */
export const getProfile = async (req, res, next) => {
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        dateCreation: true,
        updatedAt: true,
        _count: {
          select: {
            projetsGeres: true,
            tachesAssignees: true,
          },
        },
      },
    });

    if (!utilisateur) {
      throw new ApiError('Utilisateur non trouvé.', 404);
    }

    res.status(200).json({
      success: true,
      data: utilisateur,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mise à jour du profil de l'utilisateur connecté
 * @route PUT /api/auth/profile
 * @access Privé (authentifié)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { nom, prenom, email, ancienMotDePasse, nouveauMotDePasse } = req.body;

    // Récupération de l'utilisateur actuel
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: req.user.id },
    });

    if (!utilisateur) {
      throw new ApiError('Utilisateur non trouvé.', 404);
    }

    // Préparation des données à mettre à jour
    const updateData = {};

    if (nom) updateData.nom = nom.trim();
    if (prenom) updateData.prenom = prenom.trim();
    if (email) {
      // Vérifier unicité email
      const emailExists = await prisma.utilisateur.findFirst({
        where: { email: email.toLowerCase().trim(), NOT: { id: req.user.id } },
      });
      if (emailExists) {
        throw new ApiError('Cet email est déjà utilisé.', 409);
      }
      updateData.email = email.toLowerCase().trim();
    }

    // Changement de mot de passe
    if (ancienMotDePasse && nouveauMotDePasse) {
      const isValid = await comparePassword(ancienMotDePasse, utilisateur.motDePasse);
      if (!isValid) {
        throw new ApiError('Ancien mot de passe incorrect.', 400);
      }
      updateData.motDePasse = await hashPassword(nouveauMotDePasse);
    }

    const updatedUser = await prisma.utilisateur.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        dateCreation: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
