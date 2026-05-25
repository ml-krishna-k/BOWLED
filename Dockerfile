# syntax=docker/dockerfile:1.7
#
# Bowled — frontend (Vite + React 19, served by nginx).
# Build:  docker build -t bowled-web .
# Run:    docker run -p 8080:80 -e API_URL=https://api.example.com bowled-web
#
# Inject the API base URL at build time via --build-arg VITE_API_URL=... ;
# if you skip it, the bundle calls relative /api/* paths (proxy them at the
# edge or behind the same domain).

# ---- Stage 1: build ---------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src
RUN npm run build

# ---- Stage 2: serve ---------------------------------------------------------
FROM nginx:1.27-alpine AS runtime
# SPA fallback — let React Router handle every unknown path.
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / { try_files $uri $uri/ /index.html; }\n\
  location ~* \\.(?:css|js|woff2?|svg|png|jpg|jpeg|webp|ico)$ {\n\
    expires 30d;\n\
    add_header Cache-Control "public, immutable";\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
