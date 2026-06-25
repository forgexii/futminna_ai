import { getSession } from "@/lib/auth/session";
import { db, tutorProfiles, bookings } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Wallet, Star, Calendar, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function TutorEarningsPage() {
  const session = await getSession();
  const [tutor] = await db.select().from(tutorProfiles).where(eq(tutorProfiles.userId, session!.user.id));

  if (!tutor) {
    redirect("/tutors/apply");
  }

  const completedBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.tutorProfileId, tutor.id))
    .orderBy(desc(bookings.scheduledAt));

  const completed = completedBookings.filter((b) => b.status === "completed");
  const platformFeeRate = 0.1;
  const netEarnings = Math.round(tutor.totalEarnings * (1 - platformFeeRate));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Earnings</h1>
      <p className="mt-1 text-sm text-warmgray-500">
        {tutor.status === "approved" ? "Your tutor profile is live and bookable." : `Application status: ${tutor.status}`}
      </p>

      {tutor.status !== "approved" && (
        <div className="mt-4 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-700">
          Your tutor application is currently <strong>{tutor.status}</strong>. You'll be notified once an admin reviews it.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)]">
          <Wallet className="h-6 w-6 text-violet-700" />
          <p className="mt-3 font-display text-2xl font-semibold text-ink">₦{netEarnings.toLocaleString()}</p>
          <p className="text-xs text-warmgray-400">Net earnings (after 10% platform fee)</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)]">
          <Calendar className="h-6 w-6 text-emerald-600" />
          <p className="mt-3 font-display text-2xl font-semibold text-ink">{tutor.totalSessions}</p>
          <p className="text-xs text-warmgray-400">Sessions taught</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)]">
          <Star className="h-6 w-6 text-gold-500" />
          <p className="mt-3 font-display text-2xl font-semibold text-ink">{tutor.avgRating.toFixed(1)}</p>
          <p className="text-xs text-warmgray-400">{tutor.ratingCount} ratings</p>
        </div>
      </div>

      <div className="mt-6 rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <TrendingUp className="h-4.5 w-4.5 text-violet-600" />
          Session history
        </h2>
        {completed.length === 0 ? (
          <p className="mt-3 text-sm text-warmgray-500">No completed sessions yet.</p>
        ) : (
          <div className="mt-3 flex flex-col divide-y divide-warmgray-100">
            {completed.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{b.courseCode}</p>
                  <p className="text-xs text-warmgray-400">{new Date(b.scheduledAt).toLocaleDateString()} · {b.durationMinutes} min</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink">₦{b.amount.toLocaleString()}</p>
                  <Badge variant="emerald">paid out</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
