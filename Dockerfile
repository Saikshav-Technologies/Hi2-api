# Multi-stage build for NestJS + Prisma
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Install dependencies (includes dev deps to keep Prisma CLI available)
FROM base AS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates \
    openssl \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

# Build the app
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runtime image
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

# Runtime deps for Prisma (libssl)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy only what we need to run
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY package*.json ./

EXPOSE 3000

# Apply migrations then start the service
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
