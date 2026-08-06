# ---- Builder ----
FROM node:24-alpine3.24 AS builder

# 1. Declarar el ARG con un valor por defecto (fallback)
ARG NPM_REGISTRY=https://registry.npmjs.org/
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}

WORKDIR /app

# dependencias primero (mejor cache en docker build normal)
COPY package.json package-lock.json* ./

RUN npm ci || npm install 

# código fuente
COPY . .

# build
RUN npm run build


# ---- Runtime ----
FROM nginx:stable-alpine-slim

# nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# assets estáticos
COPY --from=builder /app/dist /usr/share/nginx/html

# entrypoint: genera config.json desde AUTH_URL / API_URL / IDENTITY_API_URL
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Healthcheck usando wget
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]