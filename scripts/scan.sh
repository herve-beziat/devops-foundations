#!/bin/sh

# =============================================================================
# scan.sh
# Scans Docker images for vulnerabilities using Trivy
# Reports are exported to docs/security/
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create output directory if it doesn't exist
mkdir -p docs/security

echo -e "${YELLOW}>> Scanning backend image...${NC}"
MSYS_NO_PATHCONV=1 docker run --rm \
  -v //var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd)/docs/security:/output" \
  aquasec/trivy image \
  --format json \
  --output /output/backend-scan.json \
  devops-foundations-backend

echo -e "${YELLOW}>> Scanning frontend image...${NC}"
MSYS_NO_PATHCONV=1 docker run --rm \
  -v //var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd)/docs/security:/output" \
  aquasec/trivy image \
  --format json \
  --output /output/frontend-scan.json \
  devops-foundations-frontend

echo -e "${YELLOW}>> Scanning source code for secrets...${NC}"
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "$(pwd):/project" \
  aquasec/trivy fs \
  --scanners secret \
  --format json \
  --output /project/docs/security/fs-scan.json \
  /project

echo -e "${GREEN}[OK] Reports exported to docs/security/${NC}"