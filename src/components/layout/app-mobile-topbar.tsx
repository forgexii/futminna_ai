"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, PlusCircle } from "lucide-react";
import { Logomark, Wordmark } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/tutors", label: "Find a tutor" },
  { href: "/dashboard/orders", label: "My orders" },
  { href: "/dashboard/notifications", label: "Notifications" },
];

const ROLE_LINKS: Record<string, { href: string; label: string }[]> = {
  tutor: [
    { href: "/tutor/bookings", label: "Bookings" },
    { href: "/tutor/earnings", label: "Earnings" },
  ],
  admin: [
    { href: "/admin", label: "Admin overview" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/tutors", label: "Tutor applications" },
    { href: "/admin/reports", label: "Reports" },
  ],
};

export function AppMobileTopbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const links = [...LINKS, ...(role ? ROLE_LINKS[role] ?? [] : [])];

  return (
    <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-warmgray-100 bg-white px-4 lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Logomark />
        <Wordmark />
      </Link>
      <button onClick={() => setOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-violet-950/30" onClick={() => setOpen(false)} />
          <div className="relative ml-auto flex h-full w-72 flex-col bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <Logomark />
                <Wordmark />
              </Link>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5 text-warmgray-500" />
              </button>
            </div>

            <Link
              href="/marketplace/new"
              onClick={() => setOpen(false)}
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-3 py-2.5 text-sm font-semibold text-white"
            >
              <PlusCircle className="h-4 w-4" />
              Create listing
            </Link>

            <nav className="mt-5 flex flex-1 flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium",
                    pathname === l.href ? "bg-violet-100 text-violet-800" : "text-warmgray-600"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-warmgray-600"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
