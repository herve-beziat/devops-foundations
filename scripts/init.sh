#!/bin/sh

# =============================================================================
# init.sh
# Script d'initialisation du projet devops-foundations.
# À lancer une seule fois après avoir cloné le dépôt.
# Enchaîne : vérification des dépendances → .env → certs → docker compose up
# =============================================================================

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

printf "${YELLOW}=============================${NC}\n"
printf "${YELLOW}  devops-foundations - init  ${NC}\n"
printf "${YELLOW}=============================${NC}\n"

# -----------------------------------------------------------------------------
# 1. Vérification des dépendances
# -----------------------------------------------------------------------------
printf "\n>> Vérification des dépendances...\n"

if ! command -v docker > /dev/null 2>&1; then
  printf "${RED}[ERREUR] Docker n'est pas installé.${NC}\n"
  exit 1
fi
printf "${GREEN}[OK] Docker${NC}\n"

if ! command -v mkcert > /dev/null 2>&1; then
  printf "${RED}[ERREUR] mkcert n'est pas installé.${NC}\n"
  printf "Installez-le via : https://github.com/FiloSottile/mkcert\n"
  exit 1
fi
printf "${GREEN}[OK] mkcert${NC}\n"

# -----------------------------------------------------------------------------
# 2. Création du fichier .env si inexistant
# -----------------------------------------------------------------------------
printf "\n>> Vérification du fichier .env...\n"

if [ ! -f .env ]; then
  cp .env.example .env
  printf "${GREEN}[OK] .env créé depuis .env.example${NC}\n"
  printf "${YELLOW}[INFO] Pensez à modifier les valeurs dans .env avant de continuer.${NC}\n"
else
  printf "${GREEN}[OK] .env existe déjà${NC}\n"
fi

# -----------------------------------------------------------------------------
# 3. Génération des certificats TLS
# -----------------------------------------------------------------------------
printf "\n>> Génération des certificats TLS...\n"

if [ -f traefik/certs/app.localhost+7.pem ]; then
  printf "${GREEN}[OK] Certificats déjà présents, génération ignorée${NC}\n"
else
  sh scripts/generate-certs.sh
fi

# -----------------------------------------------------------------------------
# 4. Lancement du stack Docker Compose
# -----------------------------------------------------------------------------
printf "\n>> Lancement du stack Docker Compose...\n"
docker compose up -d --build --scale backend=2

printf "\n${GREEN}=============================${NC}\n"
printf "${GREEN}  Initialisation terminée !  ${NC}\n"
printf "${GREEN}=============================${NC}\n"
printf "\n"
echo "Services disponibles :"
echo "  https://app.localhost       → Frontend"
echo "  https://api.localhost       → Backend API"
echo "  https://db.localhost        → Adminer"
echo "  https://mail.localhost      → MailHog"
echo "  https://traefik.localhost   → Traefik dashboard"