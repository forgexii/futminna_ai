"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Flag, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReportRow {
  report: { id: string; targetType: string; targetId: string; reason: string; status: string; createdAt: string };
  reporter: { id: string; name: string; email: string } | null;
  targetLabel: string | null;
}

export default function AdminReportsPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reports?status=open");
    const data = await res.json();
    setRows(data.reports ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function resolve(id: string, status: string, removeListing = false) {
    setActionId(id);
    try {
      await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, removeListing }),
      });
      toast.success("Report updated");
      fetchReports();
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Reports</h1>
      <p className="mt-1 text-sm text-warmgray-500">Review reported listings and users.</p>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div>
      ) : rows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-dashed border-warmgray-200 py-16 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          <p className="text-sm text-warmgray-500">No open reports. Nice and clean.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.report.id} className="rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-red-500" />
                    <Badge variant="outline" className="capitalize">{row.report.targetType}</Badge>
                    {row.targetLabel && <span className="text-sm font-medium text-ink">{row.targetLabel}</span>}
                  </div>
                  <p className="mt-2 text-sm text-warmgray-600">{row.report.reason}</p>
                  <p className="mt-1 text-xs text-warmgray-400">
                    Reported by {row.reporter?.name ?? "unknown"} · {new Date(row.report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {row.report.targetType === "listing" && (
                    <Button size="sm" variant="ghost" disabled={actionId === row.report.id} onClick={() => resolve(row.report.id, "resolved", true)}>
                      <Trash2 className="h-3.5 w-3.5" /> Remove listing
                    </Button>
                  )}
                  <Button size="sm" variant="outline" disabled={actionId === row.report.id} onClick={() => resolve(row.report.id, "dismissed")}>
                    Dismiss
                  </Button>
                  <Button size="sm" disabled={actionId === row.report.id} onClick={() => resolve(row.report.id, "resolved")}>
                    Resolve
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
