"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";

interface TutorRow {
  tutor: { id: string; headline: string; bio: string; expertiseAreas: string; hourlyRate: number; status: string };
  user: { id: string; name: string; email: string; department: string | null } | null;
}

export default function AdminTutorsPage() {
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState<TutorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchTutors = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/tutors?status=${status}`);
    const data = await res.json();
    setRows(data.tutors ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  async function updateStatus(id: string, newStatus: string) {
    setActionId(id);
    try {
      await fetch(`/api/admin/tutors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Application ${newStatus}`);
      fetchTutors();
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Tutor applications</h1>
      <p className="mt-1 text-sm text-warmgray-500">Review and approve tutors before they go live.</p>

      <Tabs value={status} onValueChange={setStatus} className="mt-5">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={status}>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div>
          ) : rows.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-warmgray-200 py-16 text-center text-sm text-warmgray-500">
              No {status} applications.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rows.map((row) => {
                const expertise: string[] = JSON.parse(row.tutor.expertiseAreas || "[]");
                return (
                  <div key={row.tutor.id} className="rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{row.user?.name}</p>
                        <p className="text-xs text-warmgray-400">{row.user?.email} · {row.user?.department}</p>
                        <p className="mt-2 text-sm text-ink">{row.tutor.headline}</p>
                        <p className="mt-1 text-sm text-warmgray-500">{row.tutor.bio}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {expertise.map((e) => (
                            <span key={e} className="rounded-md bg-violet-100 px-1.5 py-0.5 font-mono-code text-[11px] font-medium text-violet-700">{e}</span>
                          ))}
                        </div>
                        <p className="mt-2 text-sm font-semibold text-ink">₦{row.tutor.hourlyRate.toLocaleString()}/hr</p>
                      </div>

                      {status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" disabled={actionId === row.tutor.id} onClick={() => updateStatus(row.tutor.id, "approved")}>
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="ghost" disabled={actionId === row.tutor.id} onClick={() => updateStatus(row.tutor.id, "rejected")}>
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                      {status !== "pending" && (
                        <Badge variant={status === "approved" ? "emerald" : "neutral"} className="capitalize">{status}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
