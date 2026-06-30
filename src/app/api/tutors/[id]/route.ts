import { NextRequest, NextResponse } from "next/server";
import { db, tutorProfiles, users, bookings, ratings } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireSession, getSession } from "@/lib/auth/session";
import { trackInteraction } from "@/lib/recommend/engine";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const [row] = await db
    .select({
      tutor: tutorProfiles,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        department: users.department,
        level: users.level,
        verificationStatus: users.verificationStatus,
        createdAt: users.createdAt,
      },
    })
    .from(tutorProfiles)
    .leftJoin(users, eq(tutorProfiles.userId, users.id))
    .where(eq(tutorProfiles.id, id));

  if (!row) return NextResponse.json({ error: "Tutor not found" }, { status: 404 });

  const recentRatings = row.user
    ? await db.select().from(ratings).where(eq(ratings.targetUserId, row.user.id)).limit(10)
    : [];

  const session = await getSession();
  if (session?.user) {
    const expertise: string[] = JSON.parse(row.tutor.expertiseAreas || "[]");
    for (const course of expertise) {
      trackInteraction({
        userId: session.user.id,
        targetType: "tutor",
        targetId: course,
        interactionType: "view",
        weight: 0.5,
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ...row, recentRatings });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [existing] = await db.select().from(tutorProfiles).where(eq(tutorProfiles.id, id));
  if (!existing) return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  if (existing.userId !== session!.user.id && session!.user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  for (const key of ["headline", "bio", "hourlyRate", "availability", "expertiseAreas", "status"] as const) {
    if (key in body) {
      allowed[key] = key === "availability" || key === "expertiseAreas" ? JSON.stringify(body[key]) : body[key];
    }
  }
  allowed.updatedAt = new Date().toISOString();

  const [updated] = await db.update(tutorProfiles).set(allowed).where(eq(tutorProfiles.id, id)).returning();
  return NextResponse.json({ tutor: updated });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [existing] = await db.select().from(tutorProfiles).where(eq(tutorProfiles.id, id));
  if (!existing) return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  if (existing.userId !== session!.user.id && session!.user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Delete the tutor profile
  await db.delete(tutorProfiles).where(eq(tutorProfiles.id, id));

  // Reset the user's role to 'student' if they aren't an admin
  if (session!.user.role !== "admin") {
    await db.update(users).set({ role: "student" }).where(eq(users.id, existing.userId));
  }

  return NextResponse.json({ success: true });
}
