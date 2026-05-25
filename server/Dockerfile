# syntax=docker/dockerfile:1.7

# ---- Stage 1: build ---------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Install deps with a clean, reproducible install.
COPY package.json package-lock.json ./
RUN npm ci

# Compile TypeScript → dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Stage 2: runtime -------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Production deps only — keeps image lean and removes tsx/typescript/etc.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Bring in the compiled JS from the build stage.
COPY --from=build /app/dist ./dist

# Drop root.
RUN addgroup -g 1001 -S bowled && adduser -S bowled -u 1001 -G bowled
USER bowled

EXPOSE 4000
CMD ["node", "dist/index.js"]
