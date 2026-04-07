#!/bin/sh

# =============================================================================
# scan.sh
# Scans Docker images for vulnerabilities using Trivy
# Reports are exported to docs/security/
# Compatible Docker Compose et Docker Swarm
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Création du dossier de sortie si inexistant
mkdir -p docs/security

printf "${YELLOW}>> Scanning backend image...${NC}\n"
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd)/docs/security:/output" \
  aquasec/trivy image \
  --format json \
  --output /output/backend-scan.json \
  devops-foundations-backend

printf "${YELLOW}>> Scanning frontend image...${NC}\n"
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd)/docs/security:/output" \
  aquasec/trivy image \
  --format json \
  --output /output/frontend-scan.json \
  devops-foundations-frontend

printf "${YELLOW}>> Scanning source code for secrets...${NC}\n"
docker run --rm \
  -v "$(pwd):/project" \
  aquasec/trivy fs \
  --scanners secret \
  --format json \
  --output /project/docs/security/fs-scan.json \
  /project

printf "${GREEN}[OK] Reports exported to docs/security/${NC}\n"