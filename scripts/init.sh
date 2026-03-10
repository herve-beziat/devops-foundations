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

echo "${YELLOW}=============================${NC}"
echo "${YELLOW}  devops-foundations - init  ${NC}"
echo "${YELLOW}=============================${NC}"

# -----------------------------------------------------------------------------
# 1. Vérification des dépendances
# -----------------------------------------------------------------------------
echo "\n>> Vérification des dépendances..."

if ! command -v docker > /dev/null 2>&1; then
  echo "${RED}[ERREUR] Docker n'est pas installé.${NC}"
  exit 1
fi
echo "${GREEN}[OK] Docker${NC}"

if ! command -v mkcert > /dev/null 2>&1; then
  echo "${RED}[ERREUR] mkcert n'est pas installé.${NC}"
  echo "Installez-le via : https://github.com/FiloSottile/mkcert"
  exit 1
fi
echo "${GREEN}[OK] mkcert${NC}"

# -----------------------------------------------------------------------------
# 2. Création du fichier .env si inexistant
# -----------------------------------------------------------------------------
echo "\n>> Vérification du fichier .env..."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "${GREEN}[OK] .env créé depuis .env.example${NC}"
  echo "${YELLOW}[INFO] Pensez à modifier les valeurs dans .env avant de continuer.${NC}"
else
  echo "${GREEN}[OK] .env existe déjà${NC}"
fi

# -----------------------------------------------------------------------------
# 3. Génération des certificats TLS
# -----------------------------------------------------------------------------
echo "\n>> Génération des certificats TLS..."

if [ -f traefik/certs/app.localhost+5.pem ]; then
  echo "${GREEN}[OK] Certificats déjà présents, génération ignorée${NC}"
else
  sh scripts/generate-certs.sh
fi

# -----------------------------------------------------------------------------
# 4. Lancement du stack Docker Compose
# -----------------------------------------------------------------------------
echo "\n>> Lancement du stack Docker Compose..."
docker compose up -d --build --scale backend=2

echo "\n${GREEN}=============================${NC}"
echo "${GREEN}  Initialisation terminée !  ${NC}"
echo "${GREEN}=============================${NC}"
echo ""
echo "Services disponibles :"
echo "  https://app.localhost       → Frontend"
echo "  https://api.localhost       → Backend API"
echo "  https://db.localhost        → Adminer"
echo "  https://mail.localhost      → MailHog"
echo "  https://traefik.localhost   → Traefik dashboard"