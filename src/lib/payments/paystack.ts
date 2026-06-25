const PAYSTACK_BASE = "https://api.paystack.co";

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || key.includes("replace_me")) return null;
  return key;
}

export function isPaystackConfigured() {
  return getSecretKey() !== null;
}

interface InitTransactionInput {
  email: string;
  amountKobo: number; // Paystack works in kobo (NGN * 100)
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export async function initPaystackTransaction(input: InitTransactionInput) {
  const key = getSecretKey();
  if (!key) {
    throw new Error("PAYSTACK_NOT_CONFIGURED");
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata ?? {},
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Failed to initialize Paystack transaction");
  }

  return data.data as { authorization_url: string; access_code: string; reference: string };
}

export async function verifyPaystackTransaction(reference: string) {
  const key = getSecretKey();
  if (!key) {
    throw new Error("PAYSTACK_NOT_CONFIGURED");
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Failed to verify Paystack transaction");
  }

  return data.data as {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    channel: string;
    paid_at: string | null;
  };
}

export function generatePaymentReference(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
