# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias primero (mejor cache)
COPY package.json package-lock.json* ./

# Instalar dependencias con npm
RUN npm ci || npm install

# Copiar código fuente
COPY . .

# Build
RUN npm run build


# Serve stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80


