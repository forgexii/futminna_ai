import { NextRequest, NextResponse } from "next/server";
import { db, listings, users, categories, favorites } from "@/lib/db";
import { and, desc, eq, like, gte, lte, or, sql } from "drizzle-orm";
import { listingSchema } from "@/lib/validations";
import { requireSession } from "@/lib/auth/session";
import { trackInteraction } from "@/lib/recommend/engine";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const categorySlug = sp.get("category");
  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  const condition = sp.get("condition");
  const sort = sp.get("sort") ?? "newest";
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const pageSize = Math.min(48, Math.max(1, Number(sp.get("pageSize") ?? 12)));

  const conditions = [eq(listings.status, "active")];

  if (q) {
    conditions.push(
      or(like(listings.title, `%${q}%`), like(listings.description, `%${q}%`))!
    );
  }
  if (minPrice) conditions.push(gte(listings.price, Number(minPrice)));
  if (maxPrice) conditions.push(lte(listings.price, Number(maxPrice)));
  if (condition) conditions.push(eq(listings.condition, condition as "new" | "like_new" | "used" | "fair"));

  let categoryId: string | undefined;
  if (categorySlug) {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, categorySlug));
    if (cat) {
      categoryId = cat.id;
      conditions.push(eq(listings.categoryId, cat.id));
    } else {
      return NextResponse.json({ listings: [], total: 0, page, pageSize });
    }
  }

  const orderBy =
    sort === "price_asc"
      ? listings.price
      : sort === "price_desc"
      ? desc(listings.price)
      : sort === "popular"
      ? desc(listings.viewCount)
      : desc(listings.createdAt);

  const rows = await db
    .select({
      listing: listings,
      seller: { id: users.id, name: users.name, avatarUrl: users.avatarUrl, verificationStatus: users.verificationStatus },
      category: { id: categories.id, name: categories.name, slug: categories.slug },
    })
    .from(listings)
    .leftJoin(users, eq(listings.sellerId, users.id))
    .leftJoin(categories, eq(listings.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(listings)
    .where(and(...conditions));

  // fire-and-forget interaction tracking for search queries (helps the recommender)
  const session = await import("@/lib/auth/session").then((m) => m.getSession());
  if (session?.user && q) {
    trackInteraction({
      userId: session.user.id,
      targetType: "search",
      targetId: q,
      interactionType: "search",
    }).catch(() => {});
  }
  if (session?.user && categoryId) {
    trackInteraction({
      userId: session.user.id,
      targetType: "category",
      targetId: categoryId,
      interactionType: "click",
    }).catch(() => {});
  }

  return NextResponse.json({ listings: rows, total: count, page, pageSize });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const body = await req.json();
  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [listing] = await db
    .insert(listings)
    .values({
      sellerId: session!.user.id,
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      condition: parsed.data.condition,
      images: JSON.stringify(parsed.data.images),
      location: parsed.data.location,
    })
    .returning();

  return NextResponse.json({ listing }, { status: 201 });
}
