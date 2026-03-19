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

- [Docker Engine](https://docs.docker.com/engine/install/) v24+ avec le plugin Compose V2
- [mkcert](https://github.com/FiloSottile/mkcert) pour les certificats TLS locaux
- Git
- Un terminal Unix (Linux recommandé)

> ⚠️ **Note** : certaines fonctionnalités comme Docker Swarm et `network_mode: host` nécessitent Linux. Docker Desktop sur Windows présente des limitations pour ces usages.

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
WATCHTOWER_NOTIFICATION_URL=discord://token@channel_id
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
| Grafana | https://monitor.localhost | admin/admin |
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

## Commandes utiles — Docker Compose

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
```bash
# Logs Watchtower
docker compose logs watchtower

# Forcer une vérification immédiate des mises à jour
docker compose exec watchtower /watchtower --run-once
```

### Sécurité (Trivy)
```bash
# Lancer tous les scans (images + filesystem)
sh scripts/scan.sh

# Scanner uniquement l'image backend
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image \
  --severity HIGH,CRITICAL \
  devops-foundations-backend

# Scanner uniquement l'image frontend
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image \
  --severity HIGH,CRITICAL \
  devops-foundations-frontend

# Scanner le code source pour détecter des secrets
docker run --rm \
  -v "$(pwd):/project" \
  aquasec/trivy fs \
  --scanners secret \
  /project
```

Les rapports sont générés dans `docs/security/`.

---

## Démonstration du load balancing

Le backend tourne avec 2 replicas. Pour vérifier la distribution du trafic :
```bash
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
| `portainer_data` | Portainer | Configuration et données Portainer |
| `prometheus_data` | Prometheus | Métriques collectées |
| `grafana_data` | Grafana | Dashboards et configuration |

---

## Docker Swarm (bonus)

Docker Swarm permet de déployer le stack en mode cluster avec haute disponibilité et zero downtime deployment.

> ⚠️ **Prérequis** : Docker Swarm nécessite Linux. Non supporté sur Docker Desktop Windows.

### Différences avec Docker Compose

| | Docker Compose | Docker Swarm |
|---|---|---|
| Usage | Développement local | Production / cluster |
| Fichier | `docker-compose.yml` | `docker-stack.yml` |
| Commande | `docker compose up` | `docker stack deploy` |
| Replicas | `--scale backend=2` | Défini dans le fichier |
| Secrets | Variables `.env` | Docker Secrets chiffrés |
| Réseau | `bridge` | `overlay` (multi-machines) |

### Initialisation du Swarm
```bash
# Initialiser le node manager
docker swarm init --advertise-addr <votre-ip-locale>

# Vérifier l'état du swarm
docker node ls
```

### Création des secrets

Les secrets Docker Swarm sont chiffrés et jamais visibles en clair :
```bash
echo "devops_password" | docker secret create postgres_password -
echo "devops_user" | docker secret create postgres_user -
echo "devops_db" | docker secret create postgres_db -
echo "discord://TOKEN@CHANNEL_ID" | docker secret create watchtower_notification_url -

# Vérifier les secrets créés
docker secret ls
```

### Déploiement
```bash
docker stack deploy -c docker-stack.yml devops
```

### Commandes utiles Swarm
```bash
# Statut des services
docker stack services devops

# Statut détaillé d'un service
docker service ps devops_backend

# Logs d'un service
docker service logs devops_backend

# Mettre à jour un service sans interruption (zero downtime)
docker service update --image devops-foundations-backend:latest --force devops_backend

# Scaler un service
docker service scale devops_backend=3
```

### Reset complet (démo depuis zéro)
```bash
# 1. Arrêter le stack
docker stack rm devops

# 2. Attendre l'arrêt complet
sleep 5

# 3. Supprimer les volumes
docker volume rm devops_postgres_data devops_redis_data devops_grafana_data devops_portainer_data devops_prometheus_data

# 4. Relancer
docker stack deploy -c docker-stack.yml devops
```

### Arrêter le Swarm
```bash
# Supprimer le stack (conteneurs supprimés, volumes conservés)
docker stack rm devops

# Quitter le swarm complètement
docker swarm leave --force
```

> 💡 **Note avancée** : Dans un vrai cluster multi-nodes, cAdvisor devrait tourner sur chaque node pour monitorer toutes les machines. On utiliserait alors `mode: global` au lieu de `replicas: 1` dans le `docker-stack.yml`.

---

## Structure du projet
```
devops-foundations/
├── docker-compose.yml              # Configuration de base (développement)
├── docker-compose.override.yml     # Overrides développement
├── docker-compose.prod.yml         # Overrides production
├── docker-stack.yml                # Configuration Docker Swarm (bonus)
├── .env.example                    # Variables d'environnement (exemple)
├── traefik/
│   ├── traefik.yml                 # Configuration statique Traefik
│   ├── certs/                      # Certificats TLS (non versionnés)
│   └── dynamic/
│       └── middlewares.yml         # Middlewares et configuration TLS
├── monitoring/
│   ├── prometheus.yml              # Configuration scrape Prometheus
│   └── grafana/
│       ├── provisioning/
│       │   ├── datasources/        # Datasource Prometheus auto-provisionnée
│       │   └── dashboards/         # Configuration provisioning dashboards
│       └── dashboards/             # Dashboards Grafana pré-configurés (JSON)
├── src/
│   ├── backend/                    # API Node.js/Express
│   └── frontend/                   # App Vite + nginx
├── scripts/
│   ├── init.sh                     # Initialisation du projet
│   ├── generate-certs.sh           # Génération des certificats TLS
│   ├── seed-db.sh                  # Peuplement de la base de données
│   └── scan.sh                     # Scan de sécurité Trivy
└── docs/
    ├── architecture-reseau.md      # Documentation architecture réseau
    ├── merge-vs-rebase.md          # Politique Git
    ├── image-size-comparison.md    # Comparaison taille des images Docker
    └── security/
        ├── vulnerability-report.md # Rapport de vulnérabilités Trivy
        ├── backend-scan.json       # Scan image backend (brut)
        └── frontend-scan.json      # Scan image frontend (brut)
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