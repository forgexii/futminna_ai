import { NextRequest, NextResponse } from "next/server";
import { db, bookings, tutorProfiles, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { bookingSchema } from "@/lib/validations";
import { requireSession } from "@/lib/auth/session";
import { trackInteraction } from "@/lib/recommend/engine";
import { notify } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const body = await req.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [tutor] = await db.select().from(tutorProfiles).where(eq(tutorProfiles.id, parsed.data.tutorProfileId));
  if (!tutor || tutor.status !== "approved") {
    return NextResponse.json({ error: "Tutor not available for booking" }, { status: 404 });
  }
  if (tutor.userId === session!.user.id) {
    return NextResponse.json({ error: "You can't book your own tutor profile" }, { status: 400 });
  }

  const amount = Math.round((tutor.hourlyRate * parsed.data.durationMinutes) / 60);

  const [booking] = await db
    .insert(bookings)
    .values({
      tutorProfileId: tutor.id,
      studentId: session!.user.id,
      courseCode: parsed.data.courseCode,
      scheduledAt: parsed.data.scheduledAt,
      durationMinutes: parsed.data.durationMinutes,
      amount,
      status: "requested",
    })
    .returning();

  trackInteraction({
    userId: session!.user.id,
    targetType: "tutor",
    targetId: parsed.data.courseCode,
    interactionType: "booking",
  }).catch(() => {});

  await notify({
    userId: tutor.userId,
    type: "booking_request",
    title: "New booking request",
    body: `A student requested a ${parsed.data.durationMinutes}-minute session for ${parsed.data.courseCode}.`,
    link: `/tutor/bookings`,
  });

  return NextResponse.json({ booking }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const sp = req.nextUrl.searchParams;
  const as = sp.get("as") ?? "student"; // "student" | "tutor"

  if (as === "tutor") {
    const [tutorProfile] = await db.select().from(tutorProfiles).where(eq(tutorProfiles.userId, session!.user.id));
    if (!tutorProfile) return NextResponse.json({ bookings: [] });

    const rows = await db
      .select({ booking: bookings, student: { id: users.id, name: users.name, avatarUrl: users.avatarUrl } })
      .from(bookings)
      .leftJoin(users, eq(bookings.studentId, users.id))
      .where(eq(bookings.tutorProfileId, tutorProfile.id));

    return NextResponse.json({ bookings: rows });
  }

  const rows = await db
    .select({
      booking: bookings,
      tutor: tutorProfiles,
      tutorUser: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
    })
    .from(bookings)
    .leftJoin(tutorProfiles, eq(bookings.tutorProfileId, tutorProfiles.id))
    .leftJoin(users, eq(tutorProfiles.userId, users.id))
    .where(eq(bookings.studentId, session!.user.id));

  return NextResponse.json({ bookings: rows });
}
