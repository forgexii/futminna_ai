# Administrator Guide — FUTMINNA AI

## Accessing the admin area

Sign in with an account that has `role: "admin"` (the seed script creates `admin@futminna.edu.ng` / `Password123!`). The sidebar will show an "Admin" section; navigating to any `/admin/*` page as a non-admin redirects you to the regular dashboard.

## Overview page (`/admin`)

A snapshot of platform health: total users (and growth in the last 7 days), GMV from completed orders, active listings, booking completion rate, pending tutor applications, and open reports.

## Verifying users (`/admin/users`)

Search by name or email. Each row shows the user's current trust score. Click **Verify** to mark a user's `verificationStatus` as `verified` — this immediately recomputes their trust score (verification is worth up to 20 of the 100 points) and sends them a notification. **Suspend** sets `suspended: true` and notifies the user; there is currently no UI to un-suspend a user from the table directly — do this via the API (`PATCH /api/admin/users/:id` with `{"suspended": false}`) until a dedicated control is added.

## Reviewing tutor applications (`/admin/tutors`)

Three tabs: Pending, Approved, Rejected. For each pending application you can see the applicant's headline, bio, course codes (expertise areas), and proposed hourly rate. **Approve** makes their profile publicly bookable immediately. **Reject** notifies the applicant; they can edit and reapply (the current implementation allows only one tutor profile per user, so "reapplying" today means contacting support to reset their existing profile's status back to pending — a self-service edit-and-resubmit flow would be a good follow-up addition).

## Handling reports (`/admin/reports`)

Shows all reports with `status: "open"`. For listing reports, **Remove listing** resolves the report and soft-deletes the listing in one action. **Dismiss** closes the report with no action taken. **Resolve** closes it without removing anything (use this once you've handled the issue manually, e.g. contacted the user).

## Things that are intentionally manual in this version

- There's no automated fraud detection — trust scores are a transparency tool, not a blocking gate. Use judgment.
- Dispute resolution on orders (`status: "disputed"`) surfaces in the reports/orders data but doesn't yet have a dedicated "resolve dispute and refund" admin action — handle these directly via Paystack's dashboard for refunds, then update the order's status via the database or a future admin endpoint.
- There is no bulk-action UI (e.g. approve 10 tutors at once). Each action is one click per item, by design, since tutor approval especially benefits from individual review.
