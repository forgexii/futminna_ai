import { NextResponse } from "next/server";
import { db, favorites, listings, categories } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const rows = await db
    .select({
      listing: listings,
      category: { id: categories.id, name: categories.name },
      favoritedAt: favorites.createdAt,
    })
    .from(favorites)
    .leftJoin(listings, eq(favorites.listingId, listings.id))
    .leftJoin(categories, eq(listings.categoryId, categories.id))
    .where(eq(favorites.userId, session!.user.id))
    .orderBy(desc(favorites.createdAt));

  return NextResponse.json({ favorites: rows.filter((r) => r.listing) });
}
