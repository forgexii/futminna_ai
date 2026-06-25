import { NextRequest, NextResponse } from "next/server";
import { db, orders, listings, users } from "@/lib/db";
import { eq, or } from "drizzle-orm";
import { orderSchema } from "@/lib/validations";
import { requireSession } from "@/lib/auth/session";
import { trackInteraction } from "@/lib/recommend/engine";
import { notify } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [listing] = await db.select().from(listings).where(eq(listings.id, parsed.data.listingId));
  if (!listing || listing.status !== "active") {
    return NextResponse.json({ error: "Listing not available" }, { status: 404 });
  }
  if (listing.sellerId === session!.user.id) {
    return NextResponse.json({ error: "You can't buy your own listing" }, { status: 400 });
  }

  const [order] = await db
    .insert(orders)
    .values({
      listingId: listing.id,
      buyerId: session!.user.id,
      sellerId: listing.sellerId,
      amount: listing.price,
      status: "pending",
    })
    .returning();

  trackInteraction({
    userId: session!.user.id,
    targetType: "listing",
    targetId: listing.id,
    interactionType: "purchase",
  }).catch(() => {});

  return NextResponse.json({ order }, { status: 201 });
}

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const rows = await db
    .select({
      order: orders,
      listing: { id: listings.id, title: listings.title, images: listings.images, price: listings.price },
    })
    .from(orders)
    .leftJoin(listings, eq(orders.listingId, listings.id))
    .where(or(eq(orders.buyerId, session!.user.id), eq(orders.sellerId, session!.user.id)));

  return NextResponse.json({ orders: rows });
}
