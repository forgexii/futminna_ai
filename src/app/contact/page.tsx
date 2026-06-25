"use client";

import { useState } from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Get in touch</h1>
            <p className="mt-4 text-warmgray-600">
              Questions about your account, a dispute, or feedback on the platform — we read everything that
              comes through here.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Email support</p>
                  <p className="text-sm text-warmgray-500">support@futminna-ai.example.edu.ng</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Campus assistant</p>
                  <p className="text-sm text-warmgray-500">For quick policy & platform questions, try the chat bubble first.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-7 shadow-[var(--shadow-soft)]">
            {sent ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <p className="font-display text-lg font-semibold text-ink">Message received</p>
                <p className="text-sm text-warmgray-500">We'll get back to you within 1–2 business days.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="flex flex-col gap-4"
              >
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" required placeholder="Hauwa Bello" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="email">FUTMINNA email</Label>
                  <Input id="email" type="email" required placeholder="you@futminna.edu.ng" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" required rows={5} placeholder="How can we help?" className="mt-1.5" />
                </div>
                <Button type="submit" className="mt-1">Send message</Button>
              </form>
            )}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
