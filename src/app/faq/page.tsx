"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Who can join FUTMINNA AI?",
    a: "Any current FUTMINNA student with a school email address. Registration requires a FUTMINNA email so the platform stays campus-only.",
  },
  {
    q: "How does escrow work on the marketplace?",
    a: "For orders above ₦5,000, payment is held by the platform until you confirm you've received the item. If something goes wrong, you can raise a dispute instead of confirming, and our moderation team reviews it.",
  },
  {
    q: "How is my trust score calculated?",
    a: "It's a 0–100 score built from five factors: verification status, number of completed transactions, average rating from others, responsiveness, and any dispute history. It updates automatically as you transact.",
  },
  {
    q: "How do I become a tutor?",
    a: "Apply from your dashboard with your expertise areas, hourly rate, and availability. An administrator reviews and approves applications before your profile becomes publicly bookable.",
  },
  {
    q: "What payment method is used?",
    a: "Payments run through Paystack, a widely-used Nigerian payment processor supporting cards and bank transfers.",
  },
  {
    q: "How does the AI campus assistant decide what to answer?",
    a: "It retrieves the most relevant documents from a campus knowledge base (academic calendar, policies, course info) and answers only from those — it's built to say it doesn't know rather than guess at sensitive academic details.",
  },
  {
    q: "How are recommendations generated?",
    a: "A hybrid model blends what similar students have engaged with (60%) and your own browsing/search/booking history (40%). New accounts see trending listings and popular tutors instead until there's enough activity to personalize.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mt-4 text-warmgray-600">
            Can't find what you're looking for? The campus assistant in the bottom-right corner can help, or
            <a href="/contact" className="text-violet-700 underline-offset-2 hover:underline"> reach out directly</a>.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            {FAQS.map((item, i) => (
              <div key={item.q} className="overflow-hidden rounded-[var(--radius-card)] border border-warmgray-100 bg-white">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium text-ink">{item.q}</span>
                  <ChevronDown
                    className={cn("h-4 w-4 shrink-0 text-violet-600 transition-transform", open === i && "rotate-180")}
                  />
                </button>
                <div className={cn("grid transition-all", open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-warmgray-600">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
