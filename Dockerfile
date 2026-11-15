# Flame in Freefall MCP service: POST /chat (behind the gateway), POST /mcp, GET /health.
# Debian, not Alpine: sqlite-vec ships prebuilt glibc binaries. Node >= 22.13 runs node:sqlite
# without a flag.
ARG NODE_IMAGE=node:22.21.0-bookworm-slim

FROM ${NODE_IMAGE} AS base
WORKDIR /app
# The version pinned in package.json (packageManager). Node 22's bundled corepack cannot start
# pnpm 12, so npm installs it.
RUN npm install -g pnpm@12.14.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS build
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

FROM base AS deps
RUN pnpm install --frozen-lockfile --prod

FROM ${NODE_IMAGE}
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8001 \
    CORPUS_PATH=/app/storage/corpus.db
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# The corpus ships in the image. To replace it, mount a read-only volume over this path
# (or mount it elsewhere and set CORPUS_PATH).
COPY storage/corpus.db ./storage/corpus.db
USER node
EXPOSE 8001
CMD ["node", "dist/server.js"]
