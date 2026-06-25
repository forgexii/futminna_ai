# ---------- Base ----------
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- Build ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env so `next build` doesn't fail on missing values.
# Real secrets are supplied at runtime via docker-compose / .env.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXTAUTH_SECRET=build-time-placeholder-not-used-at-runtime
ENV NEXTAUTH_URL=http://localhost:3000
ENV DATABASE_URL=file:./futminna.db

RUN npm run build

# ---------- Runtime ----------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone server output — minimal runtime footprint.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Drizzle config + schema + full source needed if running `db:push`/`db:seed`
# against this image. For most deployments, run the seed job using the
# `builder` stage instead (see docker-compose.yml's `seed` service), which
# has the complete dev dependency tree from `npm ci` rather than this image's
# pruned standalone runtime.
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src/lib/db ./src/lib/db

# Writable directory for the SQLite file (mounted as a volume in compose).
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data /app

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
