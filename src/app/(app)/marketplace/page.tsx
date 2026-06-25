"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ListingCard } from "@/components/marketplace/listing-card";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ListingRow {
  listing: {
    id: string;
    title: string;
    price: number;
    condition: string;
    location: string | null;
    favoriteCount: number;
  };
  category: { id: string; name: string } | null;
}

export default function MarketplacePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [listingRows, setListingRows] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category !== "all") params.set("category", category);
    params.set("sort", sort);

    try {
      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      setListingRows(data.listings ?? []);
    } finally {
      setLoading(false);
    }
  }, [q, category, sort]);

  useEffect(() => {
    const t = setTimeout(fetchListings, 250);
    return () => clearTimeout(t);
  }, [fetchListings]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Marketplace</h1>
          <p className="mt-1 text-sm text-warmgray-500">Textbooks, electronics, accommodation & more — from verified students.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warmgray-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search textbooks, calculators, laptops…"
            className="pl-10"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-44">
            <SlidersHorizontal className="h-3.5 w-3.5 text-warmgray-400" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price: low to high</SelectItem>
            <SelectItem value="price_desc">Price: high to low</SelectItem>
            <SelectItem value="popular">Most popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(category === c.slug ? "all" : c.slug)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              category === c.slug
                ? "border-violet-600 bg-violet-700 text-white"
                : "border-warmgray-200 bg-white text-warmgray-600 hover:border-violet-300"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-7">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-warmgray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : listingRows.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-warmgray-200 py-16 text-center text-sm text-warmgray-500">
            No listings match your search yet. Try a different term or category.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listingRows.map((row, i) => (
              <ListingCard
                key={row.listing.id}
                id={row.listing.id}
                title={row.listing.title}
                price={row.listing.price}
                condition={row.listing.condition}
                location={row.listing.location}
                categoryName={row.category?.name}
                favoriteCount={row.listing.favoriteCount}
                isFeatured={i < 2}
                pin={i % 2 === 0 ? "gold" : "violet"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
