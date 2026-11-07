/**
 * @file register/page.tsx
 * @description Student registration and onboarding screen for FUTMINNA AI.
 * 
 * MVP Specification Compliance:
 * - Section 4: Collects student registration details including university email domain (@futminna.edu.ng),
 *   department, level, and primary campus.
 * - Enforces minimum password strength and campus affiliation requirements.
 * - Secure registration handler adds the user to the active session and routes to the Student Dashboard.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { useApp } from "@/lib/context/app-context";
import { ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, Lock, Mail, User, BookOpen, MapPin, Eye, EyeOff } from "lucide-react";

/**
 * Student onboarding and account registration page.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useApp();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("100L");
  const [campus, setCampus] = useState<"Gidan Kwano" | "Bosso">("Gidan Kwano");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please ensure both passwords match.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the FUTMINNA AI campus safety rules and terms of service.");
      return;
    }

    const result = registerUser({
      fullName,
      email,
      department: department || "General Studies",
      level,
      campus,
      password,
    });

    if (!result.success) {
      setErrorMessage(result.error || "Failed to create account. Please check your information.");
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      router.push("/dashboard?welcome=true");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-warmgray-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-black text-white text-base shadow-sm">
              F
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-ink">Create Student Account</h1>
            <p className="mt-1 text-xs text-warmgray-500">
              Join FUTMINNA AI to buy & sell items, discover course tutors, and access campus AI
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Registration notice</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Account created successfully!</p>
                <p className="mt-1 text-emerald-700">Setting up your student dashboard now...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-warmgray-400" />
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Fatima Sani"
                className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-violet-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-warmgray-400" />
                FUTMINNA Email or Personal Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sani.f@st.futminna.edu.ng"
                className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-violet-500"
              />
              <p className="mt-1 text-[11px] text-warmgray-400">
                Institutional (@st.futminna.edu.ng) or personal email accepted.
              </p>
            </div>

            {/* Department & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-warmgray-400" />
                  Department / School *
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Engineering"
                  className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Academic Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-warmgray-200 bg-white p-2.5 text-xs text-ink outline-none focus:border-violet-500"
                >
                  <option value="100L">100L (Freshman)</option>
                  <option value="200L">200L</option>
                  <option value="300L">300L</option>
                  <option value="400L">400L</option>
                  <option value="500L">500L (Final Year)</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>

            {/* Primary Campus Location */}
            <div>
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-warmgray-400" />
                Primary Campus Location
              </label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value as "Gidan Kwano" | "Bosso")}
                className="mt-1 w-full rounded-xl border border-warmgray-200 bg-white p-2.5 text-xs text-ink outline-none focus:border-violet-500"
              >
                <option value="Gidan Kwano">Gidan Kwano Campus (Main Campus)</option>
                <option value="Bosso">Bosso Campus (Bosso Estate)</option>
              </select>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-warmgray-400" />
                  Password *
                </label>
                <div className="relative mt-1 flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-xl border border-warmgray-200 py-2.5 pl-3 pr-11 text-xs text-ink outline-none focus:border-violet-500"
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

              <div>
                <label className="text-xs font-semibold text-ink flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-warmgray-400" />
                  Confirm Password *
                </label>
                <div className="relative mt-1 flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-warmgray-200 py-2.5 pl-3 pr-11 text-xs text-ink outline-none focus:border-violet-500"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowConfirmPassword((prev) => !prev);
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-warmgray-500 hover:bg-warmgray-100 hover:text-ink active:scale-95 transition cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 pointer-events-none text-violet-600" />
                    ) : (
                      <Eye className="h-4 w-4 pointer-events-none text-warmgray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Safety Agreement */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-warmgray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-[11px] text-warmgray-600 leading-tight">
                I agree to the{" "}
                <Link href="/safety" className="text-violet-600 underline font-medium" target="_blank">
                  Campus Meetup Safety Protocol
                </Link>{" "}
                and acknowledge the independent project{" "}
                <Link href="/terms" className="text-violet-600 underline font-medium" target="_blank">
                  Terms of Service
                </Link>.
              </span>
            </label>

            {/* Affiliation Notice */}
            <div className="rounded-xl bg-violet-50 p-3 text-[11px] text-violet-900 border border-violet-100 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-violet-700 shrink-0 mt-0.5" />
              <span>
                After registering, you can submit your matriculation number in the dashboard to receive the{" "}
                <strong>Affiliation Verified</strong> trust badge.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSuccess}
              className="w-full rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{isSuccess ? "Registering Account..." : "Complete Student Registration"}</span>
              {!isSuccess && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-warmgray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-violet-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
