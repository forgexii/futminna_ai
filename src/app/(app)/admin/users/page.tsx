"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Search, ShieldCheck, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/shared/trust-badge";

interface UserRow {
  user: { id: string; name: string; email: string; role: string; department: string | null; verificationStatus: string; createdAt: string };
  trust: { score: number } | null;
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json();
    setRows(data.users ?? []);
    setLoading(false);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 250);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  async function setVerification(id: string, verificationStatus: string) {
    setActionId(id);
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus }),
      });
      toast.success("User updated");
      fetchUsers();
    } finally {
      setActionId(null);
    }
  }

  async function toggleSuspend(id: string, suspended: boolean) {
    setActionId(id);
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended }),
      });
      toast.success(suspended ? "User suspended" : "User reinstated");
      fetchUsers();
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Users</h1>
      <p className="mt-1 text-sm text-warmgray-500">Verify accounts and manage trust across the platform.</p>

      <div className="relative mt-5 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warmgray-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="pl-10" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-[var(--radius-card)] border border-warmgray-100 bg-white shadow-[var(--shadow-soft)]">
          <table className="w-full text-sm">
            <thead className="border-b border-warmgray-100 bg-warmgray-50/60 text-left text-xs font-semibold uppercase tracking-wide text-warmgray-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Trust</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmgray-100">
              {rows.map((row) => (
                <tr key={row.user.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{row.user.name}</p>
                    <p className="text-xs text-warmgray-400">{row.user.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-warmgray-600">{row.user.role}</td>
                  <td className="px-4 py-3">
                    <Badge variant={row.user.verificationStatus === "verified" ? "emerald" : "gold"} className="capitalize">
                      {row.user.verificationStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3"><TrustBadge score={row.trust?.score ?? 50} showLabel={false} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      {row.user.verificationStatus !== "verified" && (
                        <Button size="sm" variant="outline" disabled={actionId === row.user.id} onClick={() => setVerification(row.user.id, "verified")}>
                          <ShieldCheck className="h-3.5 w-3.5" /> Verify
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" disabled={actionId === row.user.id} onClick={() => toggleSuspend(row.user.id, true)}>
                        <Ban className="h-3.5 w-3.5" /> Suspend
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
