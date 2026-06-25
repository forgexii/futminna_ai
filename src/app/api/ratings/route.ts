import { NextRequest, NextResponse } from "next/server";
import { db, ratings } from "@/lib/db";
import { ratingSchema } from "@/lib/validations";
import { requireSession } from "@/lib/auth/session";
import { recomputeTrustScore } from "@/lib/trust/score-engine";
import { trackInteraction } from "@/lib/recommend/engine";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const body = await req.json();
  const parsed = ratingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.targetUserId === session!.user.id) {
    return NextResponse.json({ error: "You can't rate yourself" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(ratings)
    .where(
      and(
        eq(ratings.raterId, session!.user.id),
        eq(ratings.targetId, parsed.data.targetId),
        eq(ratings.targetType, parsed.data.targetType)
      )
    );
  if (existing) {
    return NextResponse.json({ error: "You've already rated this" }, { status: 409 });
  }

  const [rating] = await db
    .insert(ratings)
    .values({
      raterId: session!.user.id,
      targetUserId: parsed.data.targetUserId,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      score: parsed.data.score,
      comment: parsed.data.comment,
    })
    .returning();

  await recomputeTrustScore(parsed.data.targetUserId).catch(() => {});
  trackInteraction({
    userId: session!.user.id,
    targetType: parsed.data.targetType === "tutor_session" ? "tutor" : "listing",
    targetId: parsed.data.targetId,
    interactionType: "rating",
    weight: parsed.data.score / 5,
  }).catch(() => {});

  return NextResponse.json({ rating }, { status: 201 });
}
