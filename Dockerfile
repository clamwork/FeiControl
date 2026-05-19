# ==============================================================
# FeiControl — Dockerfile (multi-stage)
# ==============================================================

# ---- Stage 1: Dependencies ----
FROM node:22-alpine AS deps

RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts
RUN npm rebuild better-sqlite3

# ---- Stage 2: Build ----
FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
RUN npm rebuild better-sqlite3

COPY . .

# Set build defaults
ARG NEXT_PUBLIC_APP_TITLE="FeiControl"
ARG NEXT_PUBLIC_AGENT_NAME="FeiControl"
ARG NEXT_PUBLIC_AGENT_EMOJI="🤖"
ARG NEXT_PUBLIC_AGENT_DESCRIPTION="Your AI co-pilot"
ARG NEXT_PUBLIC_APP_TITLE

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ---- Stage 3: Production ----
FROM node:22-alpine AS production

RUN apk add --no-cache sqlite-libs tini curl

WORKDIR /app

# Copy production deps
COPY --from=deps /app/node_modules ./node_modules
# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4730

EXPOSE 4730

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0"]
