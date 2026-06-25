import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { verifyPaystackTransaction, isPaystackConfigured } from "@/lib/payments/paystack";
import { settleSuccessfulPayment } from "@/lib/payments/settle";
import { db, payments } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const { reference } = await req.json();
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  const [payment] = await db.select().from(payments).where(eq(payments.reference, reference));
  if (!payment || payment.userId !== session!.user.id) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: "Paystack not configured on this server" }, { status: 503 });
  }

  try {
    const result = await verifyPaystackTransaction(reference);
    if (result.status !== "success") {
      await db.update(payments).set({ status: "failed" }).where(eq(payments.id, payment.id));
      return NextResponse.json({ verified: false, status: result.status });
    }

    await settleSuccessfulPayment(reference, result.channel);
    return NextResponse.json({ verified: true, status: "success" });
  } catch (err) {
    console.error("Paystack verify failed", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 502 });
  }
}
