import { getSession } from "@/lib/auth/session";
import { db, trustScores, listings } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { TrustBadge } from "@/components/shared/trust-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, Star, Clock, AlertTriangle } from "lucide-react";

export default async function SettingsPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const [[trust], myListings] = await Promise.all([
    db.select().from(trustScores).where(eq(trustScores.userId, userId)),
    db.select().from(listings).where(eq(listings.sellerId, userId)).orderBy(desc(listings.createdAt)),
  ]);

  const breakdown = [
    { label: "Verification", points: trust?.verificationPoints ?? 0, max: 20, icon: ShieldCheck },
    { label: "Completed transactions", points: trust?.transactionPoints ?? 0, max: 30, icon: Clock },
    { label: "Average rating", points: trust?.ratingPoints ?? 0, max: 35, icon: Star },
    { label: "Responsiveness", points: trust?.responsePoints ?? 0, max: 10, icon: Clock },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Account settings</h1>

      <div className="mt-6 rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{session!.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display text-lg font-semibold text-ink">{session!.user.name}</p>
            <p className="text-sm text-warmgray-500">{session!.user.email}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge variant="outline" className="capitalize">{session!.user.role}</Badge>
              {session!.user.verificationStatus && (
                <Badge variant={session!.user.verificationStatus === "verified" ? "emerald" : "gold"} className="capitalize">
                  {session!.user.verificationStatus}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink">Trust score</h2>
          <TrustBadge score={trust?.score ?? 50} />
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {breakdown.map((b) => (
            <div key={b.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-warmgray-600">
                  <b.icon className="h-3.5 w-3.5" /> {b.label}
                </span>
                <span className="font-medium text-ink">{b.points}/{b.max}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-warmgray-100">
                <div className="h-full rounded-full bg-violet-600" style={{ width: `${(b.points / b.max) * 100}%` }} />
              </div>
            </div>
          ))}
          {(trust?.disputePenalty ?? 0) > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertTriangle className="h-3.5 w-3.5" /> -{trust?.disputePenalty} points from dispute history
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-base font-semibold text-ink">Your listings</h2>
        {myListings.length === 0 ? (
          <p className="mt-3 text-sm text-warmgray-500">You haven't created any listings yet.</p>
        ) : (
          <div className="mt-3 flex flex-col divide-y divide-warmgray-100">
            {myListings.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{l.title}</p>
                  <p className="text-xs text-warmgray-400">₦{l.price.toLocaleString()} · {l.viewCount} views · {l.favoriteCount} saves</p>
                </div>
                <Badge variant={l.status === "active" ? "emerald" : "neutral"} className="capitalize">{l.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
