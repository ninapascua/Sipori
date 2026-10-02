# Only needed if you self-host with Docker Compose. See page 11.
FROM node:20-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY shared/ /app/shared/
EXPOSE 3000
CMD ["node", "server.js"]
