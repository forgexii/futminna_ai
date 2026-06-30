"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ArrowLeft, Heart, MapPin, ShieldCheck, Flag, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ListingDetail {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    condition: string;
    location: string | null;
    favoriteCount: number;
    viewCount: number;
    sellerId: string;
    images: string | string[];
  };
  seller: { id: string; name: string; verificationStatus: string; department: string | null } | null;
  category: { id: string; name: string } | null;
  sellerRatingAvg: number | null;
  sellerRatingCount: number;
  isFavorited: boolean;
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const { data: session } = useSession();
  const router = useRouter();

  const [data, setData] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleFavorite() {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setFavLoading(true);
    try {
      const res = await fetch(`/api/listings/${id}/favorite`, { method: "POST" });
      const d = await res.json();
      setData((prev) => (prev ? { ...prev, isFavorited: d.favorited } : prev));
    } finally {
      setFavLoading(false);
    }
  }

  async function handleBuy() {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setBuying(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error ?? "Could not start checkout");
        setBuying(false);
        return;
      }
      router.push(`/dashboard/orders?checkout=${d.order.id}`);
    } catch {
      toast.error("Something went wrong");
      setBuying(false);
    }
  }

  async function submitReport() {
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "listing", targetId: id, reason: reportReason }),
      });
      toast.success("Report submitted. Our team will review it.");
      setReportOpen(false);
      setReportReason("");
    } catch {
      toast.error("Could not submit report");
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-warmgray-500">This listing couldn't be found — it may have been removed.</p>
        <Link href="/marketplace" className="mt-3 inline-block text-sm font-medium text-violet-700 hover:underline">
          Back to marketplace
        </Link>
      </div>
    );
  }

  const { listing, seller, category, sellerRatingAvg, sellerRatingCount, isFavorited } = data;
  const isOwner = session?.user?.id === listing.sellerId;
  const images: string[] = typeof listing.images === "string" ? JSON.parse(listing.images || "[]") : (listing.images || []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-warmgray-500 hover:text-violet-700">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to marketplace
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {images && images.length > 0 ? (
            <div className="flex aspect-[16/10] items-center justify-center rounded-[var(--radius-card)] overflow-hidden bg-warmgray-50 border border-warmgray-100">
              <img src={images[0]} alt={listing.title} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-[var(--radius-card)] bg-gradient-to-br from-violet-50 to-warmgray-50 text-violet-200">
              <span className="font-display text-6xl font-semibold">{listing.title.charAt(0)}</span>
            </div>
          )}

          {images && images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <img key={i} src={img} alt={`${listing.title} ${i + 1}`} className="h-20 w-20 rounded-md object-cover border border-warmgray-200" />
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {category && <Badge variant="neutral">{category.name}</Badge>}
            <Badge variant="outline">{listing.condition.replace("_", " ")}</Badge>
            <span className="text-xs text-warmgray-400">{listing.viewCount} views</span>
          </div>

          <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">{listing.title}</h1>
          <p className="mt-2 font-display text-3xl font-semibold text-violet-700">₦{listing.price.toLocaleString()}</p>

          {listing.location && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-warmgray-500">
              <MapPin className="h-4 w-4" /> {listing.location}
            </p>
          )}

          <div className="mt-6 border-t border-warmgray-100 pt-6">
            <h2 className="font-display text-base font-semibold text-ink">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-warmgray-600">{listing.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-warmgray-400">Seller</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{seller?.name?.charAt(0) ?? "?"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-ink">{seller?.name ?? "Unknown"}</p>
                {seller?.department && <p className="text-xs text-warmgray-400">{seller.department}</p>}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {seller?.verificationStatus === "verified" && (
                <Badge variant="emerald">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              )}
              {sellerRatingCount > 0 && (
                <Badge variant="gold">
                  <Star className="h-3 w-3 fill-current" /> {sellerRatingAvg?.toFixed(1)} ({sellerRatingCount})
                </Badge>
              )}
            </div>

            {!isOwner && (
              <div className="mt-5 flex flex-col gap-2.5">
                <Button onClick={handleBuy} disabled={buying} className="w-full">
                  {buying && <Loader2 className="h-4 w-4 animate-spin" />}
                  Buy now
                </Button>
                <Button onClick={toggleFavorite} disabled={favLoading} variant="outline" className="w-full">
                  <Heart className={`h-4 w-4 ${isFavorited ? "fill-rose-500 text-rose-500" : ""}`} />
                  {isFavorited ? "Saved" : "Save for later"}
                </Button>
              </div>
            )}

            {isOwner && (
              <div className="mt-5 rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700">
                This is your own listing.
              </div>
            )}
          </div>

          {listing.price > 5000 && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-700">
              <strong>Escrow protected:</strong> your payment is held until you confirm you've received this item.
            </div>
          )}

          {!isOwner && (
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 self-start text-xs font-medium text-warmgray-400 hover:text-red-500"
            >
              <Flag className="h-3.5 w-3.5" />
              Report this listing
            </button>
          )}
        </div>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report this listing</DialogTitle>
            <DialogDescription>Let us know what's wrong — our moderation team reviews every report.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="e.g. item doesn't match description, suspicious seller…"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button onClick={submitReport} disabled={reportReason.trim().length < 5}>Submit report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
