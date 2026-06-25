import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { db, trustScores, listings, bookings, tutorProfiles, notifications } from "@/lib/db";
import { eq, desc, or } from "drizzle-orm";
import { getRecommendationsForUser } from "@/lib/recommend/engine";
import { TrustBadge } from "@/components/shared/trust-badge";
import { PinTab } from "@/components/shared/pin-tab";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag, GraduationCap, Sparkles, Bell, ArrowRight, PlusCircle, Wallet,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const [[trust], myListings, myBookingsRaw, recs, recentNotifs] = await Promise.all([
    db.select().from(trustScores).where(eq(trustScores.userId, userId)),
    db.select().from(listings).where(eq(listings.sellerId, userId)).orderBy(desc(listings.createdAt)).limit(3),
    db.select().from(bookings).where(eq(bookings.studentId, userId)).orderBy(desc(bookings.scheduledAt)).limit(3),
    getRecommendationsForUser(userId, 4).catch(() => []),
    db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(4),
  ]);

  const listingRecs = recs.filter((r) => r.targetType === "listing");
  const tutorRecs = recs.filter((r) => r.targetType === "tutor");

  const hydratedListings = listingRecs.length
    ? await db.select().from(listings).where(or(...listingRecs.map((r) => eq(listings.id, r.targetId))))
    : [];
  const hydratedTutors = tutorRecs.length
    ? await db.select().from(tutorProfiles).where(or(...tutorRecs.map((r) => eq(tutorProfiles.id, r.targetId))))
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Welcome back, {session!.user.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-warmgray-500">Here's what's happening with your account.</p>
        </div>
        <div className="flex items-center gap-2">
          <TrustBadge score={trust?.score ?? 50} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link href="/marketplace/new" className="group flex items-center gap-3 rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">List an item</p>
            <p className="text-xs text-warmgray-500">Sell to fellow students</p>
          </div>
        </Link>
        <Link href="/tutors" className="group flex items-center gap-3 rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Book a tutor</p>
            <p className="text-xs text-warmgray-500">Search by course code</p>
          </div>
        </Link>
        <Link href="/dashboard/orders" className="group flex items-center gap-3 rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">My orders</p>
            <p className="text-xs text-warmgray-500">Track purchases & sales</p>
          </div>
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                <Sparkles className="h-4.5 w-4.5 text-violet-600" />
                Recommended for you
              </h2>
            </div>

            {hydratedListings.length === 0 && hydratedTutors.length === 0 ? (
              <p className="mt-3 text-sm text-warmgray-500">
                Browse the marketplace or book a tutor to get personalized recommendations.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {hydratedListings.map((l, i) => {
                  const rec = listingRecs.find((r) => r.targetId === l.id);
                  return (
                    <Link key={l.id} href={`/marketplace/${l.id}`} className="relative rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-4 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
                      <PinTab color={i % 2 === 0 ? "gold" : "violet"} />
                      <div className="flex items-center gap-2 text-xs font-medium text-violet-600">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Marketplace
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-ink">{l.title}</p>
                      <p className="mt-1 text-sm text-warmgray-500">₦{l.price.toLocaleString()}</p>
                      {rec && <p className="mt-2 text-xs italic text-warmgray-400">{rec.reason}</p>}
                    </Link>
                  );
                })}
                {hydratedTutors.map((t, i) => {
                  const rec = tutorRecs.find((r) => r.targetId === t.id);
                  return (
                    <Link key={t.id} href={`/tutors/${t.id}`} className="relative rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-4 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
                      <PinTab color={i % 2 === 0 ? "emerald" : "gold"} />
                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Tutor
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-ink">{t.headline}</p>
                      <p className="mt-1 text-sm text-warmgray-500">₦{t.hourlyRate.toLocaleString()}/hr</p>
                      {rec && <p className="mt-2 text-xs italic text-warmgray-400">{rec.reason}</p>}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Your recent listings</h2>
              <Link href="/dashboard/settings" className="flex items-center gap-1 text-sm font-medium text-violet-700 hover:underline">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {myListings.length === 0 ? (
              <div className="mt-4 rounded-[var(--radius-card)] border border-dashed border-warmgray-200 p-6 text-center text-sm text-warmgray-500">
                You haven't listed anything yet.{" "}
                <Link href="/marketplace/new" className="font-medium text-violet-700 hover:underline">
                  Create your first listing
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {myListings.map((l) => (
                  <Link key={l.id} href={`/marketplace/${l.id}`} className="rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-4 shadow-[var(--shadow-soft)]">
                    <p className="text-sm font-semibold text-ink line-clamp-1">{l.title}</p>
                    <p className="mt-1 text-sm text-warmgray-500">₦{l.price.toLocaleString()}</p>
                    <p className="mt-2 text-xs capitalize text-warmgray-400">{l.status}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-base font-semibold text-ink">Upcoming sessions</h2>
            {myBookingsRaw.length === 0 ? (
              <p className="mt-3 text-sm text-warmgray-500">No sessions booked yet.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                {myBookingsRaw.map((b) => (
                  <div key={b.id} className="rounded-xl bg-warmgray-50 p-3">
                    <p className="text-sm font-semibold text-ink">{b.courseCode}</p>
                    <p className="text-xs text-warmgray-500">{new Date(b.scheduledAt).toLocaleString()}</p>
                    <p className="mt-1 text-xs capitalize text-violet-600">{b.status.replace("_", " ")}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                <Bell className="h-4 w-4 text-violet-600" />
                Notifications
              </h2>
              <Link href="/dashboard/notifications" className="text-xs font-medium text-violet-700 hover:underline">
                See all
              </Link>
            </div>
            {recentNotifs.length === 0 ? (
              <p className="mt-3 text-sm text-warmgray-500">You're all caught up.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                {recentNotifs.map((n) => (
                  <div key={n.id} className="text-sm">
                    <p className={n.readAt ? "text-warmgray-500" : "font-medium text-ink"}>{n.title}</p>
                    <p className="text-xs text-warmgray-400 line-clamp-1">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {session!.user.role === "student" && (
            <section className="rounded-[var(--radius-card)] border border-violet-100 bg-violet-50/60 p-5">
              <h2 className="font-display text-base font-semibold text-violet-800">Become a tutor</h2>
              <p className="mt-1.5 text-xs text-violet-700">
                Know a course well? Apply to tutor and start earning.
              </p>
              <Button asChild size="sm" className="mt-3 w-full">
                <Link href="/tutors/apply">Apply now</Link>
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
