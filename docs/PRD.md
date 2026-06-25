# Product Requirements Document — FUTMINNA AI

## 1. Problem

FUTMINNA students currently coordinate buying/selling, peer tutoring, and campus information-seeking across fragmented channels — WhatsApp groups, physical noticeboards, word of mouth. This causes lost transactions, no way to verify trustworthiness of a buyer/seller/tutor, and no central place to discover relevant listings or tutors.

## 2. Goals

1. Provide one mobile-first platform for campus commerce and peer tutoring.
2. Make trust visible and quantifiable, rather than purely reputational.
3. Surface relevant listings/tutors automatically rather than requiring exhaustive manual search.
4. Provide a campus-knowledge assistant so common questions don't require hunting across departmental noticeboards or social media.
5. Keep the experience fast and usable on low-end Android devices and inconsistent campus data connections.

## 3. Non-goals (for this version)

- Real-time chat/messaging between buyer and seller (described in the original brief as "in-app messaging"; not implemented in v1 — reports and direct contact via listing are the interim path).
- Native mobile apps (this is a responsive web app).
- A locally-hosted LLM (Ollama) — v1 calls a hosted LLM API instead, which is simpler to operate and sufficient for a campus-scale assistant; see `ARCHITECTURE.md` for the tradeoff.
- Video calling infrastructure for tutoring sessions (sessions are scheduled; the actual call happens via any link the tutor/student agree on, e.g. Google Meet).

## 4. User roles & core jobs-to-be-done

**Student** — "I need to sell my old textbook," "I need help with MAT201 before the exam," "Is this seller trustworthy?"

**Tutor** (a student with an approved tutor profile) — "I want to earn from tutoring CSC301," "I need to manage my bookings and see what I've earned."

**Admin** — "I need to verify this student's identity," "Is this tutor application legitimate?," "Someone reported this listing — what do I do?"

## 5. Functional requirements (delivered in this version)

### 5.1 Authentication
- Email/password registration restricted in spirit to FUTMINNA email addresses (the seed data and copy assume `@futminna.edu.ng`; the system does not currently hard-block other domains — see `ARCHITECTURE.md` for how to add that validation).
- Role-based access control: `student`, `tutor`, `admin`.
- Session-based auth via NextAuth (JWT strategy), bcrypt-hashed passwords.

### 5.2 Marketplace
- Create, search, filter (category, price, condition), and sort listings.
- Favorite/save listings.
- Report a listing for moderation.
- Soft-deletion (listings marked `removed`, not hard-deleted) for audit purposes.

### 5.3 Tutoring
- Tutor application workflow (pending -> approved/rejected by admin).
- Search tutors by course code or keyword.
- Book a session, pay, tutor accepts/rejects, mark complete.
- Tutor earnings dashboard with 10% platform fee shown transparently.

### 5.4 Trust & ratings
- Composite 0-100 trust score: verification (20pt), completed transactions (30pt), average rating (35pt), responsiveness (10pt placeholder), minus a dispute penalty (up to -25pt).
- Recomputed on every relevant event (verification change, completed order/booking, new rating).
- Ratings tied to a specific completed transaction (order or tutor session), one rating per rater per target.

### 5.5 Recommendations
- Hybrid model: `0.6 x collaborative_score + 0.4 x content_score`, exactly per the original spec's formula.
- Cold start (<5 interactions): trending listings + most-booked tutors.
- Every recommendation includes a plain-language reason.
- `/api/cron/retrain` endpoint for periodic (intended: every 24h) cache refresh.

### 5.6 Campus assistant
- Retrieval over a seeded knowledge base (academic calendar, registration, marketplace policy, IT support, campus services, course catalog, trust score explanation, recommendation explanation).
- Real LLM call grounded only in retrieved context; graceful fallback (returns the top matching excerpt directly) when no LLM API key is configured.
- Source citations shown in the chat UI.

### 5.7 Payments
- Paystack transaction init/verify/webhook.
- Orders over NGN 5,000 conceptually escrowed (held until buyer confirms receipt or a dispute is raised).
- Dispute action available to either party.

### 5.8 Admin
- User list with search, verify, suspend.
- Tutor application queue (pending/approved/rejected).
- Report queue with resolve/dismiss/remove-listing actions.
- Platform stats: total users, GMV, completion rates, pending applications, open reports.

## 6. Non-functional requirements

| Requirement | Approach in this build |
|---|---|
| Mobile-first, 320px+ | Tailwind responsive utilities throughout; mobile drawer nav instead of sidebar below `lg` breakpoint |
| Performance | Self-hosted variable fonts (no external font CDN round-trip), Next.js standalone output, server components for data-heavy pages |
| Security | See README "Security" section |
| Accessibility | Semantic headings, label/input pairing, focus-visible rings on all interactive elements, sufficient color contrast on the violet/ink palette -- not independently audited against WCAG 2.2 AA line-by-line in this pass |
| Scalability | SQLite is appropriate for a campus-scale pilot (thousands of users); see `ARCHITECTURE.md` for the Postgres migration path for >10k concurrent users |

## 7. Success metrics (suggested, not yet instrumented beyond what's in the admin stats endpoint)

- GMV through completed marketplace orders.
- Booking completion rate.
- Percentage of new accounts that complete a transaction within 14 days.
- Recommendation click-through rate (interaction tracking exists in `user_interactions`; a CTR dashboard would be a natural next addition).
