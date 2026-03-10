#!/bin/sh

# =============================================================================
# generate-certs.sh
# Génère les certificats TLS locaux pour tous les domaines du projet
# via mkcert. Les certificats sont placés dans traefik/certs/.
# =============================================================================

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "${YELLOW}>> Génération des certificats TLS locaux...${NC}"

# Vérification que mkcert est installé
if ! command -v mkcert > /dev/null 2>&1; then
  echo "${RED}[ERREUR] mkcert n'est pas installé.${NC}"
  echo "Installez-le via : https://github.com/FiloSottile/mkcert"
  exit 1
fi

# Création du dossier certs si inexistant
mkdir -p traefik/certs

# Installation de l'autorité de certification locale mkcert
echo ">> Installation de la CA locale mkcert..."
mkcert -install

# Génération des certificats pour tous les domaines du projet
echo ">> Génération des certificats pour les domaines localhost..."
mkcert \
  -cert-file traefik/certs/app.localhost+5.pem \
  -key-file  traefik/certs/app.localhost+5-key.pem \
  app.localhost \
  api.localhost \
  db.localhost \
  mail.localhost \
  traefik.localhost \
  localhost

echo "${GREEN}[OK] Certificats générés dans traefik/certs/${NC}"