import { NextRequest, NextResponse } from "next/server";
import { db, tutorProfiles, users } from "@/lib/db";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { tutorProfileSchema } from "@/lib/validations";
import { requireSession } from "@/lib/auth/session";
import { trackInteraction } from "@/lib/recommend/engine";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const sort = sp.get("sort") ?? "rating";
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const pageSize = Math.min(48, Math.max(1, Number(sp.get("pageSize") ?? 12)));

  const conditions = [eq(tutorProfiles.status, "approved")];
  if (q) {
    conditions.push(
      or(
        like(tutorProfiles.headline, `%${q}%`),
        like(tutorProfiles.expertiseAreas, `%${q.toUpperCase()}%`),
        like(tutorProfiles.bio, `%${q}%`)
      )!
    );
  }

  const orderBy =
    sort === "price_asc"
      ? tutorProfiles.hourlyRate
      : sort === "price_desc"
      ? desc(tutorProfiles.hourlyRate)
      : sort === "sessions"
      ? desc(tutorProfiles.totalSessions)
      : desc(tutorProfiles.avgRating);

  const rows = await db
    .select({
      tutor: tutorProfiles,
      user: { id: users.id, name: users.name, avatarUrl: users.avatarUrl, department: users.department, verificationStatus: users.verificationStatus },
    })
    .from(tutorProfiles)
    .leftJoin(users, eq(tutorProfiles.userId, users.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tutorProfiles)
    .where(and(...conditions));

  const session = await getSession();
  if (session?.user && q) {
    trackInteraction({
      userId: session.user.id,
      targetType: "tutor",
      targetId: q,
      interactionType: "search",
    }).catch(() => {});
  }

  return NextResponse.json({ tutors: rows, total: count, page, pageSize });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [existing] = await db.select().from(tutorProfiles).where(eq(tutorProfiles.userId, session!.user.id));
  if (existing) {
    return NextResponse.json({ error: "You already have a tutor application or profile" }, { status: 409 });
  }

  const body = await req.json();
  const parsed = tutorProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [tutor] = await db
    .insert(tutorProfiles)
    .values({
      userId: session!.user.id,
      headline: parsed.data.headline,
      expertiseAreas: JSON.stringify(parsed.data.expertiseAreas),
      bio: parsed.data.bio,
      hourlyRate: parsed.data.hourlyRate,
      availability: JSON.stringify(parsed.data.availability ?? {}),
      status: "approved", // Auto-approve for testing
    })
    .returning();

  // Promote role to tutor (still gated as "pending" until admin approves)
  await db.update(users)
    .set({ 
      role: "tutor",
      ...(parsed.data.avatarUrl && { avatarUrl: parsed.data.avatarUrl })
    })
    .where(eq(users.id, session!.user.id));

  return NextResponse.json({ tutor }, { status: 201 });
}
