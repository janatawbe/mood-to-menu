# Backend (Express + TypeScript) production image.
#
# Build context is the REPO ROOT (see docker-compose.yml's `context: .`), not server/ —
# this is an npm workspaces monorepo with a single root package-lock.json shared by both
# client and server, so `npm ci` needs to see the root manifest/lockfile plus every
# workspace's package.json (even one it isn't building) to resolve correctly.

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Only the manifests first (better layer caching — this layer only invalidates when a
# dependency changes, not on every source edit). client/package.json is required here
# purely so npm can resolve the workspace list from the lockfile; client source is never
# copied into this image.
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci

COPY server server
RUN npm run build --workspace=server

# ---- runtime stage ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# A separate, scoped install rather than copying node_modules from the build stage —
# `npm ci --omit=dev --workspace=server` resolves and installs only the server
# workspace's own production dependency tree from the shared lockfile. Workspace
# hoisting would otherwise put client-only packages (react, react-dom, motion) into a
# copied node_modules even though this image never uses them; client/package.json isn't
# even needed here since --workspace=server scopes the install on its own.
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
RUN npm ci --omit=dev --workspace=server

COPY --from=build /app/server/dist ./server/dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001

# GEMINI_API_KEY / GEMINI_MODEL / PORT are supplied at container runtime only (see
# docker-compose.yml `env_file`/`environment`) — never baked into this image.
CMD ["node", "server/dist/index.js"]
