import { db, payments, orders, bookings, users } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { notify } from "@/lib/notifications";

/** Idempotently marks a payment as successful and transitions the related order/booking. Safe to call multiple times for the same reference. */
export async function settleSuccessfulPayment(reference: string, channel = "card") {
  const [payment] = await db.select().from(payments).where(eq(payments.reference, reference));
  if (!payment) return { ok: false, reason: "Payment record not found" as const };
  if (payment.status === "success") return { ok: true, alreadySettled: true as const };

  await db
    .update(payments)
    .set({ status: "success", channel, paystackRef: reference, updatedAt: new Date().toISOString() })
    .where(eq(payments.id, payment.id));

  if (payment.type === "order" && payment.relatedId) {
    const [order] = await db.select().from(orders).where(eq(orders.id, payment.relatedId));
    if (order && order.status === "pending") {
      await db
        .update(orders)
        .set({ status: "paid", paymentId: payment.id, updatedAt: new Date().toISOString() })
        .where(eq(orders.id, order.id));
      await notify({
        userId: order.sellerId,
        type: "order_paid",
        title: "You've got a sale!",
        body: "A buyer has paid for your listing. Arrange handover, then they'll confirm receipt to release funds.",
        link: "/dashboard",
      });
    }
  }

  if (payment.type === "booking" && payment.relatedId) {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, payment.relatedId));
    if (booking && !booking.paymentId) {
      await db
        .update(bookings)
        .set({ paymentId: payment.id, updatedAt: new Date().toISOString() })
        .where(eq(bookings.id, booking.id));
    }
  }

  if (payment.type === "wallet_topup") {
    await db
      .update(users)
      .set({ walletBalance: sql`${users.walletBalance} + ${payment.amount}` })
      .where(eq(users.id, payment.userId));
  }

  return { ok: true, alreadySettled: false as const };
}
