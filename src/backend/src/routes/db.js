const express = require('express');
const router = express.Router();

const { Client } = require('pg');

/**
 * GET /db
 * Teste la connexion PostgreSQL et retourne un statut.
 */
router.get('/', async (req, res) => {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });

  try {
    // Connexion à la base
    await client.connect();

    // Requête simple pour vérifier que tout fonctionne
    await client.query('SELECT 1');

    return res.json({
      status: 'connected',
      database: process.env.POSTGRES_DB,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'connection failed',
    });

  } finally {
    // Fermeture propre de la connexion
    try {
      await client.end();
    } catch (_) {
      // Ignore si déjà fermé
    }
  }
});

module.exports = router;