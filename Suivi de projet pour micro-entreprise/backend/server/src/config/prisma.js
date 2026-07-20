/**
 * config/prisma.js - Configuration et instance Prisma Client v7
 * Singleton pour la connexion à la base de données
 *
 * Prisma v7 : la DATABASE_URL est passée au constructeur PrismaClient
 * et non plus dans le schéma .prisma
 */

import { PrismaClient } from '@prisma/client';

// Options de configuration Prisma
const prismaOptions = {
  // En Prisma v7, l'URL de connexion est passée ici
  datasourceUrl: process.env.DATABASE_URL,
  log: process.env.NODE_ENV === 'development'
    ? ['warn', 'error']
    : ['error'],
};

// Singleton pattern pour éviter les connexions multiples en développement
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
