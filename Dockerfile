# ── Frontend (Vite + React) ─────────────────────────────────────────────
# Build estático e serve via nginx com fallback de SPA (react-router).

# Etapa 1 — build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Variáveis VITE_* são embutidas no build → precisam existir AGORA (build args no Coolify)
ARG VITE_API_URL
ARG VITE_RECAPTCHA_SITE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

COPY . .
RUN npm run build

# Etapa 2 — serve
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
