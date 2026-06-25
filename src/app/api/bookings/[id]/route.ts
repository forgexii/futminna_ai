import { NextRequest, NextResponse } from "next/server";
import { db, bookings, tutorProfiles, users } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { notify } from "@/lib/notifications";
import { recomputeTrustScore } from "@/lib/trust/score-engine";

const VALID_TRANSITIONS: Record<string, string[]> = {
  requested: ["accepted", "rejected", "cancelled"],
  accepted: ["completed", "cancelled"],
  rejected: [],
  completed: [],
  cancelled: [],
};

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const [tutorProfile] = await db.select().from(tutorProfiles).where(eq(tutorProfiles.id, booking.tutorProfileId));
  const isTutor = tutorProfile?.userId === session!.user.id;
  const isStudent = booking.studentId === session!.user.id;
  if (!isTutor && !isStudent && session!.user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const nextStatus = body.status as string;

  if (!VALID_TRANSITIONS[booking.status]?.includes(nextStatus)) {
    return NextResponse.json({ error: `Cannot move booking from ${booking.status} to ${nextStatus}` }, { status: 400 });
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: nextStatus as typeof booking.status, updatedAt: new Date().toISOString() })
    .where(eq(bookings.id, id))
    .returning();

  if (nextStatus === "completed" && tutorProfile) {
    await db
      .update(tutorProfiles)
      .set({
        totalSessions: sql`${tutorProfiles.totalSessions} + 1`,
        totalEarnings: sql`${tutorProfiles.totalEarnings} + ${booking.amount}`,
      })
      .where(eq(tutorProfiles.id, tutorProfile.id));
    await recomputeTrustScore(tutorProfile.userId).catch(() => {});
    await recomputeTrustScore(booking.studentId).catch(() => {});

    await notify({
      userId: booking.studentId,
      type: "session_completed",
      title: "Session marked complete",
      body: `Your ${booking.courseCode} session is complete. Leave a rating for your tutor!`,
      link: `/dashboard`,
    });
  }

  if (nextStatus === "accepted") {
    await notify({
      userId: booking.studentId,
      type: "booking_accepted",
      title: "Booking confirmed",
      body: `Your ${booking.courseCode} session has been accepted by the tutor.`,
      link: `/dashboard`,
    });
  }

  if (nextStatus === "cancelled" && tutorProfile) {
    const notifyUserId = isTutor ? booking.studentId : tutorProfile.userId;
    await notify({
      userId: notifyUserId,
      type: "booking_cancelled",
      title: "Booking cancelled",
      body: `The ${booking.courseCode} session scheduled for ${new Date(booking.scheduledAt).toLocaleString()} was cancelled.`,
    });
  }

  return NextResponse.json({ booking: updated });
}
