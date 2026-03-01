# Gitflow et Bonnes Pratiques de Commits

Ce document décrit une organisation Git simple et efficace (Gitflow simplifié), ainsi que les bonnes pratiques pour rédiger des commits clairs et professionnels sur GitHub.

---

## 1. Principes généraux

- Une branche = un objectif clair
- Un commit = une seule idée
- Pas de commit massif "tout-en-un"
- Toujours passer par des Pull Requests (PR)
- Historique lisible et maintenable dans le temps

---

## 2. Branches principales (Protégées)

### `main`

- Branche **stable**
- Contient uniquement du code prêt pour la production
- Aucun commit direct
- Mise à jour uniquement via Pull Request

### `develop`

- Branche principale de développement
- Toutes les fonctionnalités y sont fusionnées
- Peut être instable temporairement

> Les commits directs sur `main` et `develop` sont **interdits**.  
> Toute modification doit passer par une Pull Request.

---

## 3. Branches temporaires

| Type    | Convention de nommage        | Usage                                                              |
|---------|------------------------------|--------------------------------------------------------------------|
| Feature | `feature/nom-fonctionnalite` | Nouvelle fonctionnalité — créées depuis `develop`                  |
| Bugfix  | `bugfix/nom-du-bug`          | Correction de bug                                                  |
| Release | `release/x.y.z`              | Préparation d'une release — fusionnées dans `main` et `develop`    |
| Hotfix  | `hotfix/urgent`              | Correctif rapide en production — créées depuis `main`              |

**Règles :**

- Une branche = une seule fonctionnalité ou correction
- La branche est supprimée après le merge

---

## 4. Convention de commits (Conventional Commits)

### Principe

Le projet utilise la convention **Conventional Commits** afin de garantir :

- un historique lisible
- une compréhension rapide des changements
- une meilleure collaboration (même en solo)

Chaque message de commit doit décrire **clairement l'intention du changement**.

### Format

```
type(scope): description courte à l'infinitif
```

- **`type`** : nature du changement
- **`scope`** *(optionnel)* : partie concernée du projet
- **`description`** : action claire et concise

### Types courants

| Type       | Usage                                               |
|------------|-----------------------------------------------------|
| `feat`     | Ajout d'une nouvelle fonctionnalité                 |
| `fix`      | Correction de bug                                   |
| `chore`    | Configuration, infrastructure, outillage            |
| `docs`     | Documentation                                       |
| `test`     | Ajout ou modification de tests                      |
| `refactor` | Amélioration du code sans changement fonctionnel    |
| `style`    | Mise en forme, indentation (pas de logique)         |

### Exemples

```bash
feat(api): add health endpoint
chore(docker): add dockerignore file
docs(readme): update installation instructions
fix(auth): correct password validation
```

> Les messages vagues comme `update`, `test`, `wip` ou `fix bug` sont à éviter.

---

## 5. Règle des ~5 commits par branche feature

### Objectif

Lorsqu'une fonctionnalité est suffisamment technique ou structurante, elle doit être découpée en plusieurs commits afin de :

- structurer le développement par étapes
- faciliter la revue de code
- permettre un revert simple
- conserver un historique propre et compréhensible

L'objectif est de viser **environ 5 commits par branche feature**, chacun correspondant à une étape logique.

### Exemple — branche `feature/login`

```bash
chore(auth): initialize login feature structure
feat(auth): create login form
feat(auth): connect login form to API
fix(auth): correct password validation
docs(auth): document login feature
```

Chaque commit représente **une intention unique et cohérente**.

> Cette règle n'est pas stricte. Pour des changements simples ou purement documentaires, un nombre réduit de commits peut être plus pertinent.

---

## 6. Workflow Gitflow concret

### Initialisation

```bash
git init
git checkout -b main
git commit -m "chore: initial commit"
git checkout -b develop
```

### Exemple de commits sur une branche feature

```bash
git add .
git commit -m "feat(auth): create login form"

git add .
git commit -m "feat(auth): connect login form to API"

git add .
git commit -m "test(auth): add login tests"
```

---

## 7. Récapitulatif

| Branche      | Rôle                        |
|--------------|-----------------------------|
| `main`       | Production                  |
| `develop`    | Développement               |
| `feature/*`  | Nouvelles fonctionnalités   |
| `bugfix/*`   | Corrections de bugs         |
| `hotfix/*`   | Correctifs urgents en prod  |
| `release/*`  | Préparation de release      |

**À retenir :**

- Commits petits, clairs et typés
- ~5 commits par fonctionnalité
- Pull Requests obligatoires

---

## 8. Bonnes habitudes

- Tester avant de commit
- Relire ses messages de commit
- Ne jamais commit du code cassé
- Préférer plusieurs petits commits à un gros
