import { NextRequest, NextResponse } from "next/server";
import { db, listings, users, categories, favorites, ratings } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { getSession, requireSession } from "@/lib/auth/session";
import { trackInteraction } from "@/lib/recommend/engine";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const [row] = await db
    .select({
      listing: listings,
      seller: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        verificationStatus: users.verificationStatus,
        department: users.department,
        createdAt: users.createdAt,
      },
      category: { id: categories.id, name: categories.name, slug: categories.slug },
    })
    .from(listings)
    .leftJoin(users, eq(listings.sellerId, users.id))
    .leftJoin(categories, eq(listings.categoryId, categories.id))
    .where(eq(listings.id, id));

  if (!row || row.listing.status === "removed") {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  await db
    .update(listings)
    .set({ viewCount: sql`${listings.viewCount} + 1` })
    .where(eq(listings.id, id));

  const sellerRatings = row.seller
    ? await db.select().from(ratings).where(eq(ratings.targetUserId, row.seller.id))
    : [];
  const avgRating =
    sellerRatings.length > 0 ? sellerRatings.reduce((s, r) => s + r.score, 0) / sellerRatings.length : null;

  const session = await getSession();
  if (session?.user) {
    trackInteraction({
      userId: session.user.id,
      targetType: "listing",
      targetId: id,
      interactionType: "view",
    }).catch(() => {});

    if (row.category) {
      trackInteraction({
        userId: session.user.id,
        targetType: "category",
        targetId: row.category.id,
        interactionType: "view",
        weight: 0.5,
      }).catch(() => {});
    }
  }

  let isFavorited = false;
  if (session?.user) {
    const [fav] = await db
      .select()
      .from(favorites)
      .where(sql`${favorites.userId} = ${session.user.id} and ${favorites.listingId} = ${id}`);
    isFavorited = Boolean(fav);
  }

  return NextResponse.json({
    ...row,
    sellerRatingAvg: avgRating,
    sellerRatingCount: sellerRatings.length,
    isFavorited,
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [existing] = await db.select().from(listings).where(eq(listings.id, id));
  if (!existing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (existing.sellerId !== session!.user.id && session!.user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  for (const key of ["title", "description", "price", "condition", "status", "location", "images"] as const) {
    if (key in body) allowed[key] = key === "images" ? JSON.stringify(body[key]) : body[key];
  }
  allowed.updatedAt = new Date().toISOString();

  const [updated] = await db.update(listings).set(allowed).where(eq(listings.id, id)).returning();
  return NextResponse.json({ listing: updated });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [existing] = await db.select().from(listings).where(eq(listings.id, id));
  if (!existing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (existing.sellerId !== session!.user.id && session!.user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await db
    .update(listings)
    .set({ status: "removed", deletedAt: new Date().toISOString() })
    .where(eq(listings.id, id));

  return NextResponse.json({ success: true });
}
