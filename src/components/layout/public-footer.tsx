/**
 * @file public-footer.tsx
 * @description Global footer component for FUTMINNA AI.
 * 
 * Compliance & Safety:
 * - Section 2.2 & 18: Displays mandatory independent campus project disclaimer
 *   preventing false implication of official university ownership or endorsement.
 * - Links to Safety & Anti-Scam guidelines, Terms of Use, Privacy Policy, and campus directories.
 */

import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart, AlertCircle, BookOpen, GraduationCap, Sparkles } from "lucide-react";

/**
 * Global footer with compliance disclaimer, navigation columns, and campus safety links.
 */
export function PublicFooter() {
  return (
    <footer className="border-t border-warmgray-200 bg-white">
      {/* University Disclaimer Banner (Section 2.2 & 18) */}
      <div className="bg-warmgray-100/80 border-b border-warmgray-200 py-3 px-4 text-center text-xs text-warmgray-600">
        <div className="mx-auto max-w-7xl flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4 text-warmgray-500 shrink-0" />
          <span>
            <strong>Disclaimer:</strong> FUTMINNA AI is an independent campus utility platform designed for the Federal University of Technology, Minna community. It is not officially endorsed, owned, or operated by university management.
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 font-bold text-white text-sm">
                F
              </div>
              <span className="font-display text-lg font-bold text-ink">
                FUTMINNA <span className="text-violet-600">AI</span>
              </span>
            </div>
            <p className="text-xs text-warmgray-600 leading-relaxed">
              A structured digital campus ecosystem combining peer-to-peer marketplace, course tutoring, and a grounded campus information assistant.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
              <ShieldCheck className="h-4 w-4" />
              <span>Campus Trust First Architecture</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-warmgray-500">Platform Modules</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/marketplace" className="text-warmgray-600 hover:text-ink transition">
                  Campus Marketplace
                </Link>
              </li>
              <li>
                <Link href="/tutoring" className="text-warmgray-600 hover:text-ink transition">
                  Course Tutoring Directory
                </Link>
              </li>
              <li>
                <Link href="/tutoring/apply" className="text-warmgray-600 hover:text-ink transition">
                  Apply as a Peer Tutor
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="text-warmgray-600 hover:text-ink transition">
                  Campus Knowledge Assistant
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-warmgray-600 hover:text-ink transition">
                  Six Modules Overview
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust, Safety & Rules */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-warmgray-500">Trust & Safety</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/safety" className="text-warmgray-600 hover:text-ink transition">
                  Anti-Scam & Meetup Safety
                </Link>
              </li>
              <li>
                <Link href="/safety#verification" className="text-warmgray-600 hover:text-ink transition">
                  Student Affiliation Verification
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-warmgray-600 hover:text-ink transition">
                  Terms of Service & Rules
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-warmgray-600 hover:text-ink transition">
                  Privacy Notice (NDPA Compliant)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-warmgray-600 hover:text-ink transition">
                  Staff Moderation Queue
                </Link>
              </li>
            </ul>
          </div>

          {/* Campuses & Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-warmgray-500">Campuses Served</h3>
            <ul className="mt-3 space-y-2 text-xs text-warmgray-600">
              <li>
                <span className="font-medium text-ink">Gidan Kwano Campus:</span> SEET, SICT, SAAT, SET & Main Campus Hostels
              </li>
              <li>
                <span className="font-medium text-ink">Bosso Campus:</span> School of Physical Sciences (SPS), Life Sciences (SLS) & Bosso Lodges
              </li>
              <li className="pt-2 text-warmgray-500 text-[11px]">
                Support & Reports: safety@futminna-ai.org
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-warmgray-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-warmgray-500 gap-4">
          <p>© {new Date().getFullYear()} FUTMINNA AI Pilot. Built for the FUTMINNA student community.</p>
          <div className="flex items-center gap-4">
            <Link href="/safety" className="hover:text-ink">Safety First</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/features" className="hover:text-ink">MVP Scope</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
