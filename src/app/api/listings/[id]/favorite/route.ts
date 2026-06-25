import { NextRequest, NextResponse } from "next/server";
import { db, favorites, listings } from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { trackInteraction } from "@/lib/recommend/engine";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [existing] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, session!.user.id), eq(favorites.listingId, id)));

  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
    await db
      .update(listings)
      .set({ favoriteCount: sql`max(${listings.favoriteCount} - 1, 0)` })
      .where(eq(listings.id, id));
    return NextResponse.json({ favorited: false });
  }

  await db.insert(favorites).values({ userId: session!.user.id, listingId: id });
  await db
    .update(listings)
    .set({ favoriteCount: sql`${listings.favoriteCount} + 1` })
    .where(eq(listings.id, id));

  trackInteraction({
    userId: session!.user.id,
    targetType: "listing",
    targetId: id,
    interactionType: "favorite",
  }).catch(() => {});

  return NextResponse.json({ favorited: true });
}
