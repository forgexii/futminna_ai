import { NextResponse } from "next/server";
import { db, listings, tutorProfiles, users, categories } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { getRecommendationsForUser } from "@/lib/recommend/engine";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const recs = await getRecommendationsForUser(session!.user.id, 8);

  const listingIds = recs.filter((r) => r.targetType === "listing").map((r) => r.targetId);
  const tutorIds = recs.filter((r) => r.targetType === "tutor").map((r) => r.targetId);

  const listingRows = listingIds.length
    ? await db
        .select({
          listing: listings,
          category: { id: categories.id, name: categories.name, slug: categories.slug },
        })
        .from(listings)
        .leftJoin(categories, eq(listings.categoryId, categories.id))
        .where(inArray(listings.id, listingIds))
    : [];

  const tutorRows = tutorIds.length
    ? await db
        .select({
          tutor: tutorProfiles,
          user: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
        })
        .from(tutorProfiles)
        .leftJoin(users, eq(tutorProfiles.userId, users.id))
        .where(inArray(tutorProfiles.id, tutorIds))
    : [];

  const merged = recs
    .map((rec) => {
      if (rec.targetType === "listing") {
        const match = listingRows.find((r) => r.listing.id === rec.targetId);
        if (!match) return null;
        return { type: "listing" as const, reason: rec.reason, score: rec.score, data: match };
      }
      const match = tutorRows.find((r) => r.tutor.id === rec.targetId);
      if (!match) return null;
      return { type: "tutor" as const, reason: rec.reason, score: rec.score, data: match };
    })
    .filter(Boolean);

  return NextResponse.json({ recommendations: merged });
}
