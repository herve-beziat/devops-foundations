FROM node:20-alpine

WORKDIR /app

# Copier uniquement les dépendances pour profiter du cache Docker
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du code
COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]