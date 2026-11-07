/**
 * @file tutoring/page.tsx
 * @description Academic peer tutoring directory indexed by FUTMINNA course codes.
 * 
 * MVP Specification Compliance:
 * - Section 6.3: Discovery by course code (e.g. MAT111, CSC201), campus location, and hourly budget.
 * - Criterion 6.3.3: Strict filter ensuring only tutors with applicationStatus === "approved" are surfaced.
 * - Architecture: Leverages `TutoringService` for course code normalization and criteria matching.
 */

"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { TrustBadge } from "@/components/shared/trust-badge";
import { TutoringService } from "@/modules/tutoring/services/tutoring.service";
import { TutorCard } from "@/modules/tutoring/components/tutor-card";
import { useApp } from "@/lib/context/app-context";
import {
  GraduationCap,
  Search,
  BookOpen,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  PlusCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

/**
 * Inner component filtering approved tutors based on course queries and location.
 */
function TutoringContent() {
  const { tutors } = useApp();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const [courseQuery, setCourseQuery] = useState(initialQuery);
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [maxRate, setMaxRate] = useState<number>(5000);

  // Domain Service separation (SRP & Clean Architecture)
  const approvedTutors = useMemo(() => {
    return TutoringService.filterTutors(tutors, {
      courseCode: courseQuery,
      campus: selectedCampus,
      maxHourlyRate: maxRate,
    });
  }, [tutors, courseQuery, selectedCampus, maxRate]);

  return (
    <>
      {/* Header */}
      <div className="border-b border-warmgray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-700">
                <GraduationCap className="h-4 w-4" />
                <span>FUTMINNA Academic Peer Tutoring</span>
              </div>
              <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
                Find Approved Course Tutors
              </h1>
              <p className="mt-1 text-xs text-warmgray-500">
                Connect with high-achieving FUTMINNA peer tutors screened for university courses (MAT201, CSC301, PHY102 & more).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/tutoring/apply"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Apply to Become a Tutor</span>
              </Link>
            </div>
          </div>

          {/* Quick Course Code Pills */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-medium text-warmgray-400 mr-1">Popular courses:</span>
            {["MAT111", "MAT201", "CSC201", "CSC301", "PHY102", "CHE201", "STA201"].map((code) => (
              <button
                key={code}
                onClick={() => setCourseQuery(code)}
                className={`rounded-full px-3 py-1 text-xs font-mono font-semibold transition ${
                  courseQuery.toUpperCase() === code
                    ? "bg-violet-600 text-white"
                    : "bg-warmgray-100 text-warmgray-700 hover:bg-warmgray-200"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-warmgray-200 bg-white p-3.5 shadow-sm mb-6">
          <div className="relative w-full sm:w-96 flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-warmgray-400" />
            <input
              type="text"
              value={courseQuery}
              onChange={(e) => setCourseQuery(e.target.value)}
              placeholder="Search course code (e.g. MAT201, CSC301)..."
              className="w-full rounded-xl pl-10 pr-4 py-2 text-xs outline-none text-ink border border-warmgray-200 focus:border-violet-500 font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end text-xs">
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="rounded-lg border border-warmgray-200 bg-warmgray-50 px-3 py-1.5 text-xs text-ink outline-none"
            >
              <option value="all">All Campuses</option>
              <option value="Gidan Kwano">Gidan Kwano Campus</option>
              <option value="Bosso">Bosso Campus</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs text-warmgray-600">
              <span>Max: ₦{maxRate.toLocaleString()}/hr</span>
              <input
                type="range"
                min={1000}
                max={5000}
                step={500}
                value={maxRate}
                onChange={(e) => setMaxRate(Number(e.target.value))}
                className="w-24 accent-violet-600"
              />
            </div>

            {(courseQuery !== "" || selectedCampus !== "all" || maxRate < 5000) && (
              <button
                onClick={() => {
                  setCourseQuery("");
                  setSelectedCampus("all");
                  setMaxRate(5000);
                }}
                className="flex items-center gap-1 text-red-600 hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Results Count & Anti-Cheating Notice */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-warmgray-500">
          <p>
            Showing <strong>{approvedTutors.length}</strong> approved peer tutors
          </p>
          <div className="flex items-center gap-1.5 text-violet-800 bg-violet-50 px-3 py-1 rounded-lg border border-violet-200">
            <ShieldCheck className="h-3.5 w-3.5 text-violet-600 shrink-0" />
            <span>
              <strong>Academic Integrity Policy:</strong> Tutors facilitate peer learning and concept mastery; paid completion of graded assignments or exams is strictly prohibited.
            </span>
          </div>
        </div>

        {/* Tutors Grid (DRY component reuse) */}
        {approvedTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedTutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                highlightCourseCode={courseQuery}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-warmgray-300 bg-white p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-warmgray-300" />
            <h3 className="mt-3 text-sm font-bold text-ink">No approved tutors match this course code</h3>
            <p className="mt-1 text-xs text-warmgray-500">
              Are you an expert in {courseQuery || "this subject"}? Apply to become a peer tutor!
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/tutoring/apply"
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Apply as a Tutor
              </Link>
              <button
                onClick={() => {
                  setCourseQuery("");
                  setSelectedCampus("all");
                }}
                className="rounded-xl border border-warmgray-300 px-4 py-2 text-xs font-medium text-warmgray-700"
              >
                View all tutors
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function TutoringDirectoryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs text-warmgray-500">Loading tutors directory...</div>}>
          <TutoringContent />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
