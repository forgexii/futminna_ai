/**
 * @file login/page.tsx
 * @description Authentication and quick role switcher page for FUTMINNA AI MVP.
 * 
 * MVP Specification Compliance:
 * - Section 4: Provides login form and instant one-click test account switcher
 *   (Student Abubakar, Tutor Zainab, Admin Ibrahim) for evaluation and testing.
 * - Authenticates students against active registered profiles with validation and error handling.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { useApp } from "@/lib/context/app-context";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

/**
 * Authentication sign-in page with quick-switch demo profiles.
 */
export default function LoginPage() {
  const router = useRouter();
  const { availableUsers, switchUser, loginUser } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const result = loginUser(email, password);
    if (!result.success) {
      setErrorMessage(result.error || "Unable to sign in. Please verify your credentials.");
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      if (result.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }, 700);
  };

  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-warmgray-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-black text-white text-base shadow-sm">
              F
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-ink">Welcome back</h1>
            <p className="mt-1 text-xs text-warmgray-500">Sign in to your FUTMINNA AI campus account</p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sign in notice</p>
                <p className="mt-0.5">{errorMessage}</p>
                <Link
                  href="/register"
                  className="mt-1.5 inline-block font-semibold text-violet-700 underline"
                >
                  Create new student account &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Signed in successfully!</p>
                <p className="mt-1 text-emerald-700">Redirecting to your campus workspace...</p>
              </div>
            </div>
          )}

          {/* Quick Persona Demo Switcher for fast review */}
          <div className="mt-6 rounded-xl bg-violet-50/70 border border-violet-100 p-3 text-xs">
            <p className="font-bold text-violet-900 mb-2">⚡ Quick Sign-In for MVP Evaluation:</p>
            <div className="space-y-1.5">
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    router.push(u.role === "admin" ? "/admin" : "/dashboard");
                  }}
                  className="w-full flex items-center justify-between rounded-lg bg-white p-2 text-left text-xs border border-violet-100 hover:border-violet-300 transition"
                >
                  <div className="flex items-center gap-2">
                    <img src={u.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">{u.displayName}</span>
                      <span className="text-[10px] text-warmgray-400 block">{u.email}</span>
                    </div>
                  </div>
                  <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-800 capitalize">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink">Institutional or Personal Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-warmgray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. abubakar.m@st.futminna.edu.ng"
                  className="w-full rounded-xl border border-warmgray-200 pl-10 pr-4 py-2.5 text-xs text-ink outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink">Password</label>
                <button
                  type="button"
                  onClick={() => alert("Password reset link will be sent to your student email during full deployment.")}
                  className="text-[11px] text-violet-600 hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative mt-1 flex items-center">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warmgray-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-warmgray-200 pl-10 pr-11 py-2.5 text-xs text-ink outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword((prev) => !prev);
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-warmgray-500 hover:bg-warmgray-100 hover:text-ink active:scale-95 transition cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 pointer-events-none text-violet-600" />
                  ) : (
                    <Eye className="h-4 w-4 pointer-events-none text-warmgray-500" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSuccess}
              className="w-full rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{isSuccess ? "Signing In..." : "Sign In to Account"}</span>
              {!isSuccess && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-warmgray-500">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-violet-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
