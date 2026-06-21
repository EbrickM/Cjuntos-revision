# ---- Builder ----
FROM node:20-alpine AS builder

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

# Healthcheck usando wget
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80