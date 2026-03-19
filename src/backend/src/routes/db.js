const express = require('express');
const router = express.Router();
const { Client } = require('pg');
const fs = require('fs');

/**
 * Lit une variable d'environnement ou un fichier secret Docker Swarm.
 * 
 * Docker Swarm monte les secrets comme des fichiers dans /run/secrets/.
 * Par convention, si POSTGRES_USER_FILE est défini, on lit le fichier pointé.
 * Sinon, on utilise la variable d'environnement directe (ex: Docker Compose).
 * 
 * Cela permet au code de fonctionner dans les deux environnements :
 * - Docker Compose → utilise process.env.POSTGRES_USER directement
 * - Docker Swarm   → lit le contenu de /run/secrets/postgres_user
 * 
 * @param {string} envVar - Nom de la variable (ex: 'POSTGRES_USER')
 * @returns {string|null} - La valeur du secret ou de la variable
 */
function readSecret(envVar) {
  // On cherche d'abord une variable _FILE (convention Docker Secrets)
  const fileVar = process.env[`${envVar}_FILE`];
  
  if (fileVar) {
    try {
      // On lit le fichier et on enlève le retour à la ligne final
      return fs.readFileSync(fileVar, 'utf8').trim();
    } catch (e) {
      // Si le fichier n'existe pas ou est illisible, on retourne null
      return null;
    }
  }
  
  // Pas de fichier secret → on utilise la variable d'environnement directe
  return process.env[envVar];
}

/**
 * GET /db
 * Teste la connexion PostgreSQL et retourne un statut.
 * Compatible Docker Compose (variables directes) et Docker Swarm (secrets fichiers).
 */
router.get('/', async (req, res) => {
  // Création du client PostgreSQL avec les credentials
  // readSecret() gère automatiquement les 2 cas (Compose et Swarm)
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: readSecret('POSTGRES_USER'),
    password: readSecret('POSTGRES_PASSWORD'),
    database: readSecret('POSTGRES_DB'),
  });

  try {
    // Connexion à la base
    await client.connect();

    // Requête simple pour vérifier que tout fonctionne
    await client.query('SELECT 1');

    return res.json({
      status: 'connected',
      database: readSecret('POSTGRES_DB'),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'connection failed',
    });

  } finally {
    // Fermeture propre de la connexion dans tous les cas
    try {
      await client.end();
    } catch (_) {
      // Ignore si la connexion était déjà fermée
    }
  }
});

module.exports = router;