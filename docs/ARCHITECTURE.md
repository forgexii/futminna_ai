# Architecture — FUTMINNA AI

## What was built vs. the original spec

The original brief calls for a microservices platform: separate API Gateway, Auth, Marketplace, Tutoring, Recommendation, Chatbot, Payment, Notification, and Admin services; a Python/FastAPI recommendation service; a locally-hosted Ollama LLM with LangChain; MongoDB; Meilisearch; Redis queues; WebSockets; Prometheus/Grafana; an 80%-coverage test suite; full CI/CD.

That is months of work for a team. This build instead implements **one cohesive Next.js application** that delivers the same user-facing behavior and the same core algorithms (hybrid recommendation formula, RAG-style grounded chat, escrow-style payment flow, composite trust scoring), reachable through:

- **Frontend + API in one process**: Next.js App Router, React Server Components for read-heavy pages (dashboard, settings, earnings), client components for interactive forms/search.
- **One database**: SQLite via Drizzle ORM (`@libsql/client`), chosen over Postgres/MongoDB so the whole app runs with zero external infrastructure for development and small deployments.
- **One "AI service"**: recommendation logic and RAG retrieval live in `src/lib/recommend` and `src/lib/chat` as plain TypeScript, called directly from API routes — no separate FastAPI process, no network hop.

### Why this tradeoff is defensible for a v1

A campus marketplace platform's actual bottleneck is rarely "we need nine independently-scalable services" — it's "does this work, is it trustworthy, can a final-year student deploy it on a single DigitalOcean droplet." Collapsing the architecture removes operational complexity (9 services to deploy, monitor, and keep in sync) while keeping every piece of *business logic* the spec asked for. The seams are still there in the code — `src/lib/recommend`, `src/lib/chat`, `src/lib/payments`, `src/lib/trust` are each self-contained modules with a narrow public API — so any of them could be extracted into a separate service later without a rewrite, if and when real load demands it.

## Mapping spec services to this codebase

| Spec service | This build |
|---|---|
| API Gateway | Next.js itself (all `/api/*` routes), `src/proxy.ts` for cross-cutting headers/rate-limiting |
| Authentication Service | `src/lib/auth/*`, NextAuth credentials provider |
| Marketplace Service | `src/app/api/listings/*`, `src/app/api/orders/*`, `src/app/api/categories` |
| Tutoring Service | `src/app/api/tutors/*`, `src/app/api/bookings/*` |
| Recommendation Service | `src/lib/recommend/engine.ts` (in-process; `/api/cron/retrain` for periodic refresh) |
| Chatbot Service | `src/lib/chat/*` (retrieval + LLM call) |
| Payment Service | `src/lib/payments/*`, `src/app/api/payments/*` |
| Notification Service | `src/lib/notifications.ts` (in-app notifications; no email/SMS/push in this version) |
| Admin Service | `src/app/api/admin/*`, `src/app/(app)/admin/*` |

## Recommendation engine detail

Implements the spec's exact formula:

```
hybrid_score = 0.6 x collaborative_score + 0.4 x content_score
```

- **Collaborative**: builds a sparse interaction-weight vector per user (keyed by `targetType:targetId`), computes cosine similarity against all other users, and propagates weighted interactions from the most similar 15 users for items the current user hasn't touched yet.
- **Content-based**: matches the categories and course-code-like tokens (regex `[A-Z]{2,4}\d{3}`, e.g. `MAT201`) a user has shown interest in against listing categories and tutor expertise arrays.
- **Cold start**: fewer than 5 logged interactions falls back to trending listings (by view/favorite count) and most-booked tutors.
- **"Retrain every 24h"**: `POST /api/cron/retrain` (protected by `CRON_SECRET`) recomputes and re-caches recommendations for every user with activity in the last 30 days. Wire this to any external scheduler (cron, GitHub Actions on a schedule, a platform's built-in job scheduler).

This is a genuine, working hybrid recommender — not a stub — but it runs synchronously over in-memory vectors built from a SQL query, which is appropriate for a campus-scale dataset (thousands of users, tens of thousands of interactions). It would need to move to precomputed embeddings plus an approximate-nearest-neighbor index (e.g. pgvector, Faiss) well before tens of millions of interactions.

## Campus assistant (RAG) detail

The spec asks for vector embeddings, semantic search, and a locally-hosted Ollama model with zero external data egress. This build implements the same *shape* — retrieve top-k relevant knowledge base documents, then generate an answer grounded only in those documents, with citations — using:

- **Retrieval**: a keyword/TF-IDF-style scorer (`src/lib/chat/retrieval.ts`) over the `knowledge_base_documents` table. No vector index, no embedding model, no extra infrastructure to run.
- **Generation**: a real call to a hosted LLM API (`src/lib/chat/assistant.ts`), with a system prompt that instructs the model to answer only from retrieved context and say "I don't know" otherwise.

### Path to the original spec's local-LLM requirement

If "no conversation data leaves the building" is a hard requirement (e.g. for genuine data-sovereignty reasons), `retrieveRelevantDocs()` is the only function that needs to change to use real embeddings (e.g. via a local `sentence-transformers` model or Ollama's embedding endpoint) instead of keyword scoring, and `answerCampusQuestion()`'s `fetch` call can point at a local Ollama server instead of a hosted API — the prompt-construction and citation logic don't need to change.

## Payments & trust detail

- **Paystack**: `src/lib/payments/paystack.ts` (init/verify REST calls), `src/app/api/payments/webhook/route.ts` (HMAC-SHA512 signature verification per Paystack's documented scheme), `src/lib/payments/settle.ts` (idempotent settlement shared by both the verify route and the webhook, so a payment can't be double-applied).
- **Escrow**: modeled as an order status transition (`pending -> paid -> completed`, with `disputed`/`refunded` branches) rather than a separate ledger service. Real fund-holding depends on Paystack's own settlement timing in production; this build models the *workflow*, which is what a campus deployment actually needs.
- **Trust score**: `src/lib/trust/score-engine.ts`, recomputed on verification change, completed transaction, and new rating. Weights match the spec's five factors (verification, transactions, ratings, responsiveness, disputes).

## Data model

Full schema in `src/lib/db/schema.ts` — every entity from the spec (`Users`, `TutorProfiles`, `Listings`, `Categories`, `Orders`, `Bookings`, `Payments`, `Ratings`, `Notifications`, `UserInteractions`, `Recommendations`, `TrustScores`, `KnowledgeBaseDocuments`, `Reports`) with indexes on hot query paths, audit timestamps (`createdAt`/`updatedAt`), and soft-deletion (`deletedAt`) where relevant.

## Migration path to Postgres / true microservices

If usage outgrows a single SQLite file (rule of thumb: comfortably handles a single campus's traffic; start watching write contention well before tens of thousands of concurrent users):

1. Swap `@libsql/client` for `postgres`/`pg` and update `drizzle.config.ts`'s `dialect`. The schema (`schema.ts`) is already written in dialect-agnostic Drizzle syntax and needs minimal changes.
2. Extract `src/lib/recommend` into its own service once recommendation compute time competes with request latency — the function signatures (`getRecommendationsForUser`, `trackInteraction`) are the natural service boundary.
3. Move `src/lib/chat` to a dedicated service once embedding-based retrieval is introduced, since that needs its own deployment lifecycle (model weights, vector index).
4. Introduce a message queue (the spec suggests Redis) only once you have genuine background-job needs (e.g. bulk notification fan-out) that are causing request-time latency.

Resist doing any of this before you have the load data to justify it — the in-process version is faster to operate and easier to reason about for a long time.
