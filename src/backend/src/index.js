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

// Démarrage du serveur
// Le serveur écoute les requêtes HTTP sur le port défini
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});