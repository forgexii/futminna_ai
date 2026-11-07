/**
 * Marketplace Domain Service
 * Encapsulates pure domain logic for listings filtering, search matching,
 * and state transition rules. Obeying Single Responsibility (SRP).
 */

import { Listing, ListingCategory, ListingStatus } from "@/types";
import { CATEGORY_DETAILS } from "@/lib/data/mock-data";

/**
 * Filter parameters for searching and narrowing campus marketplace listings.
 */
export interface MarketplaceFilterOptions {
  category?: string;
  campus?: string;
  condition?: string;
  searchQuery?: string;
  sortBy?: "newest" | "price_asc" | "price_desc";
}

export class MarketplaceService {
  /**
   * Filters and sorts active listings based on category, campus location, physical condition,
   * keyword matching across title/description/category label, and price/date ordering.
   *
   * @param listings - Array of raw listings from repository or state
   * @param options - Filter criteria selected by the student
   * @returns Filtered and sorted array of active listings
   */
  static filterListings(listings: Listing[], options: MarketplaceFilterOptions): Listing[] {
    const {
      category = "all",
      campus = "all",
      condition = "all",
      searchQuery = "",
      sortBy = "newest",
    } = options;

    return listings
      .filter((item) => {
        // Enforce visibility: only active listings are presented in public search
        if (item.status !== "active") return false;

        // Category filter
        if (category !== "all" && item.category !== category) return false;

        // Campus location filter (Gidan Kwano vs Bosso)
        if (campus !== "all" && item.campusLocation !== "Both" && item.campusLocation !== campus) {
          return false;
        }

        // Physical condition filter
        if (condition !== "all" && item.condition !== condition) return false;

        // Multi-field keyword search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesDesc = item.description.toLowerCase().includes(q);
          const catLabel = CATEGORY_DETAILS[item.category]?.label.toLowerCase() || "";
          const matchesCat = catLabel.includes(q);
          if (!matchesTitle && !matchesDesc && !matchesCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Deterministic sorting
        if (sortBy === "price_asc") return a.priceNgn - b.priceNgn;
        if (sortBy === "price_desc") return b.priceNgn - a.priceNgn;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  /**
   * State Machine validation: verifies whether a listing transition from
   * `currentStatus` to `nextStatus` complies with marketplace lifecycle policies (Section 6.2.3).
   *
   * @param currentStatus - Current lifecycle state
   * @param nextStatus - Target state requested
   * @returns true if transition is permissible under platform policy
   */
  static isValidStatusTransition(currentStatus: ListingStatus, nextStatus: ListingStatus): boolean {
    const validTransitions: Record<ListingStatus, ListingStatus[]> = {
      draft: ["pending_review", "active"],
      pending_review: ["active", "rejected"],
      active: ["paused", "sold", "removed"],
      paused: ["active", "sold", "removed"],
      sold: ["active", "removed"],
      rejected: ["pending_review"],
      removed: ["active"],
    };

    return validTransitions[currentStatus]?.includes(nextStatus) ?? false;
  }
}
