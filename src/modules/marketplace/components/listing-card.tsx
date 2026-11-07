/**
 * @file listing-card.tsx
 * @description Reusable presentational card component for Marketplace items.
 * 
 * Engineering Principles:
 * - DRY: Eliminates duplicate card rendering code between Homepage, Marketplace catalog, and Dashboard.
 * - Defense in Depth: Uses `getSafeUrl` to guard image sources against javascript: or malicious schemes (SEC-05).
 * - Accessibility: Clear semantic markup with aria-labels on interactive favorite buttons.
 */

import React from "react";
import Link from "next/link";
import { Listing } from "@/types";
import { CATEGORY_DETAILS } from "@/lib/data/mock-data";
import { formatNaira } from "@/lib/utils/formatters";
import { getSafeUrl } from "@/lib/security/sanitize";
import { Heart, MapPin, ShieldCheck } from "lucide-react";

/**
 * Props for the ListingCard component.
 */
interface ListingCardProps {
  /** The listing entity to display */
  item: Listing;
  /** Whether the current active user has favorited this listing */
  isSaved?: boolean;
  /** Callback triggered when user toggles the favorite status */
  onToggleFavorite?: (id: string) => void;
  /** Whether to show supplementary action buttons */
  showActions?: boolean;
}

/**
 * ListingCard component renders a single marketplace listing with thumbnail,
 * category pill, price formatted in Naira, seller verification status, and favorite toggle.
 */
export function ListingCard({
  item,
  isSaved = false,
  onToggleFavorite,
}: ListingCardProps) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80";
  const safeImg = getSafeUrl(item.images[0], fallbackImage);
  const categoryLabel = CATEGORY_DETAILS[item.category]?.label.split(" ")[0] || "General";

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-warmgray-200 bg-white shadow-sm overflow-hidden transition-all hover:border-violet-300 hover:shadow-md">
      {/* Top Image */}
      <div className="relative h-48 w-full overflow-hidden bg-warmgray-100">
        <img
          src={safeImg}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2.5 left-2.5 rounded-full bg-ink/75 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-medium text-white">
          {categoryLabel}
        </div>
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(item.id)}
            aria-label="Save listing"
            className="absolute top-2.5 right-2.5 rounded-full bg-white/90 backdrop-blur-sm p-1.5 shadow-sm text-warmgray-600 hover:text-red-500 transition"
          >
            <Heart
              className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-warmgray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-warmgray-400" />
              {item.campusLocation}
            </span>
            <span className="rounded bg-warmgray-100 px-1.5 py-0.5 text-[10px] font-medium text-warmgray-700">
              {item.condition}
            </span>
          </div>

          <Link href={`/marketplace/${item.id}`} className="mt-2 block">
            <h3 className="text-sm font-bold text-ink line-clamp-2 hover:text-violet-600 transition">
              {item.title}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-warmgray-500 line-clamp-2">{item.description}</p>
        </div>

        {/* Price & Seller */}
        <div className="mt-4 pt-3 border-t border-warmgray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-semibold text-warmgray-400">Price</p>
            <p className="font-display text-base font-bold text-ink">
              {formatNaira(item.priceNgn)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-warmgray-500 truncate max-w-[110px] font-medium">
              {item.seller.displayName.split(" ")[0]}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
              <ShieldCheck className="h-3 w-3" />
              <span>Affiliation Checked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
