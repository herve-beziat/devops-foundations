#!/bin/sh

# =============================================================================
# seed-db.sh
# Peuple la base de données avec des données de démonstration.
# Lance ce script pour créer la table users et insérer des données de test.
# Utile pour démontrer la persistance des données lors d'une démo.
# Compatible Docker Compose et Docker Swarm.
#
# Pour démontrer la persistance des données :
# 1. sh scripts/seed-db.sh                    → peuple la base
# 2. docker compose down                       → arrête le stack Compose
#    OU docker stack rm devops                 → arrête le stack Swarm
# 3. docker compose up -d --scale backend=2   → relance en Compose
#    OU sh scripts/init-swarm.sh              → relance en Swarm
# 4. Vérifier sur https://db.localhost que les données sont toujours là
# =============================================================================

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

printf "${YELLOW}>> Peuplement de la base de données...${NC}\n"

# Chargement des variables d'environnement depuis .env
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | xargs)
else
  printf "${RED}[ERREUR] Fichier .env introuvable.${NC}\n"
  exit 1
fi

# -----------------------------------------------------------------------------
# Détection du mode : Docker Compose ou Docker Swarm
# On cherche le conteneur postgres quel que soit son nom complet
# Compose : devops_postgres
# Swarm   : devops_postgres.1.xxxxxxx
# -----------------------------------------------------------------------------
POSTGRES_CONTAINER=$(docker ps --format '{{.Names}}' | grep 'postgres' | grep -v 'scanopy' | head -1)

if [ -z "$POSTGRES_CONTAINER" ]; then
  printf "${RED}[ERREUR] Aucun conteneur postgres trouvé.${NC}\n"
  printf "Lancez d'abord le stack avec :\n"
  printf "  Docker Compose : docker compose up -d\n"
  printf "  Docker Swarm   : sh scripts/init-swarm.sh\n"
  exit 1
fi

printf "${GREEN}[OK] Conteneur postgres trouvé : $POSTGRES_CONTAINER${NC}\n"

# Exécution du script SQL dans le conteneur postgres
docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" << 'SQL'

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

printf "${GREEN}[OK] Table users créée et données insérées.${NC}\n"
printf "\n"
echo "Pour vérifier : https://db.localhost (Adminer)"
echo "  Serveur     : postgres"
echo "  Utilisateur : $POSTGRES_USER"
echo "  Mot de passe : $POSTGRES_PASSWORD"
echo "  Base        : $POSTGRES_DB"