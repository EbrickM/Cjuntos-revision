# syntax=docker/dockerfile:1

# ---- Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar solo los archivos de dependencias primero (mejora el cache)
COPY package.json package-lock.json* ./

# Usar cache para los paquetes npm (BuildKit)
RUN --mount=type=cache,target=/root/.npm \
    npm ci && \
    npm cache clean --force

# Copiar el resto del código
COPY . .

# Construir la app (genera la carpeta /app/dist)
RUN npm run build

# ---- Runtime: Nginx Alpine ----
FROM nginx:stable-alpine-slim

# Instalar herramientas útiles
RUN apk add --no-cache wget

# 1. COPIA LA CONFIGURACIÓN PERSONALIZADA DE NGINX
COPY nginx.conf /etc/nginx/nginx.conf

# 2. COPIA LOS ARCHIVOS ESTÁTICOS CONSTRUIDOS
COPY --from=builder /app/dist /usr/share/nginx/html

# 3. CAMBIAR A USUARIO NO-ROOT (MEJORA SEGURIDAD)
USER nginx

# 4. EXPONER PUERTO NO PRIVILEGIADO
EXPOSE 8080

# 5. HEALTHCHECK (OPCIONAL PERO RECOMENDADO)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1
