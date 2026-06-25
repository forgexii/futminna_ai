"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Calendar, CheckCircle2, XCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookingRow {
  booking: { id: string; courseCode: string; scheduledAt: string; durationMinutes: number; amount: number; status: string; paymentId: string | null };
  student: { id: string; name: string } | null;
}

const STATUS_VARIANT: Record<string, "violet" | "gold" | "emerald" | "rose" | "neutral"> = {
  requested: "gold",
  accepted: "violet",
  completed: "emerald",
  rejected: "neutral",
  cancelled: "neutral",
};

export default function TutorBookingsPage() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    const res = await fetch("/api/bookings?as=tutor");
    const data = await res.json();
    setRows(data.bookings ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function updateStatus(id: string, status: string) {
    setActionId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update booking");
        return;
      }
      toast.success("Booking updated");
      fetchBookings();
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Bookings</h1>
      <p className="mt-1 text-sm text-warmgray-500">Accept, reject, or mark sessions as complete.</p>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-warmgray-200 py-16 text-center text-sm text-warmgray-500">
          No bookings yet.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{row.booking.courseCode} — {row.student?.name}</p>
                  <p className="text-xs text-warmgray-400">
                    {new Date(row.booking.scheduledAt).toLocaleString()} · {row.booking.durationMinutes} min
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink">₦{row.booking.amount.toLocaleString()}</p>
                <Badge variant={STATUS_VARIANT[row.booking.status] ?? "neutral"}>{row.booking.status}</Badge>

                {row.booking.status === "requested" && row.booking.paymentId && (
                  <>
                    <Button size="sm" onClick={() => updateStatus(row.booking.id, "accepted")} disabled={actionId === row.booking.id}>
                      <Check className="h-3.5 w-3.5" /> Accept
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(row.booking.id, "rejected")} disabled={actionId === row.booking.id}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </>
                )}
                {row.booking.status === "requested" && !row.booking.paymentId && (
                  <span className="text-xs text-warmgray-400">Awaiting student payment</span>
                )}
                {row.booking.status === "accepted" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(row.booking.id, "completed")} disabled={actionId === row.booking.id}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark complete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
