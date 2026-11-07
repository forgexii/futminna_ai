/**
 * @file features/page.tsx
 * @description Detailed platform capability matrix highlighting the 6 core pillars of FUTMINNA AI.
 * 
 * MVP Specification Compliance:
 * - Documents Marketplace, Tutoring, Campus Knowledge Assistant, Trust & Identity,
 *   Moderation/Safety, and Transparent Pricing architecture.
 */

import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { PinTab } from "@/components/shared/pin-tab";
import {
  ShoppingBag, GraduationCap, Sparkles, MessageCircle, Wallet, BarChart3, Search,
} from "lucide-react";

const MODULES = [
  {
    icon: ShoppingBag,
    title: "Marketplace",
    pin: "gold" as const,
    points: [
      "List items across 8 categories: textbooks, electronics, accommodation, services, food, fashion, project materials & more",
      "Search, filter by price/condition, and save favorites",
      "In-app messaging with sellers before you commit",
      "Report a listing or seller in two taps",
    ],
  },
  {
    icon: GraduationCap,
    title: "Tutoring",
    pin: "violet" as const,
    points: [
      "Search tutors by course code: MAT201, CSC301, PHY102 and more",
      "See expertise areas, hourly rate, availability and verified ratings before booking",
      "Tutors set their own schedule and price; you book a slot that works for you",
      "Earnings dashboard for tutors, with session history and total payout",
    ],
  },
  {
    icon: Sparkles,
    title: "AI recommendations",
    pin: "emerald" as const,
    points: [
      "A hybrid engine blends collaborative filtering (60%) with content-based matching (40%)",
      "New accounts see trending listings and popular tutors until there's enough history",
      "Every recommendation comes with a plain-language reason",
      "Refreshes roughly every 24 hours as your activity changes",
    ],
  },
  {
    icon: MessageCircle,
    title: "Campus assistant",
    pin: "gold" as const,
    points: [
      "Ask about registration deadlines, academic calendar, or campus services",
      "Answers are grounded in a campus knowledge base, with sources cited",
      "Get help navigating the platform itself: bookings, payments, trust scores",
      "Built to say \"I don't know\" rather than guess at sensitive academic dates",
    ],
  },
  {
    icon: Wallet,
    title: "Payments & trust",
    pin: "violet" as const,
    points: [
      "Secure checkout via Paystack, Nigeria's widely-trusted payment processor",
      "Orders above ₦5,000 are held until you confirm receipt",
      "Every user carries a transparent trust score from verification, ratings & history",
      "Dispute resolution reviewed by the moderation team",
    ],
  },
  {
    icon: BarChart3,
    title: "For administrators",
    pin: "emerald" as const,
    points: [
      "Moderate reported content and resolve disputes from one queue",
      "Review and approve tutor applications before they go live",
      "Platform-wide analytics: GMV, booking completion, category trends",
      "Verify student accounts to raise trust scores platform-wide",
    ],
  },
];

/**
 * Platform feature breakdown for incoming students and university stakeholders.
 */
export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-10 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-100/70 px-3 py-1 text-xs font-semibold text-violet-700">
            <Search className="h-3.5 w-3.5" />
            What's inside
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Six modules, one trust-scored campus
          </h1>
          <p className="mt-4 text-warmgray-600">
            Every part of FUTMINNA AI is built around the same idea: students should be able to trust who
            they're dealing with, without needing forty different group chats to figure it out.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {MODULES.map((m) => (
              <div key={m.title} className="relative rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-7 shadow-[var(--shadow-soft)]">
                <PinTab color={m.pin} />
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <m.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-ink">{m.title}</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {m.points.map((p) => (
                    <li key={p} className="flex gap-2 text-sm leading-relaxed text-warmgray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
