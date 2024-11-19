FROM node:18-alpine AS base

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

RUN npm run build

FROM node:18-alpine
WORKDIR /app

COPY --from=base /app/.next ./.next
COPY --from=base /app/package*.json ./
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
