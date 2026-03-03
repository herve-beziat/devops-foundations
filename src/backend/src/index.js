// Import du framework Express
// Express permet de créer facilement une API REST avec Node.js
const express = require('express');

// Création de l'application Express
// "app" représente notre serveur HTTP
const app = express();

// Définition du port d'écoute
// Si une variable d'environnement PORT est définie (ex: en Docker),
// on l'utilise. Sinon on prend 3000 par défaut.
const PORT = process.env.PORT || 3000;

// Import des routes (modulaires)
const healthRouter = require('./routes/health');
const rootRouter = require('./routes/root');
const dbRouteur = require('./routes/db');

// Montage des routes :
// ici, toutes les routes définies dans health.js seront accessibles sous /health
// Comme health.js définit GET '/', ça donne au final GET '/health'
app.use('/health', healthRouter);
// Monter la route racine
app.use('/', rootRouter);
// Monter la route de test de la base de données
app.use('/db', dbRouteur);

// Démarrage du serveur
// Le serveur écoute les requêtes HTTP sur le port défini
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});