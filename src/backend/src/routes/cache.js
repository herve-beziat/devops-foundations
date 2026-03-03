// src/backend/src/routes/cache.js

const express = require('express');
const { createClient } = require('redis');

const router = express.Router();

/**
 * GET /cache
 * Teste la connexion Redis et incrémente un compteur de visites.
 */
router.get('/', async (req, res) => {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || '6379';
  const key = process.env.REDIS_KEY || 'devops:visits';

  const client = createClient({
    url: `redis://${host}:${port}`,
  });

  try {
    await client.connect();

    // INCR crée la clé si elle n'existe pas
    const visits = await client.incr(key);

    return res.json({
      status: 'connected',
      cache: 'redis',
      visits,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'redis connection failed',
    });

  } finally {
    try {
      await client.quit();
    } catch (_) {
      // no-op
    }
  }
});

module.exports = router;