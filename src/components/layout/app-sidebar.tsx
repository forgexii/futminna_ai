"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, ShoppingBag, GraduationCap, Bell, Settings, LogOut,
  PlusCircle, Wallet, ShieldCheck, BarChart3, Users, FileWarning, CalendarClock,
} from "lucide-react";
import { Logomark, Wordmark } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const STUDENT_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/tutors", label: "Find a tutor", icon: GraduationCap },
  { href: "/dashboard/orders", label: "My orders", icon: Wallet },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const TUTOR_LINKS = [
  { href: "/tutor/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/tutor/earnings", label: "Earnings", icon: Wallet },
];

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/tutors", label: "Tutor applications", icon: ShieldCheck },
  { href: "/admin/reports", label: "Reports", icon: FileWarning },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const links = [
    ...STUDENT_LINKS,
    ...(role === "tutor" ? TUTOR_LINKS : []),
    ...(role === "admin" ? ADMIN_LINKS : []),
  ];

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-warmgray-100 bg-white lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-warmgray-100 px-5">
        <Logomark />
        <Wordmark />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
        <Link
          href="/marketplace/new"
          className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-800"
        >
          <PlusCircle className="h-4 w-4" />
          Create listing
        </Link>

        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/dashboard" && pathname?.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-violet-100 text-violet-800" : "text-warmgray-600 hover:bg-warmgray-50 hover:text-ink"
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-warmgray-100 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials || "U"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{session?.user?.name}</p>
            <p className="truncate text-xs capitalize text-warmgray-400">{role}</p>
          </div>
        </div>
        <div className="mt-1 flex flex-col gap-0.5">
          <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-warmgray-600 hover:bg-warmgray-50">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-warmgray-600 hover:bg-warmgray-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
