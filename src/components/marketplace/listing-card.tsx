"use client";

import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { PinTab } from "@/components/shared/pin-tab";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like new",
  used: "Used",
  fair: "Fair",
};

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  condition: string;
  location?: string | null;
  categoryName?: string | null;
  favoriteCount?: number;
  isFeatured?: boolean;
  pin?: "gold" | "violet" | "emerald";
}

export function ListingCard({ id, title, price, condition, location, categoryName, favoriteCount, isFeatured, pin = "gold" }: ListingCardProps) {
  return (
    <Link
      href={`/marketplace/${id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-warmgray-100 bg-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
      )}
    >
      {isFeatured && <PinTab color={pin} />}

      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-violet-50 to-warmgray-50 text-violet-200">
        <span className="font-display text-3xl font-semibold">{title.charAt(0)}</span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug text-ink line-clamp-2">{title}</p>
          {favoriteCount !== undefined && favoriteCount > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-warmgray-400">
              <Heart className="h-3 w-3" /> {favoriteCount}
            </span>
          )}
        </div>
        <p className="font-display text-base font-semibold text-violet-700">₦{price.toLocaleString()}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {categoryName && <Badge variant="neutral">{categoryName}</Badge>}
          <Badge variant="outline">{CONDITION_LABELS[condition] ?? condition}</Badge>
        </div>
        {location && (
          <p className="mt-1 flex items-center gap-1 text-xs text-warmgray-400">
            <MapPin className="h-3 w-3" /> {location}
          </p>
        )}
      </div>
    </Link>
  );
}
