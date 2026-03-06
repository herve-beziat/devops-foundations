# ---------- Stage 1 : builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Dépendances (cache-friendly)
COPY package*.json ./
RUN npm ci

# Code source
COPY . .

# Build de production
RUN npm run build

# ---------- Stage 2 : production ----------
FROM nginx:alpine AS production

# Labels OCI
LABEL org.opencontainers.image.title="devops-foundations-frontend"
LABEL org.opencontainers.image.description="Frontend for DevOps Foundations project"
LABEL org.opencontainers.image.source="https://github.com/herve-beziat/devops-foundations"
LABEL org.opencontainers.image.licenses="MIT"

# Copier le build statique dans nginx
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Healthcheck simple sur nginx
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --spider -q http://localhost/ || exit 1