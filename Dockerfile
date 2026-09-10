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

# AUTH_URL/API_URL/IDENTITY_API_URL son prefijos de ruta fijos
# hardcodeados en src/config.ts; Traefik (labels en el repo del backend)
# los enruta por dominio según el Host de la petición — no hace falta
# inyectar nada al arrancar el contenedor.

# Healthcheck usando wget
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]