FROM node:18-alpine AS builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:18-alpine

WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production

COPY server/ ./
# Copy built frontend to the expected location
COPY --from=builder /app/client/dist ../client/dist

# Env
ENV NODE_ENV=production
ENV PORT=3000
# Default DB path (can be overridden by K3s PVC)
ENV DB_PATH=/data/links.db

EXPOSE 3000

# Ensure DB directory exists
RUN mkdir -p /data

CMD ["node", "index.js"]
