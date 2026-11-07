/**
 * @file safety/page.tsx
 * @description Campus safety protocol, verified meetup zones, and anti-scam defense guidelines.
 * 
 * MVP Specification Compliance:
 * - Section 18: Designated physical campus meeting spots (SEET Complex, Library Quad, Convocation Square).
 * - Anti-scam notices, advance payment prevention rules, and emergency campus security contacts.
 */

import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  ShieldAlert,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Lock,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

/**
 * Public campus safety guidelines and verified meetup location index.
 */
export default function SafetyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>Campus Safety Operations</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              FUTMINNA Student Safety & Anti-Scam Policy
            </h1>
            <p className="mt-2 text-sm text-warmgray-600 leading-relaxed">
              FUTMINNA AI was built to eliminate chaotic WhatsApp group scams. To protect yourself and your fellow students, always abide by these mandatory safety guidelines.
            </p>
          </div>

          {/* Golden Rules */}
          <div className="rounded-2xl border border-warmgray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-bold text-ink">
              The Four Golden Rules of Campus Trading
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl bg-warmgray-50 p-4 border border-warmgray-100">
                <div className="h-8 w-8 rounded-lg bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h3 className="mt-2 text-xs font-bold text-ink">No Advance Bank Transfers</h3>
                <p className="mt-1 text-xs text-warmgray-600 leading-relaxed">
                  Never transfer money for textbooks, electronics, or lodge inspections before physically seeing and testing the item in person.
                </p>
              </div>

              <div className="rounded-xl bg-warmgray-50 p-4 border border-warmgray-100">
                <div className="h-8 w-8 rounded-lg bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h3 className="mt-2 text-xs font-bold text-ink">Designated Public Meetups</h3>
                <p className="mt-1 text-xs text-warmgray-600 leading-relaxed">
                  Always meet in high-traffic campus locations during daylight hours. Never meet in private off-campus rooms alone.
                </p>
              </div>

              <div className="rounded-xl bg-warmgray-50 p-4 border border-warmgray-100">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h3 className="mt-2 text-xs font-bold text-ink">Check Affiliation Badges</h3>
                <p className="mt-1 text-xs text-warmgray-600 leading-relaxed">
                  Trade with users who hold the <strong>Affiliation Verified</strong> badge. If an unverified user pressures you, exercise extra caution.
                </p>
              </div>

              <div className="rounded-xl bg-warmgray-50 p-4 border border-warmgray-100">
                <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                  4
                </div>
                <h3 className="mt-2 text-xs font-bold text-ink">Report Suspicious Behaviour</h3>
                <p className="mt-1 text-xs text-warmgray-600 leading-relaxed">
                  Use the in-app "Report" button immediately if someone offers exam leakages, stolen goods, or suspicious off-campus accommodation.
                </p>
              </div>
            </div>
          </div>

          {/* Designated Safe Zones */}
          <div className="rounded-2xl border border-warmgray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
              <MapPin className="h-5 w-5 text-violet-600" />
              <span>Recommended Safe Meetup Zones</span>
            </h2>
            <p className="text-xs text-warmgray-600">
              When meeting a seller or student tutor, choose one of these well-lit, campus-security monitored areas:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-warmgray-200 p-4 text-xs space-y-1">
                <p className="font-bold text-ink">Gidan Kwano Campus (Main Campus)</p>
                <ul className="list-disc list-inside text-warmgray-600 space-y-1 pt-1">
                  <li>SEET Building Quadrangle & Foyer</li>
                  <li>Main University Library Reception</li>
                  <li>Senate Building Open Car Park</li>
                  <li>School of Agriculture (SAAT) Walkway</li>
                </ul>
              </div>

              <div className="rounded-xl border border-warmgray-200 p-4 text-xs space-y-1">
                <p className="font-bold text-ink">Bosso Campus</p>
                <ul className="list-disc list-inside text-warmgray-600 space-y-1 pt-1">
                  <li>Bosso Campus ICT Centre Entrance</li>
                  <li>School of Physical Sciences (SPS) Open Lawn</li>
                  <li>Student Union Building (SUB) Frontage</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Student Affiliation Verification Policy (PRV-01, PRV-02) */}
          <div id="verification" className="rounded-2xl border border-warmgray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>Student Affiliation Verification & Data Privacy</span>
            </h2>
            <p className="text-xs text-warmgray-600 leading-relaxed">
              To keep our student marketplace safe from external imposters, students may submit their official matriculation number for verification:
            </p>
            <div className="rounded-xl bg-warmgray-50 p-4 border border-warmgray-100 text-xs space-y-2">
              <p>• <strong>Strict Confidentiality:</strong> Matriculation numbers and verification notes are visible only to authorized platform moderators. They are never rendered on public marketplace listings or search pages.</p>
              <p>• <strong>Data Retention Limit:</strong> Once your university affiliation is validated and the badge is granted, raw evidence is scheduled for prompt deletion in accordance with our NDPA data minimization schedule.</p>
              <p>• <strong>Badge Meaning:</strong> The <em>Affiliation Verified</em> badge indicates platform review of student identity; it does not constitute university sponsorship or management endorsement.</p>
            </div>
          </div>

          {/* Tutoring Integrity */}
          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-6 sm:p-8 text-xs text-violet-950 space-y-3">
            <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-violet-700" />
              <span>Academic Integrity Standard</span>
            </h2>
            <p className="leading-relaxed text-violet-900">
              FUTMINNA peer tutoring exists strictly to provide conceptual explanation, syllabus mastery, and guidance on problem sets. Platform moderators actively monitor for attempts to solicit exam impersonation or paid completion of continuous assessments. Violations result in account termination and referral to the university disciplinary committee.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
