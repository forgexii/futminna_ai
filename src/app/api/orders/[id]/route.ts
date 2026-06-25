import { NextRequest, NextResponse } from "next/server";
import { db, orders, listings } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { notify } from "@/lib/notifications";
import { recomputeTrustScore } from "@/lib/trust/score-engine";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const isBuyer = order.buyerId === session!.user.id;
  const isSeller = order.sellerId === session!.user.id;
  if (!isBuyer && !isSeller && session!.user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const action = body.action as "confirm_receipt" | "dispute" | "cancel";

  if (action === "confirm_receipt") {
    if (!isBuyer) return NextResponse.json({ error: "Only the buyer can confirm receipt" }, { status: 403 });
    if (!["paid", "escrowed"].includes(order.status)) {
      return NextResponse.json({ error: "Order isn't in a confirmable state" }, { status: 400 });
    }

    const [updated] = await db
      .update(orders)
      .set({ status: "completed", updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id))
      .returning();

    await db.update(listings).set({ status: "sold" }).where(eq(listings.id, order.listingId));
    await recomputeTrustScore(order.sellerId).catch(() => {});
    await notify({
      userId: order.sellerId,
      type: "order_completed",
      title: "Order completed",
      body: "The buyer confirmed receipt and your escrow payment has been released.",
    });

    return NextResponse.json({ order: updated });
  }

  if (action === "dispute") {
    const [updated] = await db
      .update(orders)
      .set({ status: "disputed", updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id))
      .returning();

    await notify({
      userId: isBuyer ? order.sellerId : order.buyerId,
      type: "order_disputed",
      title: "Order disputed",
      body: "A dispute has been raised on this order. An admin will review it shortly.",
    });

    return NextResponse.json({ order: updated });
  }

  if (action === "cancel") {
    if (!["pending", "paid"].includes(order.status)) {
      return NextResponse.json({ error: "Order can no longer be cancelled" }, { status: 400 });
    }
    const [updated] = await db
      .update(orders)
      .set({ status: order.status === "paid" ? "refunded" : "cancelled", updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id))
      .returning();

    return NextResponse.json({ order: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
