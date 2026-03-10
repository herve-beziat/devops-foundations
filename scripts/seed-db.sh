#!/bin/sh

# =============================================================================
# seed-db.sh
# Peuple la base de données avec des données de démonstration.
# Lance ce script pour créer la table users et insérer des données de test.
# Utile pour démontrer la persistance des données lors d'une démo.
#
# Pour démontrer la persistance des données :
# 1. sh scripts/seed-db.sh         → peuple la base
# 2. docker compose down            → arrête le stack (volumes conservés)
# 3. docker compose up -d --scale backend=2  → relance
# 4. Vérifier sur https://db.localhost que les données sont toujours là
# =============================================================================

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "${YELLOW}>> Peuplement de la base de données...${NC}"

# Chargement des variables d'environnement depuis .env
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | xargs)
else
  echo "${RED}[ERREUR] Fichier .env introuvable.${NC}"
  exit 1
fi

# Vérification que le conteneur postgres tourne
if ! docker ps | grep -q devops_postgres; then
  echo "${RED}[ERREUR] Le conteneur devops_postgres n'est pas démarré.${NC}"
  echo "Lancez d'abord : docker compose up -d"
  exit 1
fi

# Exécution du script SQL dans le conteneur postgres
docker exec -i devops_postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" << 'SQL'

-- Création de la table users si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Insertion de données de test (ignorées si déjà présentes)
INSERT INTO users (username, email, password) VALUES
    ('admin', 'admin@example.com', 'hashed_password_here'),
    ('john',  'john@example.com',  'hashed_password_here'),
    ('jane',  'jane@example.com',  'hashed_password_here')
ON CONFLICT DO NOTHING;

SQL

echo "${GREEN}[OK] Table users créée et données insérées.${NC}"
echo ""
echo "Pour vérifier : https://db.localhost (Adminer)"
echo "  Serveur   : postgres"
echo "  Utilisateur : $POSTGRES_USER"
echo "  Mot de passe : $POSTGRES_PASSWORD"
echo "  Base       : $POSTGRES_DB"