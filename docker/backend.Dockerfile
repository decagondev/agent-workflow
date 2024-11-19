FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ .

RUN npm prune --production

EXPOSE 5000

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["npm", "start"]
