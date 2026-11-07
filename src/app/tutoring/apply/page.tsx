/**
 * @file tutoring/apply/page.tsx
 * @description Tutor onboarding and verification application workflow.
 * 
 * MVP Specification Compliance:
 * - Section 6.3 & Criterion 6.3.3: Students submit course codes they can teach, indicative hourly rates,
 *   weekly availability slots, and academic level.
 * - Application is placed in "pending" status awaiting administrative review before appearing in public directory.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { useApp } from "@/lib/context/app-context";
import { sanitizeText } from "@/lib/security/sanitize";
import {
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";

/**
 * Peer tutor onboarding application form.
 */
export default function ApplyTutorPage() {
  const router = useRouter();
  const { currentUser, tutors, submitTutorApplication } = useApp();

  const existingTutorProfile = tutors.find((t) => t.userId === currentUser.id);

  // Form State
  const [coursesInput, setCoursesInput] = useState("MAT201, CSC301");
  const [hourlyRate, setHourlyRate] = useState<number>(2000);
  const [bio, setBio] = useState(
    currentUser.bio ||
      "Achieved an 'A' grade in these courses with a strong grasp of past examination questions, assignments, and test preparation."
  );
  const [availabilitySlots, setAvailabilitySlots] = useState<string[]>([
    "Mon & Wed 4:00 PM - 6:00 PM",
    "Saturdays 10:00 AM - 2:00 PM",
  ]);
  const [newSlotInput, setNewSlotInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleAddSlot = () => {
    if (newSlotInput.trim()) {
      const cleanSlot = sanitizeText(newSlotInput, 60);
      if (cleanSlot) {
        setAvailabilitySlots([...availabilitySlots, cleanSlot]);
        setNewSlotInput("");
      }
    }
  };

  const handleRemoveSlot = (index: number) => {
    setAvailabilitySlots(availabilitySlots.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const codes = coursesInput
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0);

    if (codes.length === 0 || availabilitySlots.length === 0) return;

    submitTutorApplication({
      courseCodes: codes,
      hourlyRateNgn: Number(hourlyRate),
      bio,
      availabilitySlots,
    });

    setSubmitted(true);
    setTimeout(() => {
      router.push("/dashboard?tab=tutoring");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/tutoring"
            className="inline-flex items-center gap-1.5 text-xs text-warmgray-500 hover:text-ink mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Tutors Directory
          </Link>

          <div className="rounded-2xl border border-warmgray-200 bg-white p-6 sm:p-8 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-700">
              <GraduationCap className="h-4 w-4" />
              <span>Peer Tutor Onboarding</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink">
              Apply to Become an Approved Tutor
            </h1>
            <p className="mt-1 text-xs text-warmgray-500 leading-relaxed">
              Earn while supporting fellow FUTMINNA students. To preserve academic quality, all tutor profiles are reviewed by platform moderators before appearing in public course search.
            </p>

            {/* Existing Status check if already applied */}
            {existingTutorProfile && existingTutorProfile.applicationStatus === "approved" ? (
              <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>You are already an Approved Peer Tutor!</span>
                </div>
                <p className="mt-1">
                  Your profile is actively indexed in the campus directory for{" "}
                  <strong>{existingTutorProfile.supportedCourseCodes.join(", ")}</strong>. You can manage incoming session requests from your student dashboard.
                </p>
                <div className="mt-3">
                  <Link
                    href="/dashboard?tab=tutoring"
                    className="inline-flex items-center gap-1 font-bold underline hover:text-emerald-950"
                  >
                    Go to My Tutoring Dashboard &rarr;
                  </Link>
                </div>
              </div>
            ) : existingTutorProfile && existingTutorProfile.applicationStatus === "pending" ? (
              <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span>Your Application is Currently Under Review</span>
                </div>
                <p className="mt-1">
                  Submitted for courses: <strong>{existingTutorProfile.supportedCourseCodes.join(", ")}</strong>. Platform administrators typically review transcripts and approve eligible applications within 24-48 hours.
                </p>
              </div>
            ) : null}

            {submitted ? (
              <div className="mt-8 rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center text-xs text-emerald-800 space-y-2">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h3 className="font-bold text-base">Application Submitted Successfully!</h3>
                <p>
                  Your profile and course selections have been placed in the moderator review queue.
                </p>
                <p className="text-emerald-600">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Applicant Info (read-only) */}
                <div className="rounded-xl bg-warmgray-50 border border-warmgray-200 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-warmgray-400">
                    Applicant Information
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.displayName}
                      className="h-10 w-10 rounded-full object-cover border border-warmgray-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-ink">{currentUser.displayName}</p>
                      <p className="text-[11px] text-warmgray-500">
                        {currentUser.department} • {currentUser.level} ({currentUser.campus} Campus)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course Codes Input */}
                <div>
                  <label className="text-xs font-semibold text-ink">
                    Course Codes You Can Teach (Comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={coursesInput}
                    onChange={(e) => setCoursesInput(e.target.value)}
                    placeholder="e.g. MAT111, MAT201, CSC201, PHY102"
                    className="mt-1.5 w-full rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-violet-500 font-mono uppercase"
                  />
                  <p className="mt-1 text-[11px] text-warmgray-400">
                    Enter the exact FUTMINNA departmental course codes where you scored an 'A' or 'B'.
                  </p>
                </div>

                {/* Proposed Hourly Rate */}
                <div>
                  <label className="text-xs font-semibold text-ink">
                    Proposed Hourly Rate in Naira (₦/hr) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    max={10000}
                    step={200}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="mt-1.5 w-full sm:w-60 rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-violet-500 font-mono"
                  />
                  <p className="mt-1 text-[11px] text-warmgray-400">
                    Recommended student peer rate is typically between ₦1,500 and ₦3,500/hour.
                  </p>
                </div>

                {/* Bio / Qualifications */}
                <div>
                  <label className="text-xs font-semibold text-ink">
                    Academic Qualifications & Teaching Approach *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your mastery of the courses, previous tutoring experience, and how you help students understand complex engineering or mathematical principles..."
                    className="mt-1.5 w-full rounded-xl border border-warmgray-200 p-3 text-xs text-ink outline-none focus:border-violet-500"
                  />
                </div>

                {/* Availability Slots */}
                <div>
                  <label className="text-xs font-semibold text-ink">
                    Weekly Availability Slots *
                  </label>
                  <div className="mt-2 space-y-2">
                    {availabilitySlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl bg-warmgray-50 border border-warmgray-200 px-3 py-2 text-xs text-ink"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-violet-600" />
                          <span>{slot}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(index)}
                          className="text-warmgray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newSlotInput}
                      onChange={(e) => setNewSlotInput(e.target.value)}
                      placeholder="e.g. Tuesdays 3:00 PM - 5:00 PM (SEET Library)"
                      className="flex-1 rounded-xl border border-warmgray-200 p-2 text-xs text-ink outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSlot}
                      className="inline-flex items-center gap-1 rounded-xl bg-warmgray-200 px-3 py-2 text-xs font-semibold text-ink hover:bg-warmgray-300"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Slot
                    </button>
                  </div>
                </div>

                {/* Integrity agreement */}
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-xs text-violet-950 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-violet-700 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>FUTMINNA Tutor Standard:</strong> By applying, you agree never to write continuous assessment tests or submit exams on behalf of any student. Platform approval is conducted by platform moderators and does not constitute university employment.
                    </p>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end gap-3">
                  <Link
                    href="/tutoring"
                    className="rounded-xl border border-warmgray-300 px-4 py-2 text-xs font-medium text-warmgray-700 hover:bg-warmgray-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition"
                  >
                    Submit Application for Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
