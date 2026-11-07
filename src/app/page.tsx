/**
 * @file page.tsx
 * @description Landing page for FUTMINNA AI ecosystem.
 * 
 * MVP Specification Compliance:
 * - Section 1 & 2: Central entry point introducing Marketplace, Tutoring, and AI Assistant.
 * - Section 6.5: Rule-based explainable recommendation showcase ("Trending across Bosso & Gidan Kwano").
 * - Section 18: Campus safety & safe meetup guidance prominently featured.
 * - Criterion 6.3.3: Strict filter ensuring only approved tutors and active listings appear.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { TrustBadge } from "@/components/shared/trust-badge";
import { SafetyBanner } from "@/components/shared/safety-banner";
import { ListingCard } from "@/modules/marketplace/components/listing-card";
import { TutorCard } from "@/modules/tutoring/components/tutor-card";
import { useApp } from "@/lib/context/app-context";
import { CATEGORY_DETAILS } from "@/lib/data/mock-data";
import { ListingCategory } from "@/types";
import {
  Search,
  ShoppingBag,
  GraduationCap,
  Sparkles,
  Bot,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  MapPin,
  Clock,
  Heart,
  TrendingUp,
  Award,
} from "lucide-react";

/**
 * Public homepage presenting hero search, category discovery, spotlight listings,
 * featured academic tutors, safety tips, and AI assistant prompt shortcuts.
 */
