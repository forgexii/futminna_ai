"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthSidePanel } from "@/components/layout/auth-side-panel";
import { Logomark, Wordmark } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthSidePanel />

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Logomark />
            <Wordmark />
          </Link>

          {sent ? (
            <div className="mt-8 flex flex-col items-center gap-3 text-center lg:mt-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <MailCheck className="h-6 w-6" />
              </div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Check your inbox</h1>
              <p className="text-sm text-warmgray-500">
                If an account exists with that email, we've sent a link to reset your password.
              </p>
              <Link href="/login" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mt-8 font-display text-2xl font-semibold tracking-tight text-ink lg:mt-0">
                Reset your password
              </h1>
              <p className="mt-1.5 text-sm text-warmgray-500">
                Enter your FUTMINNA email and we'll send you a reset link.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="mt-7 flex flex-col gap-4"
              >
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="you@futminna.edu.ng" className="mt-1.5" />
                </div>
                <Button type="submit" className="mt-1">Send reset link</Button>
              </form>

              <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
