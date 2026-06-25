"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Loader2, Star, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PinTab } from "@/components/shared/pin-tab";
import { Button } from "@/components/ui/button";

interface TutorRow {
  tutor: {
    id: string;
    headline: string;
    expertiseAreas: string;
    hourlyRate: number;
    avgRating: number;
    ratingCount: number;
    totalSessions: number;
  };
  user: { id: string; name: string; department: string | null } | null;
}

export default function TutorsPage() {
  const [rows, setRows] = useState<TutorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fetchTutors = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    try {
      const res = await fetch(`/api/tutors?${params.toString()}`);
      const data = await res.json();
      setRows(data.tutors ?? []);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(fetchTutors, 250);
    return () => clearTimeout(t);
  }, [fetchTutors]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Find a tutor</h1>
          <p className="mt-1 text-sm text-warmgray-500">Search by course code — MAT201, CSC301, PHY102 — or by topic.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/tutors/apply">Become a tutor</Link>
        </Button>
      </div>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warmgray-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="MAT201, data structures, calculus…" className="pl-10" />
      </div>

      <div className="mt-7">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-warmgray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-warmgray-200 py-16 text-center text-sm text-warmgray-500">
            No tutors match that search yet.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row, i) => {
              const expertise: string[] = JSON.parse(row.tutor.expertiseAreas || "[]");
              return (
                <Link
                  key={row.tutor.id}
                  href={`/tutors/${row.tutor.id}`}
                  className="relative flex flex-col rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
                >
                  {i < 2 && <PinTab color={i === 0 ? "violet" : "emerald"} />}
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink">{row.user?.name}</p>
                  <p className="mt-0.5 text-xs text-warmgray-400">{row.user?.department}</p>
                  <p className="mt-2 text-sm leading-snug text-warmgray-600 line-clamp-2">{row.tutor.headline}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {expertise.slice(0, 3).map((e) => (
                      <span key={e} className="rounded-md bg-warmgray-100 px-1.5 py-0.5 font-mono-code text-[11px] font-medium text-warmgray-600">
                        {e}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-warmgray-100 pt-3">
                    <Badge variant="gold">
                      <Star className="h-3 w-3 fill-current" /> {row.tutor.avgRating.toFixed(1)} ({row.tutor.ratingCount})
                    </Badge>
                    <p className="font-display text-sm font-semibold text-violet-700">₦{row.tutor.hourlyRate.toLocaleString()}/hr</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
