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

# nginx config (DEBE escuchar en 8080)
COPY nginx.conf /etc/nginx/nginx.conf

# assets estáticos
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK CMD (echo > /dev/tcp/localhost/8080) >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]