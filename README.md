# devops-foundations

Stack DevOps prête pour la production avec Docker, Traefik et workflow Git professionnel.

## Stack technique

| Service | Image | URL |
|---|---|---|
| Frontend | nginx:alpine | https://app.localhost |
| Backend | node:20-alpine | https://api.localhost |
| Database | postgres:16-alpine | https://db.localhost (Adminer) |
| Cache | redis:7-alpine | — |
| Mail | mailhog/mailhog | https://mail.localhost |
| Reverse Proxy | traefik:v3 | https://traefik.localhost |
| Management | portainer-ce:2.39.0 | https://portainer.localhost |
| Monitoring | grafana:11.5.2 | https://monitor.localhost |
| Metrics | prom/prometheus:v3.2.1 | — |
| Containers metrics | cadvisor:v0.52.1 | — |
| Auto-update | watchtower:1.7.1 | — |

---

## Livrable 4.2 — Screencast de démonstration

[▶ Voir la démonstration sur YouTube](https://youtu.be/tZpToiFgD1U)

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) v24+
- [mkcert](https://github.com/FiloSottile/mkcert) pour les certificats TLS locaux
- Git
- Un terminal Unix (Git Bash sur Windows)

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/herve-beziat/devops-foundations.git
cd devops-foundations
```

### 2. Initialisation automatique

Le script `init.sh` fait tout en une seule commande :

```bash
sh scripts/init.sh
```

Il effectue dans l'ordre :
1. Vérification des dépendances (Docker, mkcert)
2. Création du fichier `.env` depuis `.env.example`
3. Génération des certificats TLS avec mkcert
4. Lancement du stack Docker Compose

### 3. Initialisation manuelle (optionnel)

Si vous préférez faire les étapes une par une :

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Générer les certificats TLS
sh scripts/generate-certs.sh

# Lancer le stack
docker compose up -d --build --scale backend=2
```

---

## Configuration

Les variables d'environnement sont dans le fichier `.env` (non versionné) :

```env
POSTGRES_DB=devops_db
POSTGRES_USER=devops_user
POSTGRES_PASSWORD=devops_password
```

Voir `.env.example` pour les valeurs par défaut.

---

## URLs des services

| Service | URL | Authentification |
|---|---|---|
| Frontend | https://app.localhost | — |
| Backend API | https://api.localhost | — |
| Adminer (DB) | https://db.localhost | Basic Auth (test/test) |
| MailHog | https://mail.localhost | — |
| Traefik Dashboard | https://traefik.localhost | Basic Auth (test/test) |
| Portainer | https://portainer.localhost | — |
| Grafana | https://monitor.localhost | — |
| Watchtower | — | Automatic container updates + Discord notifications |

### Endpoints API

| Endpoint | Méthode | Description |
|---|---|---|
| `/` | GET | Message de bienvenue + version |
| `/health` | GET | Statut du backend |
| `/db` | GET | Test connexion PostgreSQL |
| `/cache` | GET | Test connexion Redis + compteur de visites |
| `/whoami` | GET | Hostname du conteneur (démo load balancing) |
| `/contact` | POST | Envoi d'un email via MailHog |

---

## Commandes utiles

### Démarrage

```bash
# Démarrage standard (dev)
docker compose up -d --build --scale backend=2

# Démarrage en production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend=2
```

### Arrêt

```bash
# Arrêt (données conservées)
docker compose down

# Arrêt + suppression des volumes (données perdues)
docker compose down -v
```

### Logs

```bash
# Logs de tous les services
docker compose logs

# Logs d'un service spécifique
docker compose logs backend
docker compose logs frontend

# Logs en temps réel
docker compose logs -f backend
```

### Rebuild

```bash
# Rebuild d'un service spécifique
docker compose up -d --build frontend

# Rebuild complet
docker compose up -d --build --scale backend=2
```

### Monitoring

```bash
# Statut des conteneurs
docker ps

# Utilisation des ressources
docker stats --no-stream
```

### Watchtower
\`\`\`bash
# Check watchtower logs
docker compose logs watchtower

# Force an immediate update check
docker compose exec watchtower /watchtower --run-once
\`\`\`

---

## Démonstration du load balancing

Le backend tourne avec 2 replicas. Pour vérifier la distribution du trafic :

```bash
# PowerShell
for ($i = 1; $i -le 6; $i++) { $r = curl.exe -k -s https://api.localhost/whoami; Write-Host "$i : $r" }

# Git Bash / Linux
for i in $(seq 1 6); do curl -k -s https://api.localhost/whoami; echo; done
```

Les réponses alternent entre les deux instances du backend.

---

## Persistance des données

### Démonstration

```bash
# 1. Peupler la base de données
sh scripts/seed-db.sh

# 2. Arrêter le stack (volumes conservés)
docker compose down

# 3. Relancer
docker compose up -d --scale backend=2

# 4. Vérifier sur https://db.localhost que les données sont toujours présentes
```

### Volumes Docker

| Volume | Service | Contenu |
|---|---|---|
| `postgres_data` | PostgreSQL | Base de données |
| `redis_data` | Redis | Cache et compteur de visites |

---

## Structure du projet

```
devops-foundations/
├── docker-compose.yml              # Base configuration
├── docker-compose.override.yml     # Development overrides
├── docker-compose.prod.yml         # Production overrides
├── .env.example                    # Environment variables (example)
├── traefik/
│   ├── traefik.yml                 # Traefik static configuration
│   ├── certs/                      # TLS certificates (not versioned)
│   └── dynamic/
│       └── middlewares.yml         # Middlewares and TLS configuration
├── monitoring/
│   ├── prometheus.yml              # Prometheus scrape configuration
│   └── grafana/
│       ├── provisioning/
│       │   ├── datasources/        # Auto-provisioned Prometheus datasource
│       │   └── dashboards/         # Dashboards provisioning config
│       └── dashboards/             # Pre-built Grafana dashboards (JSON)
├── src/
│   ├── backend/                    # Node.js/Express API
│   └── frontend/                   # Vite + nginx app
├── scripts/
│   ├── init.sh                     # Project initialization
│   ├── generate-certs.sh           # TLS certificates generation
│   └── seed-db.sh                  # Database seeding
└── docs/
    ├── architecture-reseau.md      # Network architecture documentation
    ├── merge-vs-rebase.md          # Git policy
    └── image-size-comparison.md    # Docker image size comparison
```

---

## Workflow Git

Ce projet utilise **Gitflow** avec des branches protégées :

- `main` : production
- `develop` : intégration
- `feature/*` : nouvelles fonctionnalités
- `fix/*` : corrections
- `docs/*` : documentation

Les Pull Requests sont obligatoires pour merger vers `develop` et `main`.