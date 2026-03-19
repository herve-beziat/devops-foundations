# Scanopy — Network Visualization

## What is Scanopy?

Scanopy is an open-source tool that automatically scans your infrastructure and generates an interactive network diagram showing how everything connects. It runs as a separate Docker stack alongside the main project.

> ⚠️ **Linux only** — Docker Compose deployment with `network_mode: host` is not supported on Docker Desktop (Windows/macOS). On Windows, a native `.exe` daemon is available but requires installing a binary outside of Docker.

---

## How it works

Scanopy consists of 3 services :

| Service | Role |
|---|---|
| `scanopy-server` | Web UI accessible at `http://localhost:60072` |
| `scanopy-postgres` | Dedicated database for Scanopy (separate from the project DB) |
| `scanopy-daemon` | Scanner that reads the Docker socket and maps all containers |

The daemon uses `network_mode: host` to access the host network directly — this is what allows it to detect all running containers and services on your machine.

---

## Prerequisites

- Linux (Ubuntu, Debian, Mint...)
- Docker Engine with Compose V2 plugin
- The main project stack must be running (`sh scripts/init.sh` or `sh scripts/init-swarm.sh`)

---

## First-time setup

### 1. Start the Scanopy stack
```bash
docker compose -f docker-compose.scanopy.yml up -d
```

### 2. Create your account

Navigate to `http://localhost:60072` and register your account.

### 3. Configure your organization

- **Organization name** : your project name (e.g. `devops-foundations`)
- **Network name** : `local-docker`
- **Enable SNMP discovery** : leave unchecked (only needed for physical network equipment)

### 4. Create and connect the daemon

Go to **Scan** → **Create Daemon** and follow these steps :

1. **Name** : `scanopy-daemon-local-docker`
2. **Daemon Mode** : `Daemon Poll` (recommended)
3. **OS** : `Linux` → **Docker**
4. Copy the generated snippet — it contains your unique `SCANOPY_NETWORK_ID` and `SCANOPY_DAEMON_API_KEY`

Update `docker-compose.scanopy.yml` with the new credentials from the snippet :
```yaml
services:
  daemon:
    environment:
      - SCANOPY_SERVER_URL=http://localhost:60072
      - SCANOPY_NETWORK_ID=<your-network-id>
      - SCANOPY_DAEMON_API_KEY=<your-api-key>
      - SCANOPY_USER_ID=<your-user-id>
      - SCANOPY_NAME=scanopy-daemon-local-docker
      - SCANOPY_MODE=daemon_poll
```

### 5. Restart the daemon with the new credentials
```bash
docker compose -f docker-compose.scanopy.yml down -v
docker compose -f docker-compose.scanopy.yml up -d
```

### 6. Confirm the daemon is running

Click **"I've started the Docker container"** in the Scanopy UI.

---

## Running a scan

Once the daemon is connected, go to **Scan** and run a **Docker Discovery** :

- **Docker Discovery** → scans all running containers, their networks and ports. Fast and precise — recommended for this project.
- **Network Discovery** → scans the entire IP network (`192.168.1.0/24`) to detect all devices (router, other machines...). Not needed for a Docker-only visualization.

The first scan takes a few minutes depending on the number of containers running.

---

## Useful commands
```bash
# Start the Scanopy stack
docker compose -f docker-compose.scanopy.yml up -d

# Stop the Scanopy stack
docker compose -f docker-compose.scanopy.yml down

# Stop and remove all data (full reset)
docker compose -f docker-compose.scanopy.yml down -v

# View daemon logs
docker compose -f docker-compose.scanopy.yml logs daemon -f

# View server logs
docker compose -f docker-compose.scanopy.yml logs server -f
```

---

## Full reset (start from scratch)

If the daemon loses connection to the server (e.g. after recreating the stack), you need to regenerate the credentials :

1. Stop the stack and remove volumes :
```bash
docker compose -f docker-compose.scanopy.yml down -v
```

2. Go to `http://localhost:60072` → **Scan** → **Create Daemon**
3. Copy the new snippet and update `docker-compose.scanopy.yml`
4. Restart :
```bash
docker compose -f docker-compose.scanopy.yml up -d
```

---

## Project structure
```
docker-compose.scanopy.yml   # Scanopy stack (server + daemon + postgres)
data/                        # Scanopy server data (not versioned)
```

> 💡 `docker-compose.scanopy.yml` contains sensitive credentials (`SCANOPY_DAEMON_API_KEY`). These are personal to your Scanopy instance and should not be shared publicly. Consider adding this file to `.gitignore` if working in a team.