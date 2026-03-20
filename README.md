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
| Security reports | nginx:alpine | Interne (trivy-reports) |
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

## Dashboard Grafana — Vulnérabilités Trivy

Le dashboard **Trivy Security Reports** est accessible dans Grafana (`https://monitor.localhost`) et affiche les vulnérabilités détectées par Trivy sur les images backend et frontend.

### Architecture

```
scan.sh → backend-scan.json / frontend-scan.json
               ↓
         trivy-reports (nginx)   ← sert les JSON via HTTP interne
               ↓
         Grafana + Infinity datasource
               ↓
         Dashboard Trivy Security Reports
```

Le service `trivy-reports` est un nginx interne (non exposé publiquement) qui sert les fichiers JSON de `docs/security/` via HTTP. Grafana les lit grâce au plugin **Infinity datasource**, qui permet de consommer n'importe quelle source HTTP.

### Mettre à jour les données du dashboard

Les données du dashboard correspondent au dernier scan Trivy effectué. Pour les rafraîchir :

```bash
sh scripts/scan.sh
```

Les nouveaux fichiers JSON sont immédiatement disponibles dans Grafana sans redémarrage — nginx les sert directement depuis le disque.

### Pourquoi cette approche ?

Nous avons exploré deux approches pour intégrer Trivy à Grafana :

**Option A — Trivy + Prometheus (temps réel)**
Cette approche nécessite un exporter Prometheus dédié qui scanne les images en continu et expose des métriques. La solution officielle d'Aqua Security (`trivy-operator`) est conçue pour **Kubernetes uniquement** et ne fonctionne pas avec Docker Compose. Des solutions communautaires existent (exporter Python custom avec Flask + prometheus_client) mais ajoutent une complexité de maintenance importante pour ce contexte.

**Option B — Infinity datasource + JSON (retenu)**
Grafana lit directement les rapports JSON générés par `scan.sh` via le plugin Infinity. C'est la solution adaptée à Docker Compose : simple, sans dépendance externe, et réutilise le travail déjà fait. La limite principale est que les données ne sont pas en temps réel — elles se mettent à jour uniquement quand `scan.sh` est relancé manuellement.

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

### Rolling Update & Automatic Rollback

The backend is configured with zero downtime deployment and automatic rollback :
```yaml
deploy:
  replicas: 2
  update_config:
    parallelism: 1      # Update 1 replica at a time
    delay: 10s          # Wait 10s between each replica
    failure_action: rollback  # Auto rollback if update fails
    monitor: 30s        # Monitor each replica for 30s after update
  rollback_config:
    parallelism: 1
    delay: 5s
    failure_action: pause     # Pause if rollback itself fails
    monitor: 30s
```

#### Demonstrate a rolling update (zero downtime)

Start a continuous request loop in terminal 1 :
```bash
while true; do
  response=$(curl -k -s https://api.localhost/whoami)
  echo "$(date +%H:%M:%S) → $response"
  sleep 1
done
```

Trigger a rolling update in terminal 2 :
```bash
docker service update --image devops-foundations-backend:latest --force devops_backend
```

Expected result : the loop continues without interruption. You will see the hostname change as Swarm updates each replica one at a time.

#### Demonstrate automatic rollback

Deploy a broken image to trigger an automatic rollback :
```bash
docker service update --image devops-foundations-backend:broken devops_backend
```

Expected result :
```
overall progress: rolling back update: 2 out of 2 tasks
rollback: update rolled back due to failure or early termination of task
verify: Service devops_backend converged
```

Swarm automatically detects the failure and rolls back to the previous working version — no manual intervention required.

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
├── README.md                       # Documentation du projet
├── CONTRIBUTING.md                 # Guide de contribution et conventions Git
├── docker-compose.yml              # Configuration de base (développement)
├── docker-compose.override.yml     # Overrides développement
├── docker-compose.prod.yml         # Overrides production
├── docker-stack.yml                # Configuration Docker Swarm (bonus)
├── docker-compose.scanopy.yml      # Stack Scanopy — visualisation réseau (Linux only)
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
│       │   ├── datasources/        # Datasources auto-provisionnées (Prometheus + Infinity)
│       │   └── dashboards/         # Configuration provisioning dashboards
│       └── dashboards/             # Dashboards Grafana pré-configurés (JSON)
│           ├── 14282_rev1.json     # Dashboard cAdvisor
│           ├── 17346_rev9.json     # Dashboard Traefik
│           └── trivy-dashboard.json # Dashboard vulnérabilités Trivy
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
    ├── scanopy.md                  # Documentation utilisation Scanopy
    └── security/
        ├── vulnerability-report.md # Rapport de vulnérabilités Trivy
        ├── backend-scan.json       # Scan image backend (brut, servi par trivy-reports)
        └── frontend-scan.json      # Scan image frontend (brut, servi par trivy-reports)
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

---

## Bonus — Network Visualization with Scanopy

Scanopy automatically scans your infrastructure and generates an interactive network diagram of all running containers and services.

> Linux only — see [docs/scanopy.md](docs/scanopy.md) for setup instructions.