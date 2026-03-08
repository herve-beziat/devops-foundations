const express = require('express');
const router = express.Router();
const os = require('os');

/**
 * GET /whoami
 * Retourne l'hostname du conteneur pour démontrer le load balancing.
 * Chaque replica a un hostname différent, Traefik alterne entre les deux.
 */
router.get('/', (req, res) => {
  res.json({
    hostname: os.hostname(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;