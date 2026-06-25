# API Reference — FUTMINNA AI

All routes are under `/api`. Authenticated routes expect a valid NextAuth session cookie (set automatically by the browser after login — there is no separate bearer-token API in this version). Unauthenticated requests to a protected route receive `401 {"error": "Sign in required"}`; insufficiently-privileged requests receive `403`.

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | none | Create a new student account |
| * | `/api/auth/[...nextauth]` | n/a | NextAuth-managed routes: `/signin`, `/callback/credentials`, `/session`, `/csrf`, `/signout` |

## Categories

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | none | List all marketplace categories |

## Marketplace

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/listings` | none | Search/filter listings. Query params: `q`, `category` (slug), `minPrice`, `maxPrice`, `condition`, `sort` (`newest`/`price_asc`/`price_desc`/`popular`), `page`, `pageSize` |
| POST | `/api/listings` | session | Create a listing |
| GET | `/api/listings/:id` | none | Get listing detail (increments view count, tracks interaction if signed in) |
| PATCH | `/api/listings/:id` | owner or admin | Update a listing |
| DELETE | `/api/listings/:id` | owner or admin | Soft-delete (sets status to `removed`) |
| POST | `/api/listings/:id/favorite` | session | Toggle favorite |
| GET | `/api/me/listings` | session | Your own listings |
| GET | `/api/me/favorites` | session | Your favorited listings |

## Orders

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | session | Create an order for a listing (status starts `pending`) |
| GET | `/api/orders` | session | List your orders (as buyer or seller) |
| PATCH | `/api/orders/:id` | buyer/seller/admin | Body: `{ action: "confirm_receipt" | "dispute" | "cancel" }` |

## Tutoring

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tutors` | none | Search approved tutors. Query params: `q`, `sort`, `page`, `pageSize` |
| POST | `/api/tutors` | session | Apply to become a tutor (creates a `pending` profile) |
| GET | `/api/tutors/:id` | none | Tutor profile detail + recent ratings |
| PATCH | `/api/tutors/:id` | owner or admin | Update profile fields or status |
| POST | `/api/bookings` | session | Book a session. Body: `{ tutorProfileId, courseCode, scheduledAt, durationMinutes }` |
| GET | `/api/bookings?as=student|tutor` | session | List your bookings |
| PATCH | `/api/bookings/:id` | tutor/student/admin | Body: `{ status: "accepted" | "rejected" | "completed" | "cancelled" }` |

## Ratings

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/ratings` | session | Body: `{ targetUserId, targetType: "order"|"tutor_session", targetId, score (1-5), comment? }` |

## Recommendations

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/recommendations` | session | Personalized recommendations, hydrated with listing/tutor data |

## Campus assistant

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/chat` | optional | Body: `{ message, conversationHistory? }`. Rate-limited per user/IP. |

## Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/init` | session | Body: `{ type: "order"|"booking", relatedId }`. Returns `{ configured: false, message }` if no Paystack key set, or `{ configured: true, authorizationUrl, reference }` |
| POST | `/api/payments/verify` | session | Body: `{ reference }`. Verifies with Paystack and settles the related order/booking |
| POST | `/api/payments/webhook` | Paystack signature | Server-to-server confirmation; verifies `x-paystack-signature` header |

## Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | session | Your most recent 50 notifications |
| PATCH | `/api/notifications/:id` | owner | Mark as read |

## Reports

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/reports` | session | Body: `{ targetType: "listing"|"user"|"message", targetId, reason }` |

## Admin (requires `role: "admin"`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform-wide analytics |
| GET | `/api/admin/users?q=` | Search/list users with trust scores |
| PATCH | `/api/admin/users/:id` | Body: `{ verificationStatus?, suspended?, role? }` |
| GET | `/api/admin/tutors?status=` | List tutor applications by status |
| PATCH | `/api/admin/tutors/:id` | Body: `{ status: "approved"|"rejected"|"suspended"|"pending" }` |
| GET | `/api/admin/reports?status=` | List moderation reports |
| PATCH | `/api/admin/reports/:id` | Body: `{ status, removeListing? }` |

## Cron

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/cron/retrain` | `x-cron-secret` header matching `CRON_SECRET` | Recomputes cached recommendations for all recently-active users |
