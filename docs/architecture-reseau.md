## 2. Isolation réseau

Le projet utilise deux réseaux Docker distincts pour isoler les services :

### Réseau `frontend`
Contient les services exposés publiquement via Traefik :
- **Traefik** : point d'entrée unique pour tout le trafic entrant
- **Frontend** : serveur nginx qui sert les fichiers statiques
- **Portainer** : interface graphique de gestion des conteneurs Docker
- **Grafana** : interface de visualisation des métriques (exposée via Traefik)

### Réseau `backend`
Contient les services internes, inaccessibles directement depuis l'extérieur :
- **Backend** (x2) : API Node.js
- **PostgreSQL** : base de données relationnelle
- **Redis** : cache et compteur de visites
- **MailHog** : serveur SMTP de développement
- **Adminer** : interface d'administration PostgreSQL
- **Prometheus** : collecte des métriques
- **cAdvisor** : métriques des conteneurs Docker
- **Watchtower** : mise à jour automatique des conteneurs

### Traefik : pont entre les deux réseaux
Traefik est le seul service présent sur les **deux réseaux**. Il reçoit le trafic externe sur le réseau `frontend` et le route vers les services appropriés sur le réseau `backend`. La base de données n'est **jamais** accessible depuis le réseau `frontend`.

### Grafana : pont entre les deux réseaux
Grafana est également présent sur les **deux réseaux** : il collecte ses données depuis Prometheus sur le réseau `backend` et est exposé via Traefik sur le réseau `frontend`.