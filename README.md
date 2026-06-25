# FUTMINNA AI

An all-in-one student e-business platform for the Federal University of Technology, Minna — marketplace, peer tutoring, AI recommendations, a campus assistant, and trust-scored payments, in a single mobile-first app.

This is a real, working v1: a single Next.js 16 application (frontend + API routes) backed by SQLite via Drizzle ORM, with NextAuth credentials authentication, a hybrid recommendation engine, a RAG-lite campus assistant, and Paystack payment integration.

## What's implemented

| Module | Status |
|---|---|
| Authentication (register/login, RBAC) | Working |
| Marketplace (listings, search, favorites, reports) | Working |
| Tutoring (search, booking, accept/reject/complete) | Working |
| Trust scores (verification + transactions + ratings + disputes) | Working |
| Hybrid recommendations (collaborative + content, cold start) | Working |
| Campus assistant (RAG-lite + real LLM call) | Working — needs an API key, see below |
| Payments (Paystack init/verify/webhook, escrow-style flow) | Working — needs a Paystack test key, see below |
| Admin (user verification, tutor approval, reports, analytics) | Working |
| Notifications | Working |

Everything above is real, functional code connected to a real database — not mocked screens. The two integrations that need external API keys (chat LLM, Paystack) degrade gracefully with clear in-app messaging when no key is configured, rather than crashing.

### Deliberately out of scope for this v1

The original brief describes a full microservices platform (9 separate services, Python/FastAPI recommendation service, local Ollama LLM deployment, GraphQL analytics, Meilisearch, Redis queues, Prometheus/Grafana, 80% test coverage, full CI/CD). Building that is a multi-month effort for a team, not a single build. This v1 implements the same *behavior* — hybrid recommendations, RAG-grounded chat, escrow-style payments, trust scoring — inside one cohesive, well-architected Next.js app, so you have something real to run, demo, and iterate on. See `docs/ARCHITECTURE.md` for how this maps to the original spec and what a path to the full microservices version would look like.

---

## Quick start (local, no Docker)

```bash
npm install
cp .env.example .env          # then fill in NEXTAUTH_SECRET at minimum
npm run db:push               # create the SQLite schema
npm run db:seed               # seed demo data (categories, users, listings, tutors, KB docs)
npm run dev
```

Visit `http://localhost:3000`.

### Demo logins (password: `Password123!`)

| Role | Email |
|---|---|
| Admin | `admin@futminna.edu.ng` |
| Student | `emeka.obi@futminna.edu.ng` |
| Student (unverified) | `aisha.mohammed@futminna.edu.ng` |
| Tutor | `chidi.okafor@futminna.edu.ng` |
| Tutor | `fatima.yusuf@futminna.edu.ng` |

## Environment variables

See `.env.example` for the full list with comments. The only one required to run the app at all is `NEXTAUTH_SECRET` (any long random string). Everything else has a safe fallback:

- **`PAYSTACK_SECRET_KEY`** — without it, the "Pay now" buttons show a clear "Paystack isn't configured" message instead of crashing. Get a free test key at dashboard.paystack.com.
- **`ANTHROPIC_API_KEY`** — without it, the campus assistant falls back to returning the most relevant knowledge-base excerpt directly, rather than a generated answer. Any Claude-compatible key works; the call is a plain `fetch` to `api.anthropic.com/v1/messages` in `src/lib/chat/assistant.ts` — swap the URL/payload there if you'd rather use a different provider.
- **`CRON_SECRET`** — protects `POST /api/cron/retrain`, intended to be called every 24h by an external scheduler to refresh cached recommendations.

## Running with Docker

```bash
cp .env.example .env   # fill in NEXTAUTH_SECRET, optionally Paystack/Anthropic keys
docker compose up --build -d
docker compose --profile tools run --rm seed   # first run only: create schema + seed data
```

The app persists its SQLite database in a named Docker volume (`futminna-data`), so data survives container restarts.

> **Note:** the Dockerfile and compose setup were authored carefully against a verified `next build --output=standalone` output, but the sandbox this was built in had no Docker runtime available to execute a live `docker build`. Review the Dockerfile before a production rollout — multi-stage COPY paths are the most likely thing to need a small adjustment in your environment.

## Scripts

```bash
npm run dev          # start dev server
npm run build        # production build
npm run start        # run production build
npm run db:push      # push the Drizzle schema to SQLite
npm run db:seed      # seed demo data
npm run db:reset     # wipe + recreate + reseed (local dev only)
npm run lint
```

## Project structure

```
src/
  app/                    Next.js App Router
    (app)/                 authenticated route group (dashboard, marketplace, tutors, admin...)
    api/                    all backend API routes
    login/ register/ ...     public + auth pages
  components/
    ui/                      design-system primitives (button, card, dialog, select...)
    layout/                   navbars, sidebars, app shell
    marketplace/ chat/ shared/
  lib/
    auth/                     NextAuth config + session helpers
    db/                        Drizzle schema, client, seed script
    recommend/                  hybrid recommendation engine
    chat/                        RAG-lite retrieval + LLM call
    payments/                     Paystack client + settlement logic
    trust/                         trust score engine
    validations/                    zod schemas shared by forms + API routes
docs/                              PRD, architecture, API reference, admin/user guides
```

## Design

Purple-led visual identity (deep violet as the anchor) blended with warm gold and emerald accents against a warm off-white background. The signature visual motif is a small rotated "pin tab" on featured cards, echoing the campus noticeboards this platform is meant to replace. See `docs/DESIGN_SYSTEM.md`.

## Security

JWT-based sessions via NextAuth (credentials provider, bcrypt password hashing), RBAC on every mutating route via `requireSession`/`requireRole` helpers, rate limiting on sensitive endpoints, security headers and CSP via `src/proxy.ts` (Next.js 16's renamed `middleware.ts`), input validation via zod on every API route, and a Paystack webhook handler that verifies the HMAC signature before trusting any payload.

## License

Built as a demonstration project. No license is asserted on the FUTMINNA name or branding; treat this as a template to adapt for your own institution.
