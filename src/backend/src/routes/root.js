const express = require('express');
const router = express.Router();

// On importe la version depuis le package.json
// __dirname = src/backend/src/routes
const { version } = require('../../package.json');

/**
 * GET /
 * Endpoint racine : message de bienvenue + version de l'application
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to DevOps Foundations Backend',
    version: version,
  });
});

module.exports = router;