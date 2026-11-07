/**
 * @file terms/page.tsx
 * @description Terms of Service for FUTMINNA AI MVP platform.
 * 
 * Compliance:
 * - Section 18: Campus marketplace guidelines, tutoring service boundaries,
 *   prohibited items, and university non-affiliation disclaimer.
 */

import React from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";

/**
 * Platform terms of service and compliance legal page.
 */
export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-warmgray-200 bg-white p-8 sm:p-12 shadow-sm space-y-6 text-xs text-warmgray-700 leading-relaxed">
            <h1 className="font-display text-3xl font-extrabold text-ink">Terms of Service</h1>
            <p className="text-warmgray-500">Effective Date: 7 November 2026 | Version 1.0 (MVP)</p>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-ink">1. Independent Platform Status</h2>
              <p>
                FUTMINNA AI is an independent community project developed for the students and faculty of the Federal University of Technology, Minna. It is not an official university department, nor is it endorsed or operated by the university administration.
              </p>

              <h2 className="text-sm font-bold text-ink">2. Permitted Use and Academic Integrity</h2>
              <p>
                Users agree not to use the platform for academic malpractice, including but not limited to the sale of unadministered examination questions, impersonation during university tests, or paid completion of individual student assessments.
              </p>

              <h2 className="text-sm font-bold text-ink">3. Marketplace Trading & Escrow Disclaimer</h2>
              <p>
                During this MVP release, the platform operates purely as a discovery and communication service. The platform does not take custody of student funds or operate an independent escrow wallet. Users are solely responsible for inspecting goods prior to exchanging payment.
              </p>

              <h2 className="text-sm font-bold text-ink">4. Moderation & Termination</h2>
              <p>
                Platform operators reserve the right to remove any listing, reject tutor applications, or suspend user accounts that violate our community standards or jeopardize campus safety.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
