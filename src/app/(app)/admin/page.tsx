"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, ShoppingBag, GraduationCap, AlertTriangle, TrendingUp, Wallet } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  totalOrders: number;
  completedOrders: number;
  totalBookings: number;
  completedBookings: number;
  pendingTutors: number;
  openReports: number;
  gmv: number;
  bookingCompletionRate: number;
  orderCompletionRate: number;
  newUsersLast7d: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div>;
  }

  const cards = [
    { label: "Total users", value: stats.totalUsers, sub: `+${stats.newUsersLast7d} this week`, icon: Users, color: "violet" },
    { label: "GMV (completed orders)", value: `₦${stats.gmv.toLocaleString()}`, sub: `${stats.completedOrders}/${stats.totalOrders} orders completed`, icon: Wallet, color: "emerald" },
    { label: "Active listings", value: stats.activeListings, sub: `${stats.totalListings} total`, icon: ShoppingBag, color: "gold" },
    { label: "Booking completion", value: `${Math.round(stats.bookingCompletionRate * 100)}%`, sub: `${stats.completedBookings}/${stats.totalBookings} sessions`, icon: GraduationCap, color: "violet" },
    { label: "Pending tutor applications", value: stats.pendingTutors, sub: "Awaiting review", icon: TrendingUp, color: "gold" },
    { label: "Open reports", value: stats.openReports, sub: "Need moderation", icon: AlertTriangle, color: "rose" },
  ];

  const colorMap: Record<string, string> = {
    violet: "bg-violet-100 text-violet-700",
    emerald: "bg-emerald-100 text-emerald-600",
    gold: "bg-gold-100 text-gold-600",
    rose: "bg-rose-500/10 text-rose-500",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Platform overview</h1>
      <p className="mt-1 text-sm text-warmgray-500">Key metrics across marketplace, tutoring and moderation.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[c.color]}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 font-display text-2xl font-semibold text-ink">{c.value}</p>
            <p className="text-xs text-warmgray-400">{c.label}</p>
            <p className="mt-1 text-xs text-warmgray-400">{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