export default function HomePage() {
  const { listings, tutors, favorites, toggleFavorite, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"marketplace" | "tutors">("marketplace");

  const activeListings = listings.filter((l) => l.status === "active").slice(0, 4);
  const approvedTutors = tutors.filter((t) => t.applicationStatus === "approved").slice(0, 3);

  const categories = Object.keys(CATEGORY_DETAILS) as ListingCategory[];

  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-warmgray-200 bg-gradient-to-b from-white via-violet-50/20 to-warmgray-50 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-100/70 px-3.5 py-1 text-xs font-semibold text-violet-800 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                <span>The Verified Campus Hub for FUTMINNA</span>
              </div>

              {/* Main Headline */}
              <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                One trusted campus platform.{" "}
                <span className="text-violet-600">Zero WhatsApp chaos.</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-5 text-base sm:text-lg text-warmgray-600 leading-relaxed">
                Buy and sell textbooks, electronics, and project parts. Find verified peer tutors by course code (MAT201, CSC301, PHY102). Ask grounded campus questions with verified circular citations.
              </p>

              {/* Search Toggle Tabs */}
              <div className="mt-8 flex justify-center">
                <div className="inline-flex rounded-xl bg-warmgray-200/80 p-1 text-xs font-medium">
                  <button
                    onClick={() => setActiveTab("marketplace")}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 transition ${
                      activeTab === "marketplace"
                        ? "bg-white text-ink shadow-sm font-semibold"
                        : "text-warmgray-600 hover:text-ink"
                    }`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Search Marketplace
                  </button>
                  <button
                    onClick={() => setActiveTab("tutors")}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 transition ${
                      activeTab === "tutors"
                        ? "bg-white text-ink shadow-sm font-semibold"
                        : "text-warmgray-600 hover:text-ink"
                    }`}
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    Search Tutors by Course Code
                  </button>
                </div>
              </div>

              {/* Unified Search Bar */}
              <div className="mt-4 mx-auto max-w-2xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (activeTab === "marketplace") {
                      window.location.href = `/marketplace?q=${encodeURIComponent(searchQuery)}`;
                    } else {
                      window.location.href = `/tutoring?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-warmgray-200 bg-white p-2 shadow-lg"
                >
                  <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-3.5 h-4 w-4 text-warmgray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        activeTab === "marketplace"
                          ? "Search textbooks, calculators, hostels near Gidan Kwano..."
                          : "Enter course code (e.g. MAT201, CSC301, PHY102, CEE201)..."
                      }
                      className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none text-ink placeholder:text-warmgray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition"
                  >
                    <span>{activeTab === "marketplace" ? "Search Items" : "Find Tutors"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {/* Popular Tags */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-warmgray-500">
                  <span className="font-medium">Quick search:</span>
                  {activeTab === "marketplace" ? (
                    <>
                      <Link href="/marketplace?cat=textbooks" className="rounded-full bg-white px-2.5 py-1 border border-warmgray-200 hover:border-violet-300">
                        📚 Engineering Textbooks
                      </Link>
                      <Link href="/marketplace?cat=electronics" className="rounded-full bg-white px-2.5 py-1 border border-warmgray-200 hover:border-violet-300">
                        ⚡ Casio Calculators
                      </Link>
                      <Link href="/marketplace?cat=accommodation" className="rounded-full bg-white px-2.5 py-1 border border-warmgray-200 hover:border-violet-300">
                        🏠 Gidan Kwano Lodges
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/tutoring?q=MAT201" className="rounded-full bg-white px-2.5 py-1 border border-warmgray-200 hover:border-violet-300 font-mono">
                        MAT201
                      </Link>
                      <Link href="/tutoring?q=CSC301" className="rounded-full bg-white px-2.5 py-1 border border-warmgray-200 hover:border-violet-300 font-mono">
                        CSC301
                      </Link>
                      <Link href="/tutoring?q=PHY102" className="rounded-full bg-white px-2.5 py-1 border border-warmgray-200 hover:border-violet-300 font-mono">
                        PHY102
                      </Link>
                      <Link href="/tutoring?q=CHE201" className="rounded-full bg-white px-2.5 py-1 border border-warmgray-200 hover:border-violet-300 font-mono">
                        CHE201
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Trust Pillars */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-warmgray-200/80 pt-8 text-left">
                <div className="flex items-start gap-3 rounded-xl bg-white/70 p-3.5 border border-warmgray-100">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-ink">FUTMINNA Affiliation Review</h2>
                    <p className="mt-0.5 text-[11px] text-warmgray-500">Student IDs checked to combat anonymous campus scams.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-white/70 p-3.5 border border-warmgray-100">
                  <div className="rounded-lg bg-violet-100 p-2 text-violet-700">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-ink">Approved Course Tutors</h2>
                    <p className="mt-0.5 text-[11px] text-warmgray-500">Peer tutors screened and indexed by actual university course codes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-white/70 p-3.5 border border-warmgray-100">
                  <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-ink">Grounded Campus AI</h2>
                    <p className="mt-0.5 text-[11px] text-warmgray-500">Cites official Senate circulars; never guesses deadlines or fees.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8 Categories Browse */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-600">Explore by Category</span>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Everything for campus life
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-800"
            >
              Browse all items &rarr;
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((catKey) => {
              const cat = CATEGORY_DETAILS[catKey];
              const count = listings.filter((l) => l.category === catKey && l.status === "active").length;
              return (
                <Link
                  key={catKey}
                  href={`/marketplace?cat=${catKey}`}
                  className="group rounded-2xl border border-warmgray-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white transition">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-ink group-hover:text-violet-700 transition">
                    {cat.label}
                  </h3>
                  <p className="mt-1 text-[11px] text-warmgray-500 line-clamp-2">{cat.description}</p>
                  <p className="mt-2 text-[10px] font-semibold text-violet-600">{count} active {count === 1 ? "item" : "items"}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Marketplace Listings */}
        <section className="border-t border-warmgray-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Trending on Gidan Kwano & Bosso
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Recent Verified Listings
                </h2>
              </div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline"
              >
                View all marketplace listings &rarr;
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeListings.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  isSaved={favorites.includes(item.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            <div className="mt-8">
              <SafetyBanner />
            </div>
          </div>
        </section>

        {/* Featured Course Tutors */}
        <section className="py-12 border-t border-warmgray-200 bg-warmgray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                  Academic Peer Support
                </span>
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Approved Course Tutors
                </h2>
                <p className="mt-1 text-xs text-warmgray-500">
                  Search by your course code to find peer tutors who scored an A in MAT201, CSC301, PHY102 & more.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/tutoring/apply"
                  className="rounded-xl border border-violet-300 bg-white px-3.5 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50 transition"
                >
                  Apply to Tutor
                </Link>
                <Link
                  href="/tutoring"
                  className="rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 transition"
                >
                  View All Tutors &rarr;
                </Link>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {approvedTutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          </div>
        </section>

        {/* Campus Assistant Highlight (Section 6.6 & 13) */}
        <section className="border-t border-warmgray-200 bg-gradient-to-r from-violet-900 to-indigo-950 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-800/80 px-3 py-1 text-xs font-medium text-violet-200 border border-violet-700">
                  <Bot className="h-3.5 w-3.5" />
                  Evidence-Grounded AI Assistant
                </span>
                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                  Get campus answers with cited official circulars.
                </h2>
                <p className="mt-4 text-sm text-violet-200 leading-relaxed">
                  Unlike generic AI chatbots that invent academic dates or hallucinate deadlines, the FUTMINNA Campus Assistant grounds every answer in approved Senate calendar circulars, Bursary memos, and e-portal registration guidelines.
                </p>

                <div className="mt-6 space-y-3 text-xs text-violet-100">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Explicit document citations for every factual statement</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Safe refusal: explicitly declines to guess sensitive or unverified dates</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Zero access to private student records or account data</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <Link
                    href="/assistant"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-violet-950 shadow-md hover:bg-violet-50 transition"
                  >
                    <span>Ask Campus Assistant</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/features"
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-800/50 transition"
                  >
                    View System Specs
                  </Link>
                </div>
              </div>

              {/* Interactive preview card */}
              <div className="rounded-2xl border border-violet-800/60 bg-violet-900/60 p-6 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-2 border-b border-violet-800 pb-3 text-xs font-medium text-violet-200">
                  <Bot className="h-4 w-4 text-violet-300" />
                  <span>Live Grounded Assistant Preview</span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-violet-800/60 p-3 text-xs text-white">
                    <p className="font-semibold text-violet-300 text-[11px]">Student Query:</p>
                    <p className="mt-0.5">"When do first semester lectures resume for 2026/2027?"</p>
                  </div>

                  <div className="rounded-xl bg-white p-4 text-xs text-ink shadow-sm space-y-2">
                    <div className="flex items-center gap-1.5 text-violet-700 font-semibold text-[11px]">
                      <Sparkles className="h-3 w-3" />
                      <span>Assistant Answer:</span>
                    </div>
                    <p className="text-warmgray-700 leading-relaxed">
                      According to the approved FUTMINNA Academic Calendar for the 2026/2027 session, lectures commence on <strong>10th November 2026</strong> across both Gidan Kwano and Bosso campuses.
                    </p>
                    <div className="pt-2 border-t border-warmgray-100 flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-md border border-emerald-200">
                      <Award className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Cited Source:</strong> Senate Approved Document Vol. 44, Circular No. 12 (Effective Oct 15, 2026)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
