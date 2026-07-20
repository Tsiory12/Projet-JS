/**
 * utils/seed.js - Script de données initiales (seed)
 * Crée des données de démonstration pour tester l'application
 * 
 * Utilisation: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...\n');

  // Nettoyage des données existantes
  await prisma.tache.deleteMany();
  await prisma.projet.deleteMany();
  await prisma.utilisateur.deleteMany();

  console.log('🗑️  Données existantes supprimées');

  // Hashage du mot de passe commun
  const password = await bcrypt.hash('Password123', 12);

  // ============================================================
  // Création des utilisateurs
  // ============================================================
  const responsable = await prisma.utilisateur.create({
    data: {
      nom: 'Dupont',
      prenom: 'Marie',
      email: 'marie.dupont@entreprise.com',
      motDePasse: password,
      role: 'RESPONSABLE',
    },
  });

  const collaborateur1 = await prisma.utilisateur.create({
    data: {
      nom: 'Martin',
      prenom: 'Lucas',
      email: 'lucas.martin@entreprise.com',
      motDePasse: password,
      role: 'COLLABORATEUR',
    },
  });

  const collaborateur2 = await prisma.utilisateur.create({
    data: {
      nom: 'Bernard',
      prenom: 'Sophie',
      email: 'sophie.bernard@entreprise.com',
      motDePasse: password,
      role: 'COLLABORATEUR',
    },
  });

  const collaborateur3 = await prisma.utilisateur.create({
    data: {
      nom: 'Petit',
      prenom: 'Julien',
      email: 'julien.petit@entreprise.com',
      motDePasse: password,
      role: 'COLLABORATEUR',
    },
  });

  console.log('👥 Utilisateurs créés:', { responsable: responsable.email, collaborateurs: 3 });

  // ============================================================
  // Création des projets
  // ============================================================
  const projet1 = await prisma.projet.create({
    data: {
      titre: 'Refonte Site Web E-commerce',
      description: 'Modernisation complète de la boutique en ligne avec nouveau design, optimisation des performances et intégration d\'un système de paiement avancé.',
      dateDebut: new Date('2026-01-15'),
      dateLimite: new Date('2026-09-30'),
      statut: 'EN_COURS',
      responsableId: responsable.id,
    },
  });

  const projet2 = await prisma.projet.create({
    data: {
      titre: 'Application Mobile CRM',
      description: 'Développement d\'une application mobile de gestion de la relation client pour les commerciaux terrain.',
      dateDebut: new Date('2026-03-01'),
      dateLimite: new Date('2026-12-31'),
      statut: 'EN_COURS',
      responsableId: responsable.id,
    },
  });

  const projet3 = await prisma.projet.create({
    data: {
      titre: 'Migration Infrastructure Cloud',
      description: 'Migration de l\'infrastructure on-premise vers AWS avec mise en place de la containerisation Docker et Kubernetes.',
      dateDebut: new Date('2025-10-01'),
      dateLimite: new Date('2026-04-30'),
      statut: 'TERMINE',
      responsableId: responsable.id,
    },
  });

  console.log('📁 Projets créés: 3');

  // ============================================================
  // Création des tâches pour Projet 1
  // ============================================================
  const tachesProjet1 = await Promise.all([
    prisma.tache.create({
      data: {
        titre: 'Analyse des besoins et wireframes',
        description: 'Rencontrer les parties prenantes, documenter les besoins et créer les maquettes fil de fer.',
        priorite: 'HAUTE',
        statut: 'TERMINEE',
        dateLimite: new Date('2026-02-15'),
        projetId: projet1.id,
        collaborateurId: collaborateur1.id,
      },
    }),
    prisma.tache.create({
      data: {
        titre: 'Design UI/UX - Charte graphique',
        description: 'Création de la charte graphique, design system et prototypes Figma haute fidélité.',
        priorite: 'HAUTE',
        statut: 'TERMINEE',
        dateLimite: new Date('2026-03-15'),
        projetId: projet1.id,
        collaborateurId: collaborateur2.id,
      },
    }),
    prisma.tache.create({
      data: {
        titre: 'Développement Frontend React',
        description: 'Implémentation de toutes les pages et composants React selon les maquettes validées.',
        priorite: 'HAUTE',
        statut: 'EN_COURS',
        dateLimite: new Date('2026-07-31'),
        projetId: projet1.id,
        collaborateurId: collaborateur1.id,
      },
    }),
    prisma.tache.create({
      data: {
        titre: 'Intégration API Paiement Stripe',
        description: 'Intégration complète de Stripe pour les paiements en ligne, abonnements et remboursements.',
        priorite: 'HAUTE',
        statut: 'EN_COURS',
        dateLimite: new Date('2026-08-15'),
        projetId: projet1.id,
        collaborateurId: collaborateur3.id,
      },
    }),
    prisma.tache.create({
      data: {
        titre: 'Tests et débogage',
        description: 'Tests unitaires, tests d\'intégration et tests utilisateurs. Correction des bugs identifiés.',
        priorite: 'MOYENNE',
        statut: 'A_FAIRE',
        dateLimite: new Date('2026-09-15'),
        projetId: projet1.id,
        collaborateurId: collaborateur2.id,
      },
    }),
    prisma.tache.create({
      data: {
        titre: 'Déploiement et mise en production',
        description: 'Configuration du serveur de production, déploiement CI/CD et monitoring.',
        priorite: 'MOYENNE',
        statut: 'A_FAIRE',
        dateLimite: new Date('2026-09-28'),
        projetId: projet1.id,
        collaborateurId: null,
      },
    }),
  ]);

  // ============================================================
  // Création des tâches pour Projet 2
  // ============================================================
  const tachesProjet2 = await Promise.all([
    prisma.tache.create({
      data: {
        titre: 'Architecture technique application',
        description: 'Choix des technologies, architecture microservices, définition de l\'API REST.',
        priorite: 'HAUTE',
        statut: 'TERMINEE',
        dateLimite: new Date('2026-03-31'),
        projetId: projet2.id,
        collaborateurId: collaborateur3.id,
      },
    }),
    prisma.tache.create({
      data: {
        titre: 'Développement API Backend Node.js',
        description: 'Développement des endpoints REST pour la gestion des contacts, opportunités et activités CRM.',
        priorite: 'HAUTE',
        statut: 'EN_COURS',
        dateLimite: new Date('2026-08-30'),
        projetId: projet2.id,
        collaborateurId: collaborateur3.id,
      },
    }),
    prisma.tache.create({
      data: {
        titre: 'Interface mobile React Native',
        description: 'Développement de l\'application mobile cross-platform iOS et Android.',
        priorite: 'HAUTE',
        statut: 'EN_COURS',
        dateLimite: new Date('2026-10-31'),
        projetId: projet2.id,
        collaborateurId: collaborateur1.id,
      },
    }),
    prisma.tache.create({
      data: {
        titre: 'Synchronisation données offline',
        description: 'Implémentation du mode hors-ligne avec synchronisation automatique à la reconnexion.',
        priorite: 'MOYENNE',
        statut: 'A_FAIRE',
        dateLimite: new Date('2026-11-30'),
        projetId: projet2.id,
        collaborateurId: collaborateur2.id,
      },
    }),
    prisma.tache.create({
      data: {
        titre: 'Documentation technique et formation',
        description: 'Rédaction de la documentation technique et des guides utilisateurs.',
        priorite: 'FAIBLE',
        statut: 'A_FAIRE',
        dateLimite: new Date('2026-12-15'),
        projetId: projet2.id,
        collaborateurId: null,
      },
    }),
  ]);

  // Tâches pour Projet 3 (terminé)
  const tachesProjet3 = await Promise.all([
    prisma.tache.create({
      data: {
        titre: 'Audit infrastructure existante',
        description: 'Inventaire complet de l\'infrastructure, analyse des dépendances et plan de migration.',
        priorite: 'HAUTE',
        statut: 'TERMINEE',
        dateLimite: new Date('2025-11-30'),
        projetId: projet3.id,
        collaborateurId: collaborateur3.id,
      },
    }),
    prisma.tache.create({
      data: {
        titre: 'Containerisation Docker',
        description: 'Création des Dockerfile et docker-compose pour tous les services applicatifs.',
        priorite: 'HAUTE',
        statut: 'TERMINEE',
        dateLimite: new Date('2026-01-31'),
        projetId: projet3.id,
        collaborateurId: collaborateur1.id,
      },
    }),
    prisma.tache.create({
      data: {
        titre: 'Configuration Kubernetes',
        description: 'Mise en place du cluster K8s, déploiements, services et ingress.',
        priorite: 'HAUTE',
        statut: 'TERMINEE',
        dateLimite: new Date('2026-03-31'),
        projetId: projet3.id,
        collaborateurId: collaborateur3.id,
      },
    }),
    prisma.tache.create({
      data: {
        titre: 'Migration données et tests de charge',
        description: 'Migration des données de production et tests de performance sous charge.',
        priorite: 'HAUTE',
        statut: 'TERMINEE',
        dateLimite: new Date('2026-04-20'),
        projetId: projet3.id,
        collaborateurId: collaborateur2.id,
      },
    }),
  ]);

  console.log(`✅ Tâches créées: ${tachesProjet1.length + tachesProjet2.length + tachesProjet3.length}`);

  console.log('\n🎉 Seed terminé avec succès !\n');
  console.log('📧 Comptes de connexion (mot de passe: Password123):');
  console.log('   Responsable: marie.dupont@entreprise.com');
  console.log('   Collaborateur 1: lucas.martin@entreprise.com');
  console.log('   Collaborateur 2: sophie.bernard@entreprise.com');
  console.log('   Collaborateur 3: julien.petit@entreprise.com\n');
}

main()
  .catch((error) => {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
