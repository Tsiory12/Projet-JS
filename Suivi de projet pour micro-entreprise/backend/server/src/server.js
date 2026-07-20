/**
 * server.js - Point d'entrée du serveur
 * Suivi de Projets pour Micro-Entreprise
 */

import { config } from 'dotenv';
config();

import app from './app.js';
import { prisma } from './config/prisma.js';

const PORT = process.env.PORT || 5000;

/**
 * Démarrage du serveur avec vérification de la connexion DB
 */
async function startServer() {
  try {
    // Test de connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connexion à PostgreSQL établie avec succès');

    // Démarrage du serveur HTTP
    app.listen(PORT, () => {
      console.log('\n🚀 Serveur démarré avec succès');
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`❤️  Santé: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Gestion de la fermeture propre du serveur
process.on('SIGTERM', async () => {
  console.log('\n🛑 Signal SIGTERM reçu. Arrêt gracieux...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Signal SIGINT reçu. Arrêt gracieux...');
  await prisma.$disconnect();
  process.exit(0);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

startServer();
