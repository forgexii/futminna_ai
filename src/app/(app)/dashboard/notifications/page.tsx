"use client";

import { useEffect, useState } from "react";
import { Loader2, Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotifs(d.notifications ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Notifications</h1>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div>
      ) : notifs.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-dashed border-warmgray-200 py-16 text-center">
          <BellOff className="h-8 w-8 text-warmgray-300" />
          <p className="text-sm text-warmgray-500">You're all caught up.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {notifs.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.readAt && markRead(n.id)}
              className={cn(
                "flex items-start gap-3 rounded-[var(--radius-card)] border p-4 text-left shadow-[var(--shadow-soft)] transition-colors",
                n.readAt ? "border-warmgray-100 bg-white" : "border-violet-200 bg-violet-50/50"
              )}
            >
              <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", n.readAt ? "bg-warmgray-100 text-warmgray-400" : "bg-violet-100 text-violet-700")}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className={cn("text-sm", n.readAt ? "text-warmgray-600" : "font-semibold text-ink")}>{n.title}</p>
                <p className="mt-0.5 text-xs text-warmgray-500">{n.body}</p>
                <p className="mt-1 text-[11px] text-warmgray-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
