/**
 * @file public-navbar.tsx
 * @description Primary global navigation bar for FUTMINNA AI.
 * 
 * Architectural Role & Responsibilities:
 * - Provides responsive navigation across public modules (Marketplace, Tutoring, Campus AI, Safety).
 * - Integrates interactive Role Testing Switcher allowing evaluators to switch between:
 *   1. Student User (Unverified / Verified)
 *   2. Tutor User (Approved with active courses)
 *   3. Moderator / Admin User (Access to moderation queues)
 * - Highlights current route and provides direct links to the Student Dashboard and Admin Panel.
 * 
 * MVP Specification Compliance:
 * - Section 4: Role-based navigation and authentication simulation.
 * - Section 7: Mobile-first responsive header with collapsible hamburger menu.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import {
  Sparkles,
  ShoppingBag,
  GraduationCap,
  Bot,
  ShieldAlert,
  User,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  UserPlus,
  LogIn,
} from "lucide-react";

/**
 * Public navigation bar component with role-switching controls and mobile drawer.
 */
export function PublicNavbar() {
  const pathname = usePathname();
  const { currentUser, availableUsers, switchUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "/features", icon: Sparkles },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { name: "Tutors", href: "/tutoring", icon: GraduationCap },
    { name: "Campus AI", href: "/assistant", icon: Bot },
    { name: "Safety", href: "/safety", icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-warmgray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 font-black text-white shadow-sm">
              F
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-ink">
                FUTMINNA <span className="text-violet-600">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                MVP v1.0
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-violet-50 text-violet-700 font-semibold"
                      : "text-warmgray-600 hover:bg-warmgray-100 hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side persona selector & actions */}
        <div className="flex items-center gap-3">
          {/* Persona Switcher for Testing Section 4 Requirements */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-warmgray-200 bg-warmgray-50 px-2.5 py-1.5 text-xs text-ink hover:bg-warmgray-100 transition"
              title="Switch user persona to test role permissions"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="h-6 w-6 rounded-full object-cover"
              />
              <div className="text-left hidden sm:block">
                <p className="font-semibold text-slate-800 leading-none">{currentUser.displayName.split(" ")[0]}</p>
                <p className="text-[10px] text-warmgray-500 capitalize">{currentUser.role.replace("_", " ")}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-warmgray-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-warmgray-200 bg-white p-2 shadow-xl z-50">
                <div className="border-b border-warmgray-100 pb-2 mb-2 px-2">
                  <p className="text-[11px] font-semibold text-warmgray-400 uppercase tracking-wider">
                    Role Testing Switcher
                  </p>
                  <p className="text-xs text-warmgray-600">Select persona to test permissions:</p>
                </div>
                <div className="space-y-1">
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setUserDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                        currentUser.id === u.id
                          ? "bg-violet-50 text-violet-900 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <img src={u.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                      <div>
                        <p className="font-medium">{u.displayName}</p>
                        <p className="text-[10px] text-warmgray-500">{u.programme} ({u.role})</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-warmgray-100 pt-2 mt-2 space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-violet-600" />
                    Student Dashboard
                  </Link>
                  {currentUser.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 font-medium"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                      Admin & Moderation Desk
                    </Link>
                  )}
                  <Link
                    href="/register"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-violet-700 hover:bg-violet-50 font-medium"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-violet-600" />
                    Register New Student
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    <LogIn className="h-3.5 w-3.5 text-warmgray-500" />
                    Sign In / Switch
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick link to Dashboard / Admin */}
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-warmgray-600 hover:bg-warmgray-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warmgray-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-violet-50 text-violet-700 font-semibold" : "text-warmgray-700 hover:bg-warmgray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-warmgray-100">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-violet-700 bg-violet-50"
            >
              <LayoutDashboard className="h-4 w-4" />
              My Student Dashboard
            </Link>
            {currentUser.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-amber-800 bg-amber-50"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Moderation Desk
              </Link>
            )}
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50"
            >
              <UserPlus className="h-4 w-4" />
              Register New Student Account
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-warmgray-700 hover:bg-warmgray-50"
            >
              <LogIn className="h-4 w-4" />
              Sign In to Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
