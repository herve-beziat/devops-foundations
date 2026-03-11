# Merge vs Rebase

## 1. Définitions

### Git Merge
`git merge` intègre les modifications d'une branche dans une autre en créant un **commit de fusion** (merge commit). L'historique conserve toutes les branches et leurs points de jonction.

```
main:    A --- B --- C ------- M
                      \       /
feature:               D --- E
```
Le commit `M` est le merge commit — il a deux parents (`C` et `E`).

### Git Rebase
`git rebase` rejoue les commits d'une branche au-dessus d'une autre. Il n'y a pas de merge commit : l'historique est **linéaire**.

```
main:    A --- B --- C
                      \
feature:               D' --- E'
```
Les commits `D'` et `E'` sont des copies de `D` et `E` avec un nouvel ancêtre.

---

## 2. Comparaison

| Critère | Merge | Rebase |
|---|---|---|
| Historique | Non-linéaire, conserve les branches | Linéaire, plus lisible |
| Commit de fusion | Oui (merge commit) | Non |
| Sécurité | Sûr sur les branches partagées | Dangereux sur les branches partagées |
| Traçabilité | Conserve l'historique exact | Réécrit l'historique |
| Résolution de conflits | Une seule fois | À chaque commit rejoué |

---

## 3. Exemples concrets dans ce projet

### Approche Merge (utilisée pour intégrer les features dans develop)

Lors de la fusion de `feature/infra-traefik-https` dans `develop` via Pull Request, Git crée un merge commit :

```
develop: ... --- X ----------------------- M
                  \                       /
feature:           A --- B --- C --- D ---
```

L'historique montre clairement quand la feature a été intégrée et quels commits en font partie.

### Approche Rebase (utilisée pour mettre à jour une feature branch)

Quand `develop` avance pendant qu'on travaille sur une feature, on peut rebaser notre branche pour rester à jour :

```bash
git checkout feature/ma-feature
git rebase develop
```

Avant le rebase :
```
develop: A --- B --- C
                \
feature:         D --- E
```

Après le rebase :
```
develop: A --- B --- C
                      \
feature:               D' --- E'
```

Notre feature est maintenant basée sur la dernière version de `develop`, sans merge commit parasite.

---

## 4. Politique choisie pour le projet

Ce projet utilise une politique **hybride** adaptée au workflow Gitflow :

### Merge pour les intégrations (feature → develop → main)
Les Pull Requests sont fusionnées avec `git merge` (via GitHub). Ce choix est justifié par :
- **Traçabilité** : le merge commit marque clairement la date d'intégration de chaque feature
- **Sécurité** : on ne réécrit jamais l'historique de `develop` ou `main`, branches partagées par toute l'équipe
- **Revue de code** : la PR et son merge commit constituent une trace de la validation

### Rebase pour la mise à jour des branches locales
Quand une feature branch prend du retard sur `develop`, on utilise `git rebase develop` pour la mettre à jour. Ce choix est justifié par :
- **Historique propre** : pas de merge commits inutiles sur les branches de travail
- **Conflits anticipés** : les conflits sont résolus avant la PR, pas pendant
- **Règle d'or respectée** : on ne rebase jamais une branche déjà poussée et partagée

### Règle d'or
> Ne jamais rebaser une branche publique (`develop`, `main`). Le rebase réécrit l'historique — si d'autres personnes ont basé leur travail dessus, leurs historiques deviennent incompatibles.