"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      return;
    }
    fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then((r) => r.json())
      .then((d) => setStatus(d.verified ? "success" : "failed"))
      .catch(() => setStatus("failed"));
  }, [reference]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      {status === "verifying" && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          <p className="mt-4 font-display text-lg font-semibold text-ink">Verifying your payment…</p>
          <p className="mt-1 text-sm text-warmgray-500">This usually takes a few seconds.</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <p className="mt-4 font-display text-lg font-semibold text-ink">Payment confirmed!</p>
          <p className="mt-1 text-sm text-warmgray-500">Your order has been updated.</p>
          <Button className="mt-6" onClick={() => router.push("/dashboard/orders")}>View my orders</Button>
        </>
      )}
      {status === "failed" && (
        <>
          <XCircle className="h-12 w-12 text-red-500" />
          <p className="mt-4 font-display text-lg font-semibold text-ink">We couldn't verify that payment</p>
          <p className="mt-1 text-sm text-warmgray-500">If you were charged, please contact support with your reference.</p>
          <Link href="/dashboard/orders" className="mt-6 text-sm font-medium text-violet-700 hover:underline">Back to orders</Link>
        </>
      )}
    </div>
  );
}
