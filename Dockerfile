# syntax=docker/dockerfile:1
FROM node:22-slim AS web-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=web-build /app/dist ./dist
COPY server.ts ./
COPY .env.example ./.env
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
