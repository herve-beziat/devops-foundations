#!/bin/sh

# =============================================================================
# init-swarm.sh
# Script d'initialisation Docker Swarm pour devops-foundations.
# À lancer après init.sh — nécessite que les images soient déjà buildées.
# Enchaîne : arrêt Compose → init Swarm → création secrets → déploiement
# =============================================================================

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

printf "${YELLOW}=============================${NC}\n"
printf "${YELLOW}  devops-foundations - swarm ${NC}\n"
printf "${YELLOW}=============================${NC}\n"

# -----------------------------------------------------------------------------
# 1. Vérification des prérequis
# -----------------------------------------------------------------------------
printf "\n>> Vérification des prérequis...\n"

# Vérifier que l'image backend existe (buildée par init.sh)
if ! docker image inspect devops-foundations-backend:latest > /dev/null 2>&1; then
  printf "${RED}[ERREUR] Image backend introuvable. Lancez d'abord : sh scripts/init.sh${NC}\n"
  exit 1
fi
printf "${GREEN}[OK] Image backend présente${NC}\n"

# Vérifier que l'image frontend existe (buildée par init.sh)
if ! docker image inspect devops-foundations-frontend:latest > /dev/null 2>&1; then
  printf "${RED}[ERREUR] Image frontend introuvable. Lancez d'abord : sh scripts/init.sh${NC}\n"
  exit 1
fi
printf "${GREEN}[OK] Image frontend présente${NC}\n"

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
  printf "${RED}[ERREUR] Fichier .env introuvable. Lancez d'abord : sh scripts/init.sh${NC}\n"
  exit 1
fi
printf "${GREEN}[OK] Fichier .env présent${NC}\n"

# -----------------------------------------------------------------------------
# 2. Arrêt du stack Docker Compose si actif
# -----------------------------------------------------------------------------
printf "\n>> Arrêt du stack Docker Compose...\n"
docker compose down 2>/dev/null || true
printf "${GREEN}[OK] Stack Compose arrêté${NC}\n"

# -----------------------------------------------------------------------------
# 3. Initialisation du Swarm si pas déjà fait
# -----------------------------------------------------------------------------
printf "\n>> Initialisation Docker Swarm...\n"

if docker info | grep -q "Swarm: active"; then
  printf "${YELLOW}[INFO] Swarm déjà initialisé, ignoré${NC}\n"
else
  # Détecter l'IP locale automatiquement
  LOCAL_IP=$(hostname -I | awk '{print $1}')
  docker swarm init --advertise-addr "$LOCAL_IP"
  printf "${GREEN}[OK] Swarm initialisé sur $LOCAL_IP${NC}\n"
fi

# -----------------------------------------------------------------------------
# 4. Création des secrets depuis le fichier .env
# -----------------------------------------------------------------------------
printf "\n>> Création des secrets Docker...\n"

# Fonction pour créer un secret seulement s'il n'existe pas déjà
create_secret() {
  NAME=$1
  VALUE=$2
  if docker secret inspect "$NAME" > /dev/null 2>&1; then
    printf "${YELLOW}[INFO] Secret '$NAME' existe déjà, ignoré${NC}\n"
  else
    echo "$VALUE" | docker secret create "$NAME" -
    printf "${GREEN}[OK] Secret '$NAME' créé${NC}\n"
  fi
}

# Charger les variables depuis .env
. ./.env

create_secret "postgres_password" "$POSTGRES_PASSWORD"
create_secret "postgres_user" "$POSTGRES_USER"
create_secret "postgres_db" "$POSTGRES_DB"
create_secret "watchtower_notification_url" "$WATCHTOWER_NOTIFICATION_URL"

# -----------------------------------------------------------------------------
# 5. Déploiement du stack Swarm
# -----------------------------------------------------------------------------
printf "\n>> Déploiement du stack Docker Swarm...\n"
docker stack deploy -c docker-stack.yml devops

printf "\n${GREEN}=============================${NC}\n"
printf "${GREEN}  Swarm déployé avec succès ! ${NC}\n"
printf "${GREEN}=============================${NC}\n"
printf "\n"
echo "Services disponibles :"
echo "  https://app.localhost       → Frontend"
echo "  https://api.localhost       → Backend API"
echo "  https://db.localhost        → Adminer"
echo "  https://mail.localhost      → MailHog"
echo "  https://traefik.localhost   → Traefik dashboard"
echo "  https://portainer.localhost → Portainer"
echo "  https://monitor.localhost   → Grafana"
echo ""
echo "Commandes utiles :"
echo "  docker stack services devops        → statut des services"
echo "  docker service logs devops_backend  → logs du backend"
echo "  docker stack rm devops              → arrêter le stack"