import { NextResponse } from "next/server";
import { db, listings, categories } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const rows = await db
    .select({ listing: listings, category: { id: categories.id, name: categories.name } })
    .from(listings)
    .leftJoin(categories, eq(listings.categoryId, categories.id))
    .where(eq(listings.sellerId, session!.user.id))
    .orderBy(desc(listings.createdAt));

  return NextResponse.json({ listings: rows.filter((r) => r.listing.status !== "removed") });
}
