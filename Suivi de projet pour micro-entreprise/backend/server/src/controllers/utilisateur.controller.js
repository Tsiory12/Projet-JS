/**
 * controllers/utilisateur.controller.js - Contrôleur des utilisateurs
 * Gestion de la liste des utilisateurs (pour les assignations)
 */

import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Récupération de tous les collaborateurs
 * Utile pour la liste de sélection lors de l'assignation des tâches
 * @route GET /api/utilisateurs
 * @access Privé (Responsable)
 */
export const getUtilisateurs = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const utilisateurs = await prisma.utilisateur.findMany({
      where,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        dateCreation: true,
        _count: {
          select: {
            tachesAssignees: true,
          },
        },
      },
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
    });

    res.status(200).json({
      success: true,
      data: utilisateurs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupération d'un utilisateur par ID
 * @route GET /api/utilisateurs/:id
 * @access Privé (Responsable)
 */
export const getUtilisateurById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        dateCreation: true,
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
 * Liste des collaborateurs disponibles (pour l'assignation)
 * @route GET /api/utilisateurs/collaborateurs
 * @access Privé (Responsable)
 */
export const getCollaborateurs = async (req, res, next) => {
  try {
    const collaborateurs = await prisma.utilisateur.findMany({
      where: { role: 'COLLABORATEUR' },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        _count: {
          select: { tachesAssignees: true },
        },
      },
      orderBy: [{ nom: 'asc' }],
    });

    res.status(200).json({
      success: true,
      data: collaborateurs,
    });
  } catch (error) {
    next(error);
  }
};
