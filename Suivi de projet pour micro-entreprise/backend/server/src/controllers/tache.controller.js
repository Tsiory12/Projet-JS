/**
 * controllers/tache.controller.js - Contrôleur de gestion des tâches
 * CRUD complet avec gestion des statuts et assignations
 * Architecture MVC côté serveur
 */

import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Récupération des tâches
 * - Responsable: toutes les tâches de ses projets
 * - Collaborateur: ses tâches assignées uniquement
 * @route GET /api/taches
 * @access Privé
 */
export const getTaches = async (req, res, next) => {
  try {
    const { statut, priorite, projetId, search, page = 1, limit = 20 } = req.query;
    const MAX_LIMIT = 100;
    const safeLimit = Math.min(parseInt(limit) || 20, MAX_LIMIT);
    const skip = (parseInt(page) - 1) * safeLimit;
    const now = new Date();

    // Construction des filtres
    const where = {};

    if (req.user.role === 'RESPONSABLE') {
      where.projet = { responsableId: req.user.id };
    } else {
      where.collaborateurId = req.user.id;
    }

    if (statut) where.statut = statut;
    if (priorite) where.priorite = priorite;
    if (projetId) where.projetId = parseInt(projetId);
    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, taches] = await Promise.all([
      prisma.tache.count({ where }),
      prisma.tache.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: [
          { priorite: 'desc' },
          { dateLimite: 'asc' },
        ],
        include: {
          projet: {
            select: { id: true, titre: true, statut: true },
          },
          collaborateur: {
            select: { id: true, nom: true, prenom: true, email: true },
          },
        },
      }),
    ]);

    // Ajout du flag "en retard" pour chaque tâche
    const tachesWithFlags = taches.map((t) => ({
      ...t,
      enRetard: t.statut !== 'TERMINEE' && new Date(t.dateLimite) < now,
    }));

    res.status(200).json({
      success: true,
      data: tachesWithFlags,
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
 * Récupération d'une tâche par son ID
 * @route GET /api/taches/:id
 * @access Privé
 */
export const getTacheById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tache = await prisma.tache.findUnique({
      where: { id: parseInt(id) },
      include: {
        projet: {
          include: {
            responsable: {
              select: { id: true, nom: true, prenom: true, email: true },
            },
          },
        },
        collaborateur: {
          select: { id: true, nom: true, prenom: true, email: true },
        },
      },
    });

    if (!tache) {
      throw new ApiError('Tâche non trouvée.', 404);
    }

    // Vérification des droits
    if (req.user.role === 'COLLABORATEUR' && tache.collaborateurId !== req.user.id) {
      throw new ApiError('Accès refusé à cette tâche.', 403);
    }

    const now = new Date();
    res.status(200).json({
      success: true,
      data: {
        ...tache,
        enRetard: tache.statut !== 'TERMINEE' && new Date(tache.dateLimite) < now,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Création d'une nouvelle tâche
 * @route POST /api/taches
 * @access Privé (Responsable uniquement)
 */
export const createTache = async (req, res, next) => {
  try {
    const {
      titre,
      description,
      priorite,
      statut,
      dateLimite,
      projetId,
      collaborateurId,
    } = req.body;

    // Vérification que le projet appartient au responsable
    const projet = await prisma.projet.findUnique({
      where: { id: parseInt(projetId) },
    });

    if (!projet) {
      throw new ApiError('Projet non trouvé.', 404);
    }

    if (projet.responsableId !== req.user.id) {
      throw new ApiError('Vous n\'êtes pas autorisé à créer des tâches dans ce projet.', 403);
    }

    // Vérification que le collaborateur existe (si assigné)
    if (collaborateurId) {
      const collaborateur = await prisma.utilisateur.findUnique({
        where: { id: parseInt(collaborateurId) },
      });
      if (!collaborateur) {
        throw new ApiError('Collaborateur non trouvé.', 404);
      }
    }

    // Validation de la date limite
    const limite = new Date(dateLimite);
    if (isNaN(limite.getTime())) {
      throw new ApiError('Date limite invalide.', 400);
    }

    const tache = await prisma.tache.create({
      data: {
        titre: titre.trim(),
        description: description?.trim(),
        priorite: priorite || 'MOYENNE',
        statut: statut || 'A_FAIRE',
        dateLimite: limite,
        projetId: parseInt(projetId),
        collaborateurId: collaborateurId ? parseInt(collaborateurId) : null,
      },
      include: {
        projet: {
          select: { id: true, titre: true },
        },
        collaborateur: {
          select: { id: true, nom: true, prenom: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tâche créée avec succès.',
      data: tache,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mise à jour complète d'une tâche
 * @route PUT /api/taches/:id
 * @access Privé (Responsable - propriétaire du projet)
 */
export const updateTache = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      titre,
      description,
      priorite,
      statut,
      dateLimite,
      collaborateurId,
    } = req.body;

    // Récupération de la tâche avec son projet
    const tache = await prisma.tache.findUnique({
      where: { id: parseInt(id) },
      include: { projet: true },
    });

    if (!tache) {
      throw new ApiError('Tâche non trouvée.', 404);
    }

    // Vérification droits responsable
    if (req.user.role === 'RESPONSABLE' && tache.projet.responsableId !== req.user.id) {
      throw new ApiError('Vous n\'êtes pas autorisé à modifier cette tâche.', 403);
    }

    // Les collaborateurs ne peuvent modifier que certains champs
    if (req.user.role === 'COLLABORATEUR') {
      if (tache.collaborateurId !== req.user.id) {
        throw new ApiError('Accès refusé à cette tâche.', 403);
      }
    }

    const updatedTache = await prisma.tache.update({
      where: { id: parseInt(id) },
      data: {
        ...(titre && { titre: titre.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(priorite && req.user.role === 'RESPONSABLE' && { priorite }),
        ...(statut && { statut }),
        ...(dateLimite && { dateLimite: new Date(dateLimite) }),
        ...(collaborateurId !== undefined && req.user.role === 'RESPONSABLE' && {
          collaborateurId: collaborateurId ? parseInt(collaborateurId) : null,
        }),
      },
      include: {
        projet: {
          select: { id: true, titre: true },
        },
        collaborateur: {
          select: { id: true, nom: true, prenom: true, email: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Tâche mise à jour avec succès.',
      data: updatedTache,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suppression d'une tâche
 * @route DELETE /api/taches/:id
 * @access Privé (Responsable - propriétaire du projet)
 */
export const deleteTache = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tache = await prisma.tache.findUnique({
      where: { id: parseInt(id) },
      include: { projet: true },
    });

    if (!tache) {
      throw new ApiError('Tâche non trouvée.', 404);
    }

    if (tache.projet.responsableId !== req.user.id) {
      throw new ApiError('Vous n\'êtes pas autorisé à supprimer cette tâche.', 403);
    }

    await prisma.tache.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Tâche supprimée avec succès.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mise à jour du statut d'une tâche uniquement
 * @route PATCH /api/taches/:id/status
 * @access Privé (Responsable et Collaborateur assigné)
 */
export const updateTacheStatut = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const validStatuts = ['A_FAIRE', 'EN_COURS', 'TERMINEE'];
    if (!validStatuts.includes(statut)) {
      throw new ApiError(`Statut invalide. Valeurs acceptées: ${validStatuts.join(', ')}`, 400);
    }

    const tache = await prisma.tache.findUnique({
      where: { id: parseInt(id) },
      include: { projet: true },
    });

    if (!tache) {
      throw new ApiError('Tâche non trouvée.', 404);
    }

    // Vérification droits
    if (req.user.role === 'COLLABORATEUR' && tache.collaborateurId !== req.user.id) {
      throw new ApiError('Vous n\'êtes pas assigné à cette tâche.', 403);
    }
    if (req.user.role === 'RESPONSABLE' && tache.projet.responsableId !== req.user.id) {
      throw new ApiError('Accès refusé.', 403);
    }

    const updatedTache = await prisma.tache.update({
      where: { id: parseInt(id) },
      data: { statut },
      include: {
        projet: { select: { id: true, titre: true } },
        collaborateur: {
          select: { id: true, nom: true, prenom: true, email: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: `Statut mis à jour: ${statut}`,
      data: updatedTache,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tableau de bord collaborateur
 * @route GET /api/taches/dashboard/stats
 * @access Privé (Collaborateur)
 */
export const getCollaborateurStats = async (req, res, next) => {
  try {
    const collaborateurId = req.user.id;
    const now = new Date();

    const [messTaches, parStatut, enRetard, prochaines] = await Promise.all([
      // Total mes tâches
      prisma.tache.count({ where: { collaborateurId } }),
      // Par statut
      prisma.tache.groupBy({
        by: ['statut'],
        where: { collaborateurId },
        _count: { statut: true },
      }),
      // En retard
      prisma.tache.count({
        where: {
          collaborateurId,
          statut: { not: 'TERMINEE' },
          dateLimite: { lt: now },
        },
      }),
      // Prochaines échéances (7 jours)
      prisma.tache.findMany({
        where: {
          collaborateurId,
          statut: { not: 'TERMINEE' },
          dateLimite: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          projet: { select: { id: true, titre: true } },
        },
        orderBy: { dateLimite: 'asc' },
        take: 5,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: messTaches,
        parStatut,
        enRetard,
        prochaines,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les commentaires d'une tâche
 * @route GET /api/taches/:id/commentaires
 * @access Privé
 */
export const getTacheCommentaires = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tache = await prisma.tache.findUnique({
      where: { id: parseInt(id) },
      include: { projet: true },
    });

    if (!tache) {
      throw new ApiError('Tâche non trouvée.', 404);
    }

    // Vérification des droits
    if (req.user.role === 'COLLABORATEUR' && tache.collaborateurId !== req.user.id) {
      throw new ApiError('Accès refusé à cette tâche.', 403);
    }
    if (req.user.role === 'RESPONSABLE' && tache.projet.responsableId !== req.user.id) {
      throw new ApiError('Accès refusé à cette tâche.', 403);
    }

    const commentaires = await prisma.commentaire.findMany({
      where: { tacheId: parseInt(id) },
      include: {
        auteur: {
          select: { id: true, nom: true, prenom: true, email: true, role: true },
        },
      },
      orderBy: { dateCreation: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: commentaires,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter un commentaire sur une tâche
 * @route POST /api/taches/:id/commentaires
 * @access Privé
 */
export const createTacheCommentaire = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { contenu } = req.body;

    if (!contenu || !contenu.trim()) {
      throw new ApiError('Le contenu du commentaire est requis.', 400);
    }

    const tache = await prisma.tache.findUnique({
      where: { id: parseInt(id) },
      include: { projet: true },
    });

    if (!tache) {
      throw new ApiError('Tâche non trouvée.', 404);
    }

    // Vérification des droits
    if (req.user.role === 'COLLABORATEUR' && tache.collaborateurId !== req.user.id) {
      throw new ApiError('Accès refusé à cette tâche.', 403);
    }
    if (req.user.role === 'RESPONSABLE' && tache.projet.responsableId !== req.user.id) {
      throw new ApiError('Accès refusé à cette tâche.', 403);
    }

    const commentaire = await prisma.commentaire.create({
      data: {
        contenu: contenu.trim(),
        tacheId: parseInt(id),
        auteurId: req.user.id,
      },
      include: {
        auteur: {
          select: { id: true, nom: true, prenom: true, email: true, role: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Commentaire ajouté avec succès.',
      data: commentaire,
    });
  } catch (error) {
    next(error);
  }
};
