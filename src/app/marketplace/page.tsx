/**
 * @file marketplace/page.tsx
 * @description Campus Marketplace catalog view with faceted filtering and search.
 * 
 * MVP Specification Compliance:
 * - Section 6.2: Searchable marketplace listings with categories, filters, and seller profiles.
 * - Architecture: Delegates filtering, price capping, condition filtering, and sorting to `MarketplaceService` (SRP).
 * - Next.js App Router: Encloses `useSearchParams` in `<Suspense>` boundary to guarantee static build compatibility.
 */

"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { TrustBadge } from "@/components/shared/trust-badge";
import { SafetyBanner } from "@/components/shared/safety-banner";
import { useApp } from "@/lib/context/app-context";
import { CATEGORY_DETAILS } from "@/lib/data/mock-data";
import { ListingCategory, ListingCondition } from "@/types";
import { MarketplaceService } from "@/modules/marketplace/services/marketplace.service";
import { ListingCard } from "@/modules/marketplace/components/listing-card";
import {
  Search,
  Filter,
  PlusCircle,
  Heart,
  MapPin,
  Tag,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";

/**
 * Inner component utilizing URL search parameters to filter listings.
 */
function MarketplaceContent() {
  const { listings, favorites, toggleFavorite } = useApp();
  const searchParams = useSearchParams();

  // Search & Filter state
  const initialCategory = (searchParams.get("cat") as ListingCategory) || "all";
  const initialQuery = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");

  const categories = Object.keys(CATEGORY_DETAILS) as ListingCategory[];

  // Domain Service separation (SRP & Clean Architecture)
  const filteredListings = useMemo(() => {
    return MarketplaceService.filterListings(listings, {
      category: selectedCategory,
      campus: selectedCampus,
      condition: selectedCondition,
      searchQuery,
      sortBy,
    });
  }, [listings, selectedCategory, selectedCampus, selectedCondition, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSelectedCampus("all");
    setSelectedCondition("all");
    setSortBy("newest");
  };

  return (
    <>
      {/* Marketplace Header */}
      <div className="border-b border-warmgray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-700">
                <ShoppingBag className="h-4 w-4" />
                <span>FUTMINNA Campus Marketplace (8 Categories)</span>
              </div>
              <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
                Student Marketplace
              </h1>
              <p className="mt-1 text-xs text-warmgray-500">
                Buy, sell, or rent textbooks, electronics, and supplies directly with verified FUTMINNA students.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/marketplace/new"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Post a Listing</span>
              </Link>
            </div>
          </div>

          {/* Category horizontal scroll/pills */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === "all"
                  ? "bg-ink text-white"
                  : "bg-warmgray-100 text-warmgray-700 hover:bg-warmgray-200"
              }`}
            >
              All Categories ({listings.filter((l) => l.status === "active").length})
            </button>
            {categories.map((catKey) => {
              const count = listings.filter((l) => l.category === catKey && l.status === "active").length;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === catKey
                      ? "bg-violet-600 text-white"
                      : "bg-warmgray-100 text-warmgray-700 hover:bg-warmgray-200"
                  }`}
                >
                  {CATEGORY_DETAILS[catKey].label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area: Filters + Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top search & sorting toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-warmgray-200 bg-white p-3 shadow-sm mb-6">
          <div className="relative w-full sm:w-96 flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-warmgray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, textbooks, calculators, lodges..."
              className="w-full rounded-xl pl-10 pr-4 py-2 text-xs outline-none text-ink border border-warmgray-200 focus:border-violet-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end text-xs">
            {/* Campus filter */}
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="rounded-lg border border-warmgray-200 bg-warmgray-50 px-2.5 py-1.5 text-xs text-ink outline-none"
            >
              <option value="all">All Campuses</option>
              <option value="Gidan Kwano">Gidan Kwano Campus</option>
              <option value="Bosso">Bosso Campus</option>
            </select>

            {/* Condition filter */}
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="rounded-lg border border-warmgray-200 bg-warmgray-50 px-2.5 py-1.5 text-xs text-ink outline-none"
            >
              <option value="all">All Conditions</option>
              <option value="Brand New">Brand New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-warmgray-200 bg-warmgray-50 px-2.5 py-1.5 text-xs text-ink outline-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            {(selectedCategory !== "all" ||
              selectedCampus !== "all" ||
              selectedCondition !== "all" ||
              searchQuery !== "") && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
                title="Reset filters"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Results Count & Safety Warning */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-warmgray-500">
          <p>
            Showing <strong>{filteredListings.length}</strong> active listings
          </p>
          <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>Campus policy: Meet in safe daytime public spots (SEET, Library, Senate car park).</span>
          </div>
        </div>

        {/* Listings Grid (DRY component reuse) */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                isSaved={favorites.includes(item.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-warmgray-300 bg-white p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-warmgray-300" />
            <h3 className="mt-3 text-sm font-bold text-ink">No matching listings found</h3>
            <p className="mt-1 text-xs text-warmgray-500">
              Try clearing your search query or adjusting your campus and category filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset all filters
            </button>
          </div>
        )}

        <div className="mt-12">
          <SafetyBanner />
        </div>
      </div>
    </>
  );
}

export default function MarketplacePage() {
  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs text-warmgray-500">Loading marketplace...</div>}>
          <MarketplaceContent />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
