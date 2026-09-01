/**
 * controllers/projet.controller.js - Contrôleur de gestion des projets
 * CRUD complet sur les projets avec statistiques
 * Architecture MVC côté serveur
 */

import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Récupération de tous les projets
 * - Responsable: voit tous ses projets
 * - Collaborateur: voit les projets contenant ses tâches
 * @route GET /api/projets
 * @access Privé
 */
export const getProjets = async (req, res, next) => {
  try {
    const { statut, search, page = 1, limit = 20 } = req.query;
    const MAX_LIMIT = 100;
    const safeLimit = Math.min(parseInt(limit) || 20, MAX_LIMIT);
    const skip = (parseInt(page) - 1) * safeLimit;

    // Construction des filtres dynamiques
    const where = {};

    if (req.user.role === 'RESPONSABLE') {
      where.responsableId = req.user.id;
    } else {
      // Collaborateur : projets avec ses tâches assignées
      where.taches = {
        some: { collaborateurId: req.user.id },
      };
    }

    if (statut) where.statut = statut;
    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Comptage total pour la pagination
    const total = await prisma.projet.count({ where });

    // Récupération des projets avec leurs statistiques
    const projets = await prisma.projet.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { dateCreation: 'desc' },
      include: {
        responsable: {
          select: { id: true, nom: true, prenom: true, email: true },
        },
        _count: {
          select: { taches: true },
        },
        taches: {
          select: { statut: true },
        },
      },
    });

    // Calcul des statistiques par projet
    const projetsWithStats = projets.map((projet) => {
      const totalTaches = projet.taches.length;
      const tachesTerminees = projet.taches.filter((t) => t.statut === 'TERMINEE').length;
      const tachesEnCours = projet.taches.filter((t) => t.statut === 'EN_COURS').length;
      const progression = totalTaches > 0
        ? Math.round((tachesTerminees / totalTaches) * 100)
        : 0;

      return {
        ...projet,
        stats: {
          totalTaches,
          tachesTerminees,
          tachesEnCours,
          tachesAFaire: totalTaches - tachesTerminees - tachesEnCours,
          progression,
        },
        taches: undefined, // On supprime la liste brute des tâches
      };
    });

    res.status(200).json({
      success: true,
      data: projetsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupération d'un projet par son ID
 * @route GET /api/projets/:id
 * @access Privé
 */
export const getProjetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const projet = await prisma.projet.findUnique({
      where: { id: parseInt(id) },
      include: {
        responsable: {
          select: { id: true, nom: true, prenom: true, email: true },
        },
        taches: {
          include: {
            collaborateur: {
              select: { id: true, nom: true, prenom: true, email: true },
            },
          },
          orderBy: [
            { priorite: 'desc' },
            { dateLimite: 'asc' },
          ],
        },
      },
    });

    if (!projet) {
      throw new ApiError('Projet non trouvé.', 404);
    }

    // Vérification des droits d'accès
    if (req.user.role === 'COLLABORATEUR') {
      const hasAccess = projet.taches.some(
        (t) => t.collaborateurId === req.user.id
      );
      if (!hasAccess) {
        throw new ApiError('Accès refusé à ce projet.', 403);
      }
    }

    // Statistiques du projet
    const totalTaches = projet.taches.length;
    const tachesTerminees = projet.taches.filter((t) => t.statut === 'TERMINEE').length;
    const tachesEnCours = projet.taches.filter((t) => t.statut === 'EN_COURS').length;
    const tachesEnRetard = projet.taches.filter(
      (t) => t.statut !== 'TERMINEE' && new Date(t.dateLimite) < new Date()
    ).length;
    const progression = totalTaches > 0
      ? Math.round((tachesTerminees / totalTaches) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ...projet,
        stats: {
          totalTaches,
          tachesTerminees,
          tachesEnCours,
          tachesAFaire: totalTaches - tachesTerminees - tachesEnCours,
          tachesEnRetard,
          progression,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Création d'un nouveau projet
 * @route POST /api/projets
 * @access Privé (Responsable uniquement)
 */
export const createProjet = async (req, res, next) => {
  try {
    const { titre, description, dateDebut, dateLimite, statut } = req.body;

    // Validation des dates
    const debut = new Date(dateDebut);
    const limite = new Date(dateLimite);

    if (limite <= debut) {
      throw new ApiError('La date limite doit être postérieure à la date de début.', 400);
    }

    const projet = await prisma.projet.create({
      data: {
        titre: titre.trim(),
        description: description?.trim(),
        dateDebut: debut,
        dateLimite: limite,
        statut: statut || 'EN_COURS',
        responsableId: req.user.id,
      },
      include: {
        responsable: {
          select: { id: true, nom: true, prenom: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès.',
      data: projet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mise à jour d'un projet
 * @route PUT /api/projets/:id
 * @access Privé (Responsable - propriétaire du projet)
 */
export const updateProjet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titre, description, dateDebut, dateLimite, statut } = req.body;

    // Vérification existence et propriété
    const projet = await prisma.projet.findUnique({
      where: { id: parseInt(id) },
    });

    if (!projet) {
      throw new ApiError('Projet non trouvé.', 404);
    }

    if (projet.responsableId !== req.user.id) {
      throw new ApiError('Vous n\'êtes pas autorisé à modifier ce projet.', 403);
    }

    // Validation des dates si fournies
    if (dateDebut && dateLimite) {
      if (new Date(dateLimite) <= new Date(dateDebut)) {
        throw new ApiError('La date limite doit être postérieure à la date de début.', 400);
      }
    }

    const updatedProjet = await prisma.projet.update({
      where: { id: parseInt(id) },
      data: {
        ...(titre && { titre: titre.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(dateDebut && { dateDebut: new Date(dateDebut) }),
        ...(dateLimite && { dateLimite: new Date(dateLimite) }),
        ...(statut && { statut }),
      },
      include: {
        responsable: {
          select: { id: true, nom: true, prenom: true, email: true },
        },
        _count: { select: { taches: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Projet mis à jour avec succès.',
      data: updatedProjet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suppression d'un projet (et ses tâches en cascade)
 * @route DELETE /api/projets/:id
 * @access Privé (Responsable - propriétaire du projet)
 */
export const deleteProjet = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Vérification existence et propriété
    const projet = await prisma.projet.findUnique({
      where: { id: parseInt(id) },
    });

    if (!projet) {
      throw new ApiError('Projet non trouvé.', 404);
    }

    if (projet.responsableId !== req.user.id) {
      throw new ApiError('Vous n\'êtes pas autorisé à supprimer ce projet.', 403);
    }

    await prisma.projet.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Projet supprimé avec succès.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Statistiques globales du tableau de bord Responsable
 * @route GET /api/projets/dashboard/stats
 * @access Privé (Responsable)
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const responsableId = req.user.id;
    const now = new Date();

    // Statistiques des projets
    const [totalProjets, projetStats] = await Promise.all([
      prisma.projet.count({ where: { responsableId } }),
      prisma.projet.groupBy({
        by: ['statut'],
        where: { responsableId },
        _count: { statut: true },
      }),
    ]);

    // Statistiques des tâches
    const [totalTaches, tacheStats, tachesEnRetard, tachesTerminees] = await Promise.all([
      prisma.tache.count({
        where: { projet: { responsableId } },
      }),
      prisma.tache.groupBy({
        by: ['statut'],
        where: { projet: { responsableId } },
        _count: { statut: true },
      }),
      prisma.tache.count({
        where: {
          projet: { responsableId },
          statut: { not: 'TERMINEE' },
          dateLimite: { lt: now },
        },
      }),
      prisma.tache.count({
        where: {
          projet: { responsableId },
          statut: 'TERMINEE',
        },
      }),
    ]);

    // Projets avec leur progression
    const projets = await prisma.projet.findMany({
      where: { responsableId },
      include: {
        taches: { select: { statut: true } },
      },
      orderBy: { dateCreation: 'desc' },
      take: 5,
    });

    const projetProgression = projets.map((p) => {
      const total = p.taches.length;
      const terminees = p.taches.filter((t) => t.statut === 'TERMINEE').length;
      return {
        id: p.id,
        titre: p.titre,
        statut: p.statut,
        dateLimite: p.dateLimite,
        progression: total > 0 ? Math.round((terminees / total) * 100) : 0,
        totalTaches: total,
        tachesTerminees: terminees,
      };
    });

    // Répartition des priorités
    const prioriteStats = await prisma.tache.groupBy({
      by: ['priorite'],
      where: { projet: { responsableId } },
      _count: { priorite: true },
    });

    res.status(200).json({
      success: true,
      data: {
        projets: {
          total: totalProjets,
          parStatut: projetStats,
        },
        taches: {
          total: totalTaches,
          parStatut: tacheStats,
          enRetard: tachesEnRetard,
          terminees: tachesTerminees,
          parPriorite: prioriteStats,
        },
        projetProgression,
      },
    });
  } catch (error) {
    next(error);
  }
};
