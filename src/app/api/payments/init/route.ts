import { NextRequest, NextResponse } from "next/server";
import { db, payments, orders, bookings, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { initPaystackTransaction, isPaystackConfigured, generatePaymentReference } from "@/lib/payments/paystack";

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const body = await req.json();
  const { type, relatedId } = body as { type: "order" | "booking"; relatedId: string };

  let amount = 0;
  let payerId = session!.user.id;

  if (type === "order") {
    const [order] = await db.select().from(orders).where(eq(orders.id, relatedId));
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.buyerId !== session!.user.id) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    if (order.status !== "pending") return NextResponse.json({ error: "Order already paid" }, { status: 400 });
    amount = order.amount;
  } else if (type === "booking") {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, relatedId));
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.studentId !== session!.user.id) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    if (booking.paymentId) return NextResponse.json({ error: "Booking already paid" }, { status: 400 });
    amount = booking.amount;
  } else {
    return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
  }

  const reference = generatePaymentReference(type);

  await db.insert(payments).values({
    userId: payerId,
    reference,
    amount,
    type,
    relatedId,
    status: "pending",
  });

  if (!isPaystackConfigured()) {
    // Demo mode: no Paystack key configured. Return a flag so the client can
    // show a clear "test mode" path instead of a broken checkout.
    return NextResponse.json({
      configured: false,
      reference,
      amount,
      message:
        "Paystack isn't configured yet. Add PAYSTACK_SECRET_KEY to your .env to enable real test-mode payments.",
    });
  }

  const [user] = await db.select().from(users).where(eq(users.id, payerId));
  const callbackUrl = `${req.nextUrl.origin}/payments/callback`;

  try {
    const tx = await initPaystackTransaction({
      email: user!.email,
      amountKobo: Math.round(amount * 100),
      reference,
      callbackUrl,
      metadata: { type, relatedId, userId: payerId },
    });

    return NextResponse.json({ configured: true, authorizationUrl: tx.authorization_url, reference });
  } catch (err) {
    console.error("Paystack init failed", err);
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 502 });
  }
}
