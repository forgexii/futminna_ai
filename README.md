# FUTMINNA AI - Minimum Viable Product (MVP v1.0)

A structured digital campus ecosystem for students and faculty of the **Federal University of Technology, Minna (FUTMINNA)**, Nigeria.

> **Disclaimer:** FUTMINNA AI is an independent student platform built for the FUTMINNA community. It is not officially owned, endorsed, or operated by university administration.

---

## 1. Executive Summary & MVP Scope

FUTMINNA AI replaces fragmented, unverified WhatsApp and Telegram group chats with a unified, trust-scored campus utility platform:

1. **Campus Marketplace**: Peer-to-peer commerce across 8 categories (Textbooks & Learning, Electronics, Accommodation, Services, Food, Fashion, Project Materials, Other Needs) with search, filters, saved favourites, and in-app messaging.
2. **Course Tutoring**: Discovery indexed by university course codes (`MAT201`, `CSC301`, `PHY102`, etc.), screened tutor profiles, availability scheduling, booking management, and ratings.
3. **Campus Knowledge Assistant**: Evidence-grounded conversational assistant that cites approved Senate circulars, registration memos, and hostel regulations. Includes safe refusal guardrails against guessing sensitive dates or fees.
4. **Trust & Affiliation Verification**: Transparent trust indicators (Email verified, Campus affiliation reviewed, Approved tutor badge, completed interaction counters, and rating reviews).
5. **Admin & Moderation Operations**: Central queue for student affiliation verification, tutor credential approvals, listing moderation, user reports (&lt;24hr response target), and knowledge-base management.
6. **Audit Trail**: Immutable logging of all privileged administrative decisions.

---

## 2. Technology Architecture

Built as a **modular monolith** with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**:

```text
src/
├── app/
│   ├── layout.tsx              # Root HTML & AppProvider wrapper
│   ├── page.tsx                # Public Landing Page & Search Hub
│   ├── features/page.tsx       # 6 Modules Overview
│   ├── marketplace/
│   │   ├── page.tsx            # Search & 8 Categories Filtering
│   │   ├── [id]/page.tsx       # Listing Detail, Seller Trust & Inquiry
│   │   └── new/page.tsx        # Post Listing with Safety Undertaking
│   ├── tutoring/
│   │   ├── page.tsx            # Course Code Search & Tutor Directory
│   │   ├── [id]/page.tsx       # Tutor Profile & Booking Request Form
│   │   └── apply/page.tsx      # Tutor Onboarding Application
│   ├── assistant/page.tsx      # Grounded AI Chat with Citations & Fallback
│   ├── dashboard/page.tsx      # Student Hub: Listings, Bookings, Messages, Verification
│   ├── admin/page.tsx          # Staff Console: Verifications, Tutors, Reports, Audit
│   ├── safety/page.tsx         # Meetup Zones & Anti-Scam Guidance
│   ├── terms/page.tsx          # Terms of Service & Academic Integrity
│   └── privacy/page.tsx        # Nigeria Data Protection Act (NDPA) Notice
├── components/
│   ├── layout/
│   │   ├── public-navbar.tsx   # Navigation & Role Switcher
│   │   └── public-footer.tsx   # Disclaimers & Campus Links
│   └── shared/
│       ├── pin-tab.tsx         # Decorative visual tabs
│       ├── trust-badge.tsx     # Affiliation & Review Badges
│       └── safety-banner.tsx   # Anti-Scam Meetup Guidance
├── lib/
│   ├── context/app-context.tsx # Interactive Application State Store
│   └── data/mock-data.ts       # Realistic FUTMINNA Seed Data
└── types/
    └── index.ts                # TypeScript domain models (Section 10)
```

---

## 3. Quickstart & Development

### Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, or yarn

### Installation
```bash
# Install dependencies
npm install

# Run the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 4. Persona Testing Switcher

The top navbar includes an interactive **Role Testing Switcher** to test permissions across all MVP user roles:
* **Abubakar Mohammed** (`student`, Verified 400L Computer Engineering)
* **Zainab Ibrahim** (`tutor`, Approved 500L Mathematics)
* **Campus Ops Moderator** (`admin`, Platform Moderator Desk)

---

## 5. Security, Privacy & Compliance (NDPA)

- **Student Verification Privacy**: Student matriculation records are accessible only to platform administrators and never exposed publicly.
- **AI Anti-Hallucination Guardrails**: The Campus Assistant answers strictly from approved knowledge sources; unverified claims or off-syllabus queries trigger safe refusal fallbacks.
- **Escrow Disclaimer**: In this MVP phase, self-operated escrow is excluded. Payments follow direct handover or approved Paystack provider checkout.
