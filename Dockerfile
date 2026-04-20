ARG NODE_VERSION=22
ARG APP_NAME

# ---------------------------------------------------------------------------
# Stage 1: pruner – extract a minimal workspace via turbo prune
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS pruner

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g turbo@^2

COPY . .

ARG APP_NAME
RUN if [ -z "$APP_NAME" ]; then echo "APP_NAME must be set" && exit 1; fi
RUN turbo prune ${APP_NAME} --docker

# ---------------------------------------------------------------------------
# Stage 2: builder – install dependencies and build the application
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN corepack enable pnpm

# Copy lockfile and package manifests first for optimal layer caching
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy pruned source code
COPY --from=pruner /app/out/full/ .

# Build the app and its internal workspace dependencies
ARG APP_NAME
RUN pnpm turbo build --filter=${APP_NAME}

# Bundle into a self-contained directory with production deps only.
RUN pnpm deploy --legacy --filter=${APP_NAME} --prod /app/deployed

# ---------------------------------------------------------------------------
# Stage 3: production – lean, secure runtime
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS production

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production

WORKDIR /app

# Create non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only the deployed bundle (production deps + built artifacts)
COPY --from=builder --chown=appuser:appgroup /app/deployed .

# Drop to non-root for runtime
USER appuser

EXPOSE 80


CMD ["node", "dist/main.js"]
