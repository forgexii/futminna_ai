"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { AuthSidePanel } from "@/components/layout/auth-side-panel";
import { Logomark, Wordmark } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      department: String(form.get("department") || "") || undefined,
      level: String(form.get("level") || "") || undefined,
      matricNumber: String(form.get("matricNumber") || "") || undefined,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });

      setLoading(false);

      if (signInRes?.error) {
        toast.success("Account created — please sign in.");
        router.push("/login");
        return;
      }

      toast.success("Welcome to FUTMINNA AI!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthSidePanel />

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Logomark />
            <Wordmark />
          </Link>

          <h1 className="mt-8 font-display text-2xl font-semibold tracking-tight text-ink lg:mt-0">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-warmgray-500">Use your FUTMINNA email to get started — it's free.</p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required placeholder="Hauwa Bello" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">FUTMINNA email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@futminna.edu.ng" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" placeholder="Computer Science" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Input id="level" name="level" placeholder="300" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="matricNumber">Matric number (optional)</Label>
              <Input id="matricNumber" name="matricNumber" placeholder="2021/1/68421CS" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} placeholder="At least 8 characters" className="mt-1.5" />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={loading} className="mt-1">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-warmgray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-violet-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
