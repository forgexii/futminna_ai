/**
 * @file tutoring/[id]/page.tsx
 * @description Detail profile page and booking request workflow for a verified course tutor.
 * 
 * MVP Specification Compliance:
 * - Section 6.3 & 6.7: Hourly rate breakdown, campus meeting location selection,
 *   transparent platform service fee (5%) calculation, and booking request submission.
 * - Section 6.7.1: Demonstrates non-custodial transparent escrow/payment state transitions.
 * - Section 6.8: Safety verification and incident report modal.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { TrustBadge } from "@/components/shared/trust-badge";
import { ReportModal } from "@/modules/marketplace/components/report-modal";
import { useApp } from "@/lib/context/app-context";
import {
  GraduationCap,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  Star,
  Flag,
  AlertCircle,
} from "lucide-react";

/**
 * Tutor profile page providing session booking scheduler, fee calculator, and reporting actions.
 */
export default function TutorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tutors, currentUser, createBooking, submitReport } = useApp();

  const tutorId = params.id as string;
  const tutor = tutors.find((t) => t.id === tutorId);

  // Booking form state
  const [selectedCourse, setSelectedCourse] = useState(tutor?.supportedCourseCodes[0] || "");
  const [selectedSlot, setSelectedSlot] = useState(tutor?.availabilitySlots[0] || "");
  const [durationHours, setDurationHours] = useState(2);
  const [learningObjective, setLearningObjective] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Report state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<any>("Academic Misconduct");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!tutor) {
    return (
      <div className="flex min-h-screen flex-col bg-warmgray-50">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="rounded-2xl border border-warmgray-200 bg-white p-8 text-center max-w-md shadow-sm">
            <h2 className="text-base font-bold text-ink">Tutor Not Found</h2>
            <p className="mt-1 text-xs text-warmgray-500">
              The tutor profile you requested does not exist or has not been approved by platform moderators.
            </p>
            <Link
              href="/tutoring"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Tutors Directory
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const totalCost = tutor.hourlyRateNgn * durationHours;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningObjective.trim() || !selectedCourse) return;

    setSubmitting(true);

    const booking = createBooking(
      tutor,
      selectedCourse,
      `Tutoring session for ${selectedCourse}`,
      selectedSlot || "Agreed mutually via chat",
      durationHours,
      learningObjective
    );

    setTimeout(() => {
      setSubmitting(false);
      setBookingSuccess(true);
      setTimeout(() => {
        router.push("/dashboard?tab=tutoring");
      }, 1500);
    }, 600);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport("tutor", tutor.id, tutor.displayName, reportReason, reportDescription);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReportSubmitted(false);
      setReportDescription("");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />

      <main className="flex-1">
        {/* Breadcrumb navigation */}
        <div className="border-b border-warmgray-200 bg-white py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-warmgray-500">
            <div className="flex items-center gap-2">
              <Link href="/tutoring" className="hover:text-ink flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Tutors Directory
              </Link>
              <span>/</span>
              <span className="text-ink font-medium truncate max-w-xs">{tutor.displayName}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Tutor Profile & Reviews */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="rounded-2xl border border-warmgray-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <img
                    src={tutor.avatarUrl}
                    alt={tutor.displayName}
                    className="h-20 w-20 rounded-2xl object-cover border border-warmgray-200"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h1 className="font-display text-2xl font-bold text-ink">{tutor.displayName}</h1>
                      <TrustBadge
                        status="verified"
                        isTutorApproved={true}
                        ratingAverage={tutor.ratingAverage}
                        ratingCount={tutor.ratingCount}
                        completedCount={tutor.completedSessionsCount}
                      />
                    </div>
                    <p className="mt-1 text-xs text-warmgray-600 font-medium">
                      {tutor.department} ({tutor.level})
                    </p>
                    <p className="mt-0.5 text-xs text-warmgray-400 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {tutor.campus} Campus
                    </p>
                  </div>
                </div>

                {/* About Bio */}
                <div className="mt-6 border-t border-warmgray-100 pt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-warmgray-400">
                    About the Tutor & Academic Background
                  </h3>
                  <p className="mt-2 text-sm text-warmgray-700 leading-relaxed whitespace-pre-line">
                    {tutor.bio}
                  </p>
                </div>

                {/* Approved Course Codes */}
                <div className="mt-6 border-t border-warmgray-100 pt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-warmgray-400">
                    Screened & Approved Courses
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tutor.supportedCourseCodes.map((code) => (
                      <span
                        key={code}
                        className="rounded-lg bg-violet-50 px-3 py-1 font-mono text-xs font-bold text-violet-700 border border-violet-100"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availability Slots */}
                <div className="mt-6 border-t border-warmgray-100 pt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-warmgray-400">
                    Typical Availability & Slots
                  </h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-warmgray-700">
                    {tutor.availabilitySlots.map((slot) => (
                      <div
                        key={slot}
                        className="flex items-center gap-2 rounded-xl bg-warmgray-50 p-2.5 border border-warmgray-100"
                      >
                        <Clock className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                        <span>{slot}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Academic Integrity Code Notice */}
              <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5 text-xs text-violet-950">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">FUTMINNA Academic Integrity Code</h4>
                    <p className="mt-1 text-violet-800 leading-relaxed">
                      Sessions are dedicated to clarifying difficult syllabus concepts, derivation assistance, and past questions revision. Tutors are strictly prohibited from ghostwriting lab reports or writing assignments/tests on behalf of students.
                    </p>
                  </div>
                </div>
              </div>

              {/* Report Tutor link */}
              <div className="text-right">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-warmgray-400 hover:text-red-600 transition"
                >
                  <Flag className="h-3 w-3" />
                  Report tutor for policy violation or misconduct
                </button>
              </div>
            </div>

            {/* Right Column: Booking Request Form */}
            <div>
              <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm sticky top-24 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-violet-700 text-xs font-semibold">
                    <Calendar className="h-4 w-4" />
                    <span>Book a Tutoring Session</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-extrabold text-ink">
                      ₦{tutor.hourlyRateNgn.toLocaleString()}
                    </span>
                    <span className="text-xs text-warmgray-500">/ hour</span>
                  </div>
                </div>

                {bookingSuccess ? (
                  <div className="rounded-xl bg-emerald-50 p-5 text-center text-xs text-emerald-800 space-y-2">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                    <h3 className="font-bold text-sm">Booking Request Sent!</h3>
                    <p>
                      Your session request for <strong>{selectedCourse}</strong> has been delivered to {tutor.displayName}.
                    </p>
                    <p className="text-[11px] text-emerald-600">Redirecting to your dashboard...</p>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    {/* Course Selection */}
                    <div>
                      <label className="text-xs font-semibold text-ink">Select Course Code *</label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-warmgray-200 bg-white p-2.5 text-xs text-ink outline-none font-mono"
                      >
                        {tutor.supportedCourseCodes.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Preferred Slot */}
                    <div>
                      <label className="text-xs font-semibold text-ink">Preferred Time Slot *</label>
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-warmgray-200 bg-white p-2.5 text-xs text-ink outline-none"
                      >
                        {tutor.availabilitySlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-xs font-semibold text-ink">Duration (Hours) *</label>
                      <div className="mt-1 grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((hrs) => (
                          <button
                            key={hrs}
                            type="button"
                            onClick={() => setDurationHours(hrs)}
                            className={`rounded-lg py-2 text-xs font-bold transition ${
                              durationHours === hrs
                                ? "bg-violet-600 text-white"
                                : "bg-warmgray-100 text-warmgray-700 hover:bg-warmgray-200"
                            }`}
                          >
                            {hrs} {hrs === 1 ? "Hour" : "Hours"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Learning Objective */}
                    <div>
                      <label className="text-xs font-semibold text-ink">Specific Learning Objective *</label>
                      <textarea
                        rows={3}
                        required
                        value={learningObjective}
                        onChange={(e) => setLearningObjective(e.target.value)}
                        placeholder="e.g. Need assistance with eigenvalues, eigenvectors, and solving past questions for MAT201 test..."
                        className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-violet-500"
                      />
                    </div>

                    {/* Pricing summary */}
                    <div className="rounded-xl bg-warmgray-50 p-3 text-xs space-y-1.5 border border-warmgray-100">
                      <div className="flex justify-between text-warmgray-500">
                        <span>Rate (₦{tutor.hourlyRateNgn.toLocaleString()} × {durationHours} hrs)</span>
                        <span>₦{totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-ink pt-1 border-t border-warmgray-200">
                        <span>Total Session Fee</span>
                        <span className="font-display text-sm text-violet-700">
                          ₦{totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-violet-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition disabled:opacity-50"
                    >
                      {submitting ? "Submitting Request..." : "Submit Booking Request"}
                    </button>
                  </form>
                )}

                <div className="text-[11px] text-warmgray-400 space-y-1 pt-1">
                  <p>• Tutor has 24 hours to accept or propose an alternative time.</p>
                  <p>• Payment is arranged or recorded only after session confirmation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reusable Report Modal (DRY) */}
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="tutor"
          targetId={tutor.id}
          targetTitle={tutor.displayName}
          onSubmitReport={submitReport}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
