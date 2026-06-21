# syntax=docker/dockerfile:1

# ---- Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar solo los archivos de dependencias primero (mejora el cache)
COPY package.json package-lock.json* ./

# Usar cache para los paquetes npm (BuildKit)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copiar el resto del código
COPY . .

# Construir la app (genera la carpeta /app/dist)
RUN npm run build

# ---- Runtime: Distroless Nginx (Google) ----
FROM gcr.io/distroless/nginx:latest

# 1. COPIA LA CONFIGURACIÓN PERSONALIZADA DE NGINX
# Esto sobrescribe la configuración por defecto y arregla el routing de la SPA
COPY nginx.conf /etc/nginx/nginx.conf

# 2. COPIA LOS ARCHIVOS ESTÁTICOS CONSTRUIDOS
COPY --from=builder /app/dist /usr/share/nginx/html

# 3. PUERTO CORREGIDO: Coincide con el listen 8080 del nginx.conf
# Este puerto ya no es privilegiado, así que el usuario 'nobody' puede usarlo sin problemas.
EXPOSE 8080
