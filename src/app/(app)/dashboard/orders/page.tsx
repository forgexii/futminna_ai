"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Package, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrderRow {
  order: { id: string; amount: number; status: string; createdAt: string };
  listing: { id: string; title: string; price: number } | null;
}

const STATUS_VARIANT: Record<string, "violet" | "gold" | "emerald" | "rose" | "neutral"> = {
  pending: "gold",
  paid: "violet",
  escrowed: "violet",
  completed: "emerald",
  cancelled: "neutral",
  refunded: "neutral",
  disputed: "rose",
};

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const checkoutOrderId = searchParams.get("checkout");

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function payNow(orderId: string) {
    setPayingId(orderId);
    try {
      const res = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "order", relatedId: orderId }),
      });
      const data = await res.json();

      if (!data.configured) {
        toast.info(data.message ?? "Paystack isn't configured in this environment yet.");
        setPayingId(null);
        return;
      }
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }
      toast.error(data.error ?? "Could not start payment");
    } finally {
      setPayingId(null);
    }
  }

  async function handleAction(orderId: string, action: "confirm_receipt" | "dispute" | "cancel") {
    setActionId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Action failed");
        return;
      }
      toast.success(action === "confirm_receipt" ? "Receipt confirmed, payment released!" : "Updated");
      fetchOrders();
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">My orders</h1>
      <p className="mt-1 text-sm text-warmgray-500">Track purchases and sales, and manage payments.</p>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-warmgray-200 py-16 text-center text-sm text-warmgray-500">
          No orders yet. Browse the marketplace to get started.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {orders.map((row) => {
            const isCheckoutTarget = row.order.id === checkoutOrderId;
            return (
              <div
                key={row.order.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border bg-white p-4 shadow-[var(--shadow-soft)] ${
                  isCheckoutTarget ? "border-violet-300 ring-2 ring-violet-100" : "border-warmgray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Package className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{row.listing?.title ?? "Listing removed"}</p>
                    <p className="text-xs text-warmgray-400">{new Date(row.order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-ink">₦{row.order.amount.toLocaleString()}</p>
                  <Badge variant={STATUS_VARIANT[row.order.status] ?? "neutral"}>{row.order.status}</Badge>

                  {row.order.status === "pending" && (
                    <Button size="sm" onClick={() => payNow(row.order.id)} disabled={payingId === row.order.id}>
                      {payingId === row.order.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                      Pay now
                    </Button>
                  )}
                  {(row.order.status === "paid" || row.order.status === "escrowed") && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(row.order.id, "confirm_receipt")} disabled={actionId === row.order.id}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Confirm receipt
                    </Button>
                  )}
                  {["pending", "paid"].includes(row.order.status) && (
                    <Button size="sm" variant="ghost" onClick={() => handleAction(row.order.id, "dispute")} disabled={actionId === row.order.id}>
                      <AlertTriangle className="h-3.5 w-3.5" /> Dispute
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
