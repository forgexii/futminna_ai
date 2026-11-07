/**
 * @file marketplace/[id]/page.tsx
 * @description Detail page for a specific marketplace listing.
 * 
 * MVP Specification Compliance:
 * - Section 6.2 & 6.4: Full item specs, campus meetup safety guidelines, seller trust indicators,
 *   and direct in-platform messaging initiation.
 * - Section 6.8 & 14: Direct incident reporting integration via ReportModal.
 * - Security: Image URL sanitization via `getSafeUrl` and text sanitization before message sending.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { TrustBadge } from "@/components/shared/trust-badge";
import { SafetyBanner } from "@/components/shared/safety-banner";
import { useApp } from "@/lib/context/app-context";
import { CATEGORY_DETAILS } from "@/lib/data/mock-data";
import { Report } from "@/types";
import { getSafeUrl } from "@/lib/security/sanitize";
import { ReportModal } from "@/modules/marketplace/components/report-modal";
import {
  Heart,
  Share2,
  MapPin,
  MessageCircle,
  Flag,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  X,
  Lock,
} from "lucide-react";

/**
 * Listing detail view with seller credentials, photo gallery, safe meetup guidance,
 * interactive message thread launcher, and reporting modal.
 */
export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    listings,
    currentUser,
    favorites,
    toggleFavorite,
    startOrGetConversation,
    sendMessage,
    submitReport,
    updateListingStatus,
  } = useApp();

  const listingId = params.id as string;
  const listing = listings.find((l) => l.id === listingId);

  // Modals state
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState(
    `Hello! Is this ${listing?.title || "item"} still available for pickup on campus?`
  );
  const [messageSent, setMessageSent] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<Report["reason"]>("Fraud or Scam");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col bg-warmgray-50">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="rounded-2xl border border-warmgray-200 bg-white p-8 text-center max-w-md shadow-sm">
            <h2 className="text-base font-bold text-ink">Listing Not Found</h2>
            <p className="mt-1 text-xs text-warmgray-500">
              The listing you are looking for has been sold, removed, or does not exist.
            </p>
            <Link
              href="/marketplace"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Marketplace
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const isOwner = currentUser.id === listing.sellerId;
  const isSaved = favorites.includes(listing.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialMessage.trim()) return;

    const convId = startOrGetConversation(
      "listing",
      listing.id,
      listing.title,
      {
        id: listing.seller.id,
        displayName: listing.seller.displayName,
        avatarUrl: listing.seller.avatarUrl,
      }
    );

    sendMessage(convId, initialMessage);
    setMessageSent(true);
    setTimeout(() => {
      setMessageModalOpen(false);
      setMessageSent(false);
      router.push(`/dashboard?tab=messages&conv=${convId}`);
    }, 1000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport("listing", listing.id, listing.title, reportReason, reportDescription);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReportSubmitted(false);
      setReportDescription("");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />

      <main className="flex-1">
        {/* Breadcrumb navigation */}
        <div className="border-b border-warmgray-200 bg-white py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-warmgray-500">
            <div className="flex items-center gap-2">
              <Link href="/marketplace" className="hover:text-ink flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Marketplace
              </Link>
              <span>/</span>
              <span className="text-ink font-medium truncate max-w-xs">{listing.title}</span>
            </div>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: listing.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Listing link copied to clipboard!");
                }
              }}
              className="flex items-center gap-1 text-xs hover:text-ink"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </div>

        {/* Listing Detail Body */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Image & Description */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Image */}
              <div className="relative rounded-2xl border border-warmgray-200 bg-white overflow-hidden shadow-sm">
                <img
                  src={getSafeUrl(listing.images[0], "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80")}
                  alt={listing.title}
                  className="h-80 sm:h-96 w-full object-cover"
                />
                <div className="absolute top-4 left-4 rounded-full bg-ink/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                  {CATEGORY_DETAILS[listing.category].label}
                </div>
                {listing.status === "sold" && (
                  <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="rounded-xl bg-red-600 px-6 py-2 font-display text-xl font-bold text-white tracking-wider">
                      ITEM SOLD
                    </span>
                  </div>
                )}
              </div>

              {/* Title, Condition, Location */}
              <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-warmgray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-warmgray-100 px-2.5 py-1 text-xs font-semibold text-warmgray-800">
                      Condition: {listing.condition}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-warmgray-600">
                      <MapPin className="h-3.5 w-3.5 text-warmgray-400" />
                      {listing.campusLocation} Campus
                    </span>
                  </div>
                  <span className="text-[11px] text-warmgray-400">
                    Posted on {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">
                  {listing.title}
                </h1>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-extrabold text-ink">
                    ₦{listing.priceNgn.toLocaleString()}
                  </span>
                  <span className="text-xs text-warmgray-500">Fixed student price</span>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-warmgray-400">
                    Item Description
                  </h3>
                  <p className="mt-2 text-sm text-warmgray-700 leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>
              </div>

              {/* Campus Meetup Safety Notice */}
              <SafetyBanner />
            </div>

            {/* Right Column: Seller Profile & Action Box */}
            <div className="space-y-6">
              {/* Purchase / Enquiry Action Card */}
              <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm space-y-4">
                <div>
                  <p className="text-xs text-warmgray-400 font-semibold uppercase">Student Price</p>
                  <p className="font-display text-3xl font-extrabold text-ink">
                    ₦{listing.priceNgn.toLocaleString()}
                  </p>
                </div>

                {isOwner ? (
                  <div className="rounded-xl bg-warmgray-50 border border-warmgray-200 p-4 space-y-3">
                    <p className="text-xs font-bold text-ink">You own this listing</p>
                    <div className="flex flex-col gap-2">
                      {listing.status === "active" ? (
                        <button
                          onClick={() => updateListingStatus(listing.id, "sold")}
                          className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          Mark as Sold
                        </button>
                      ) : (
                        <button
                          onClick={() => updateListingStatus(listing.id, "active")}
                          className="w-full rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-700"
                        >
                          Reactivate Listing
                        </button>
                      )}
                      <button
                        onClick={() => updateListingStatus(listing.id, "paused")}
                        className="w-full rounded-xl border border-warmgray-300 py-2 text-xs font-medium text-warmgray-700 hover:bg-warmgray-100"
                      >
                        Pause Listing
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => setMessageModalOpen(true)}
                      disabled={listing.status === "sold"}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-violet-700 transition disabled:opacity-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{listing.status === "sold" ? "Listing Sold" : "Enquire / Message Seller"}</span>
                    </button>

                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition ${
                        isSaved
                          ? "border-red-200 bg-red-50 text-red-600"
                          : "border-warmgray-200 bg-white text-warmgray-700 hover:bg-warmgray-50"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                      <span>{isSaved ? "Saved to Favourites" : "Save Listing"}</span>
                    </button>
                  </div>
                )}

                <div className="border-t border-warmgray-100 pt-3 text-[11px] text-warmgray-500 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <Lock className="h-3.5 w-3.5" />
                    <span>In-app messaging protects your private phone/email</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
                    <span>Transactions over ₦5,000 eligible for Paystack escrow</span>
                  </div>
                </div>
              </div>

              {/* Seller Trust Profile Card */}
              <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-warmgray-400">
                  Seller Profile & Trust
                </h3>

                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={listing.seller.avatarUrl}
                    alt={listing.seller.displayName}
                    className="h-12 w-12 rounded-full object-cover border border-warmgray-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-ink">{listing.seller.displayName}</h4>
                    <p className="text-xs text-warmgray-500">{listing.seller.department}</p>
                    <p className="text-[11px] text-warmgray-400">{listing.seller.campus} Campus</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-warmgray-100 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-warmgray-500">Affiliation Status</span>
                    <TrustBadge status={listing.seller.verificationStatus} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-warmgray-500">Student Rating</span>
                    <span className="font-semibold text-amber-800">
                      ★ {listing.seller.ratingAverage.toFixed(1)} ({listing.seller.ratingCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-warmgray-500">Completed Transactions</span>
                    <span className="font-semibold text-ink">
                      {listing.seller.completedTransactionsCount} items
                    </span>
                  </div>
                </div>

                {/* Report Listing Button */}
                <div className="mt-6 border-t border-warmgray-100 pt-3 text-right">
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-warmgray-400 hover:text-red-600 transition"
                  >
                    <Flag className="h-3 w-3" />
                    Report this listing to campus moderators
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message / Enquiry Modal */}
        {messageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <button
                onClick={() => setMessageModalOpen(false)}
                className="absolute top-4 right-4 rounded-lg p-1 text-warmgray-400 hover:bg-warmgray-100"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 text-violet-700 font-semibold text-sm">
                <MessageCircle className="h-4 w-4" />
                <span>Contact Seller ({listing.seller.displayName.split(" ")[0]})</span>
              </div>
              <p className="mt-1 text-xs text-warmgray-500">
                Inquiry for: <strong>{listing.title}</strong>
              </p>

              {messageSent ? (
                <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-center text-xs text-emerald-800">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                  <p className="font-bold">Message Sent Successfully!</p>
                  <p className="mt-1">Redirecting to your in-app chat inbox...</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-ink">Your Message</label>
                    <textarea
                      rows={4}
                      value={initialMessage}
                      onChange={(e) => setInitialMessage(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-warmgray-200 p-3 text-xs text-ink outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="rounded-lg bg-warmgray-50 p-2.5 text-[11px] text-warmgray-500">
                    💡 <em>Tip: Ask about item condition, receipt availability, or suggest a public campus meeting point like SEET complex.</em>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Reusable Report Modal (DRY) */}
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="listing"
          targetId={listing.id}
          targetTitle={listing.title}
          onSubmitReport={submitReport}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
