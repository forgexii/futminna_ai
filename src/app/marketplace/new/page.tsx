/**
 * @file marketplace/new/page.tsx
 * @description New marketplace listing creation form with validation and safety acknowledgment.
 * 
 * MVP Specification Compliance:
 * - Section 6.2: Listing creation flow with title, category, price, condition, campus, and image.
 * - Section 6.8 & 18: Mandatory safety agreement checkbox prior to publishing.
 * - Security: Sanitization of input title and description, safe image URL validation (SEC-01, SEC-05).
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { SafetyBanner } from "@/components/shared/safety-banner";
import { useApp } from "@/lib/context/app-context";
import { CATEGORY_DETAILS } from "@/lib/data/mock-data";
import { ListingCategory, ListingCondition } from "@/types";
import { isSafeUrl, getSafeUrl, sanitizeText } from "@/lib/security/sanitize";
import { PlusCircle, ArrowLeft, Image as ImageIcon, ShieldCheck, Check } from "lucide-react";

/**
 * Listing submission page ensuring safe URL validation and safety policy acknowledgment.
 */
export default function CreateListingPage() {
  const router = useRouter();
  const { createListing, currentUser } = useApp();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ListingCategory>("textbooks");
  const [priceNgn, setPriceNgn] = useState<number | "">("");
  const [condition, setCondition] = useState<ListingCondition>("Good");
  const [campusLocation, setCampusLocation] = useState<"Gidan Kwano" | "Bosso" | "Both">("Gidan Kwano");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80");
  const [description, setDescription] = useState("");
  const [agreedToSafety, setAgreedToSafety] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = Object.keys(CATEGORY_DETAILS) as ListingCategory[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToSafety || !priceNgn) return;

    setSubmitting(true);

    const safeImage = isSafeUrl(imageUrl)
      ? imageUrl
      : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80";

    const newListing = createListing({
      title: sanitizeText(title, 120),
      category,
      priceNgn: Number(priceNgn),
      condition,
      campusLocation,
      images: [safeImage],
      description: sanitizeText(description, 3000),
      status: "active",
    });

    setTimeout(() => {
      setSubmitting(false);
      router.push(`/marketplace/${newListing.id}`);
    }, 600);
  };

  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs text-warmgray-500 hover:text-ink mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Marketplace
          </Link>

          <div className="rounded-2xl border border-warmgray-200 bg-white p-6 sm:p-8 shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-700">
                <PlusCircle className="h-4 w-4" />
                <span>Publish Campus Listing</span>
              </div>
              <h1 className="mt-1 font-display text-2xl font-bold text-ink">
                Create a Marketplace Listing
              </h1>
              <p className="mt-1 text-xs text-warmgray-500">
                List items for sale or rent to fellow FUTMINNA students. All listings are subject to campus community guidelines.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Item Title */}
              <div>
                <label className="text-xs font-semibold text-ink">Listing Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Engineering Mathematics by K.A. Stroud (7th Edition)"
                  className="mt-1.5 w-full rounded-xl border border-warmgray-200 p-3 text-xs text-ink outline-none focus:border-violet-500"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ListingCategory)}
                    className="mt-1.5 w-full rounded-xl border border-warmgray-200 bg-white p-2.5 text-xs text-ink outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_DETAILS[c].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink">Condition *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ListingCondition)}
                    className="mt-1.5 w-full rounded-xl border border-warmgray-200 bg-white p-2.5 text-xs text-ink outline-none"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Not Applicable">Not Applicable (Accommodation/Service)</option>
                  </select>
                </div>
              </div>

              {/* Price & Campus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink">Price in Naira (₦) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={priceNgn}
                    onChange={(e) => setPriceNgn(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 4500"
                    className="mt-1.5 w-full rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-violet-500 font-mono"
                  />
                  <p className="mt-1 text-[11px] text-warmgray-400">
                    Exact student price in Naira.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink">Campus Location *</label>
                  <select
                    value={campusLocation}
                    onChange={(e) => setCampusLocation(e.target.value as any)}
                    className="mt-1.5 w-full rounded-xl border border-warmgray-200 bg-white p-2.5 text-xs text-ink outline-none"
                  >
                    <option value="Gidan Kwano">Gidan Kwano Campus</option>
                    <option value="Bosso">Bosso Campus</option>
                    <option value="Both">Available on Both Campuses</option>
                  </select>
                </div>
              </div>

              {/* Image URL preview */}
              <div>
                <label className="text-xs font-semibold text-ink">Photo URL (Preview)</label>
                <div className="mt-1.5 flex gap-3 items-center">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-violet-500"
                  />
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-10 w-10 rounded-lg object-cover border border-warmgray-200 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-ink">Item Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information regarding the item, textbook edition, wear and tear, or lodge amenities..."
                  className="mt-1.5 w-full rounded-xl border border-warmgray-200 p-3 text-xs text-ink outline-none focus:border-violet-500"
                />
              </div>

              {/* Safety & Compliance Agreement */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="safetyCheck"
                    checked={agreedToSafety}
                    onChange={(e) => setAgreedToSafety(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-300 text-violet-600 focus:ring-violet-500"
                  />
                  <label htmlFor="safetyCheck" className="text-xs text-amber-950 leading-relaxed cursor-pointer">
                    <strong>FUTMINNA Acceptable Use & Integrity Undertaking:</strong> I confirm that this item is legally mine, not counterfeit, stolen, or related to academic examination malpractice. I agree to meet buyers only in designated public campus areas.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-3">
                <Link
                  href="/marketplace"
                  className="rounded-xl border border-warmgray-300 px-4 py-2 text-xs font-medium text-warmgray-700 hover:bg-warmgray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={!agreedToSafety || submitting}
                  className="rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition disabled:opacity-50"
                >
                  {submitting ? "Publishing Listing..." : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8">
            <SafetyBanner />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
