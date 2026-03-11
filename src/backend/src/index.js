// Import du framework Express
// Express permet de créer facilement une API REST avec Node.js
const express = require('express');

// Création de l'application Express
// "app" représente notre serveur HTTP
const app = express();

// Obligatoire pour lire req.body en JSON
app.use(express.json()); 

// Définition du port d'écoute
// Si une variable d'environnement PORT est définie (ex: en Docker),
// on l'utilise. Sinon on prend 3000 par défaut.
const PORT = process.env.PORT || 3000;

// Import des routes (modulaires)
const healthRouter = require('./routes/health');
const rootRouter = require('./routes/root');
const dbRouteur = require('./routes/db');
const cacheRouteur = require('./routes/cache');
const contactRouter = require('./routes/contact');
const whoamiRouter = require('./routes/whoami');

// Middleware CORS : autorise le frontend à appeler l'API depuis un domaine différent
// Sans ça, le navigateur bloque les requêtes cross-origin (app.localhost → api.localhost)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://app.localhost');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Les requêtes OPTIONS sont des "preflight" envoyées par le navigateur
  // avant la vraie requête — on répond 200 immédiatement
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Montage des routes :
// ici, toutes les routes définies dans health.js seront accessibles sous /health
// Comme health.js définit GET '/', ça donne au final GET '/health'
app.use('/health', healthRouter);
// Monter la route racine
app.use('/', rootRouter);
// Monter la route de test de la base de données
app.use('/db', dbRouteur);
// Monter la route de test du cache
app.use('/cache', cacheRouteur);
// Monter la route de contact
app.use('/contact', contactRouter);
// Monter la route whoami pour démontrer le load balancing
app.use('/whoami', whoamiRouter);

// Démarrage du serveur
// Le serveur écoute les requêtes HTTP sur le port défini
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});