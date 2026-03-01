// Express permet de créer des "routers" : des mini-modules de routes
const express = require('express');

// Un router est un mini routeur qu’on pourra "monter" sur un chemin dans index.js
const router = express.Router();

/**
 * GET /health
 * Endpoint de santé : sert à vérifier que le backend répond correctement.
 * Très utile pour Docker (HEALTHCHECK) et pour les outils de monitoring.
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'backend',
  });
});

// On exporte le router pour pouvoir l'utiliser dans index.js
module.exports = router;