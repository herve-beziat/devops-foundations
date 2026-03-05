# ---------- Stage 1 : builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Dépendances (cache-friendly)
COPY package*.json ./
RUN npm ci

# Code source
COPY . .

# ---------- Stage 2 : production ----------
FROM node:20-alpine AS production

WORKDIR /app

# Labels OCI
LABEL org.opencontainers.image.title="devops-foundations-backend"
LABEL org.opencontainers.image.description="Backend API for DevOps Foundations project"
LABEL org.opencontainers.image.source="https://github.com/herve-beziat/devops-foundations"
LABEL org.opencontainers.image.licenses="MIT"

# Sécurité : utilisateur non-root avec UID/GID explicites
RUN addgroup -g 1001 appgroup && adduser -S -u 1001 -G appgroup appuser

# Copier l'app depuis le builder
COPY --from=builder /app /app

USER appuser

EXPOSE 3000

# Healthcheck sans curl/wget : ping /health via Node
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "\
const http=require('http'); \
const req=http.request({host:'127.0.0.1',port:3000,path:'/health',timeout:4000},res=>process.exit(res.statusCode===200?0:1)); \
req.on('error',()=>process.exit(1)); req.end();"

CMD ["node", "src/index.js"]