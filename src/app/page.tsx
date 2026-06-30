import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { PinTab } from "@/components/shared/pin-tab";
import {
  ShoppingBag,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Star,
  BookOpen,
  Laptop,
  Home as HomeIcon,
} from "lucide-react";

const FEATURE_CARDS = [
  {
    icon: ShoppingBag,
    title: "Buy & sell on campus",
    body: "Textbooks, electronics, accommodation, food and more — listed by verified FUTMINNA students, not strangers.",
    pin: "gold" as const,
  },
  {
    icon: GraduationCap,
    title: "Book a peer tutor",
    body: "Search by course code — MAT201, CSC301, PHY102 — and book a session with someone who's already passed it.",
    pin: "violet" as const,
  },
  {
    icon: Sparkles,
    title: "Recommendations that learn",
    body: "A hybrid AI model learns from what students like you click, search and book — with trending picks for new accounts.",
    pin: "emerald" as const,
  },
  {
    icon: ShieldCheck,
    title: "Trust scores, not guesswork",
    body: "Every buyer, seller and tutor carries a transparent trust score built from verification, ratings and history.",
    pin: "gold" as const,
  },
];

const STEPS = [
  { label: "Verify your FUTMINNA email", body: "Sign up in under a minute — your school email is your campus ID here." },
  { label: "Browse, search or list", body: "Find what you need by course code or category, or list what you're selling." },
  { label: "Pay safely, meet up", body: "Payments are held until you confirm — no more sending money and hoping." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />

      <main className="flex-1">
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-background to-background">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-violet-200/50 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-40 left-[-10%] h-[320px] w-[320px] rounded-full bg-gold-100/70 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-100/70 px-3 py-1 text-xs font-semibold text-violet-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Built for FUTMINNA, Minna
                </span>

                <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
                  One campus app, instead of <span className="text-violet-700">forty WhatsApp groups.</span>
                </h1>

                <p className="mt-5 max-w-lg text-base leading-relaxed text-warmgray-600 sm:text-lg">
                  Buy and sell with classmates, book a peer tutor by course code, and ask a campus assistant —
                  all in one fast, trust-scored, low-data platform built for how FUTMINNA students actually live.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg">
                    <Link href="/register">
                      Create your free account
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/marketplace">Browse the marketplace</Link>
                  </Button>
                </div>

                <div className="mt-9 flex items-center gap-6 text-sm text-warmgray-500">
                  <div>
                    <p className="font-display text-2xl font-semibold text-ink">2,400+</p>
                    <p>active students</p>
                  </div>
                  <div className="h-9 w-px bg-warmgray-200" />
                  <div>
                    <p className="font-display text-2xl font-semibold text-ink">180+</p>
                    <p>verified tutors</p>
                  </div>
                  <div className="h-9 w-px bg-warmgray-200" />
                  <div>
                    <p className="font-display text-2xl font-semibold text-ink">4.8<span className="text-base">/5</span></p>
                    <p>avg. trust rating</p>
                  </div>
                </div>
              </div>

              {/* Noticeboard-style stacked card visual — the signature element */}
              <div className="relative mx-auto w-full max-w-md lg:mx-0">
                <div className="relative rotate-[-2deg] rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-lift)]">
                  <PinTab color="gold" />
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">Engineering Mathematics — Stroud</p>
                      <p className="mt-0.5 text-xs text-warmgray-500">Textbooks · used · ₦4,500</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gold-600">
                    <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                    Trust score 78 · verified seller
                  </div>
                </div>

                <div className="relative -mt-4 ml-8 rotate-[1.5deg] rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-lift)]">
                  <PinTab color="violet" />
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">CSC301 — Data Structures tutor</p>
                      <p className="mt-0.5 text-xs text-warmgray-500">₦2,000/hr · 89 sessions taught</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-violet-700">
                    "Recommended because students similar to you booked this tutor."
                  </p>
                </div>

                <div className="relative -mt-4 ml-2 rotate-[-1deg] rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-lift)]">
                  <PinTab color="emerald" />
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                      <HomeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">Self-contained room — Gidan Kwano</p>
                      <p className="mt-0.5 text-xs text-warmgray-500">Accommodation · ₦120,000/session</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Feature grid ---------- */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Everything fragmented across campus, in one place
            </h2>
            <p className="mt-3 text-warmgray-600">
              FUTMINNA AI replaces the noticeboards, the forwarded flyers, and the WhatsApp groups you've muted —
              with one app that actually knows what you need.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_CARDS.map((f) => (
              <div key={f.title} className="relative rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
                <PinTab color={f.pin} />
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-warmgray-500">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section className="bg-violet-950 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                From sign-up to your first deal, in three steps
              </h2>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.label} className="relative rounded-[var(--radius-card)] border border-white/10 bg-white/5 p-6">
                  <span className="font-display text-sm font-semibold text-gold-400">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-white">{s.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-violet-200">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            <Laptop className="h-5 w-5 text-violet-600" />
            <span className="text-sm font-medium text-warmgray-500">Works great on low-end Android phones too</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Your campus, organized. Free to join.
          </h2>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">
                Create your free account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/tutors">Find a tutor instead</Link>
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
