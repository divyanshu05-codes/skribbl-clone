# Multi-stage Docker build for Skribbl Clone
FROM node:20-alpine AS build

WORKDIR /app

# Copy root and workspace package files
COPY package.json package-lock.json* ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies
RUN npm install
RUN npm --prefix server install
RUN npm --prefix client install

# Copy source code
COPY server ./server
COPY client ./client

# Build client and server
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=build /app/package.json ./
COPY --from=build /app/server/package.json ./server/
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/node_modules ./server/node_modules
COPY --from=build /app/client/dist ./client/dist

EXPOSE 3001

CMD ["node", "server/dist/server.js"]
