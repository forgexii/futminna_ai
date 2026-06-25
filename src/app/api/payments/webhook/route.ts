import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { settleSuccessfulPayment } from "@/lib/payments/settle";

/**
 * Paystack webhook handler.
 * Verifies the `x-paystack-signature` header (HMAC SHA512 of the raw body
 * using the secret key) before trusting the payload, per Paystack's docs.
 * This is the source of truth for payment confirmation — the `/verify`
 * route exists for an immediate UX response after redirect, but production
 * systems should treat this webhook as authoritative since redirects can be
 * interrupted.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const rawBody = await req.text();

  if (secret && !secret.includes("replace_me")) {
    const signature = req.headers.get("x-paystack-signature");
    const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    if (signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    // No secret configured — this endpoint can't verify authenticity in demo mode.
    return NextResponse.json({ error: "Paystack not configured" }, { status: 503 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const reference = event.data.reference as string;
    await settleSuccessfulPayment(reference, event.data.channel);
  }

  return NextResponse.json({ received: true });
}
