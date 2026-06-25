import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { PinTab } from "@/components/shared/pin-tab";
import { Target, Users, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-100/70 px-3 py-1 text-xs font-semibold text-violet-700">
            About FUTMINNA AI
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Built by students who got tired of scrolling group chats
          </h1>
          <p className="mt-5 text-base leading-relaxed text-warmgray-600">
            Every semester, the same things happen: a textbook gets sold three times over because nobody saw the
            WhatsApp message in time, a tutoring request gets buried under fifty unrelated forwards, and a hostel
            sublet falls through because there was no way to know if the person posting was trustworthy. FUTMINNA
            AI exists to fix that — one place, built specifically for how FUTMINNA students actually buy, sell,
            and help each other study.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="relative rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-6 shadow-[var(--shadow-soft)]">
              <PinTab color="gold" />
              <Target className="h-8 w-8 text-violet-700" />
              <h2 className="mt-4 font-display text-base font-semibold text-ink">Our focus</h2>
              <p className="mt-2 text-sm leading-relaxed text-warmgray-500">
                Reduce the fragmentation of campus commerce and peer learning into one fast, low-data platform —
                not another app that demands a fast connection you don't have.
              </p>
            </div>
            <div className="relative rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-6 shadow-[var(--shadow-soft)]">
              <PinTab color="violet" />
              <Users className="h-8 w-8 text-violet-700" />
              <h2 className="mt-4 font-display text-base font-semibold text-ink">Who it's for</h2>
              <p className="mt-2 text-sm leading-relaxed text-warmgray-500">
                Every FUTMINNA student with a school email — whether you're selling a textbook, tutoring MAT201,
                or just trying to find a calculator before tomorrow's exam.
              </p>
            </div>
            <div className="relative rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-6 shadow-[var(--shadow-soft)]">
              <PinTab color="emerald" />
              <ShieldCheck className="h-8 w-8 text-violet-700" />
              <h2 className="mt-4 font-display text-base font-semibold text-ink">Why trust matters</h2>
              <p className="mt-2 text-sm leading-relaxed text-warmgray-500">
                Trust scores, verification and escrow-style payments exist because campus commerce works best
                when you don't have to gamble on a stranger online.
              </p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
