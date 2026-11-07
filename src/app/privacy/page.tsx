/**
 * @file privacy/page.tsx
 * @description Privacy Policy and Data Handling notice for FUTMINNA AI.
 * 
 * Compliance:
 * - PRV-01, PRV-02 & Nigeria Data Protection Act (NDPA): Data minimization,
 *   purpose limitation, retention, and student data protection rights.
 */

import React from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";

/**
 * Privacy policy document outlining data minimization and protection policies.
 */
export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-warmgray-200 bg-white p-8 sm:p-12 shadow-sm space-y-6 text-xs text-warmgray-700 leading-relaxed">
            <h1 className="font-display text-3xl font-extrabold text-ink">Privacy Notice</h1>
            <p className="text-warmgray-500">
              Compliant with the Nigeria Data Protection Act (NDPA) | Version 1.0
            </p>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-ink">1. Data Minimization (PRV-01)</h2>
              <p>
                We collect only the personal information strictly required to operate the platform: your name, email, department, level, campus, and matriculation number (strictly for affiliation verification). We do not harvest contacts or track users across external sites.
              </p>

              <h2 className="text-sm font-bold text-ink">2. Student Verification Privacy</h2>
              <p>
                Student matriculation numbers and identity evidence submitted for verification are accessible only to authorized administrators and moderators. Evidence is never shared with other students or third-party advertisers.
              </p>

              <h2 className="text-sm font-bold text-ink">3. AI Assistant Interactions (SEC-05 & Section 13)</h2>
              <p>
                Prompts entered into the Campus Assistant are processed to retrieve grounded university circulars. Private message contents, identity cards, and personal records are never used as model training data or context.
              </p>

              <h2 className="text-sm font-bold text-ink">4. User Rights & Data Deletion (ACC-05)</h2>
              <p>
                Under the NDPA, you have the right to request access to your personal data, rectify inaccuracies, or request complete account deletion. Contact privacy@futminna-ai.org to submit a request.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
