/**
 * @file tutor-card.tsx
 * @description Reusable presentational card component for verified academic tutors.
 * 
 * Engineering & Safety Principles:
 * - DRY: Shared across Homepage spotlight and Tutoring catalog directory.
 * - Criterion 6.3.3: Integrates TrustBadge to clearly convey tutor verification, rating, and completed session count.
 * - UX: Dynamically highlights courses that match the user's active search filter.
 */

import React from "react";
import Link from "next/link";
import { TutorProfile } from "@/types";
import { TrustBadge } from "@/components/shared/trust-badge";
import { formatNaira } from "@/lib/utils/formatters";
import { MapPin, Clock } from "lucide-react";

/**
 * Props for the TutorCard component.
 */
interface TutorCardProps {
  /** The approved tutor entity to render */
  tutor: TutorProfile;
  /** Optional active course query string to visually highlight matching course codes */
  highlightCourseCode?: string;
}

/**
 * Presentational card showing tutor credentials, department, campus location,
 * hourly rate in Naira, course expertise badges, and booking CTA.
 */
export function TutorCard({ tutor, highlightCourseCode = "" }: TutorCardProps) {
  const normHighlight = highlightCourseCode.replace(/\s+/g, "").toUpperCase();

  return (
    <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-violet-300 hover:shadow-md transition">
      <div>
        {/* Header: Avatar, Name, Dept */}
        <div className="flex items-start gap-3">
          <img
            src={tutor.avatarUrl}
            alt={tutor.displayName}
            className="h-12 w-12 rounded-full object-cover border border-warmgray-200 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-ink truncate">{tutor.displayName}</h3>
            <p className="text-xs text-warmgray-500 truncate">{tutor.department}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[11px] text-warmgray-400">
                <MapPin className="h-3 w-3" />
                {tutor.campus} ({tutor.level})
              </span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-3">
          <TrustBadge
            status="verified"
            isTutorApproved={true}
            ratingAverage={tutor.ratingAverage}
            ratingCount={tutor.ratingCount}
            completedCount={tutor.completedSessionsCount}
            size="sm"
          />
        </div>

        {/* Bio */}
        <p className="mt-3 text-xs text-warmgray-600 line-clamp-2 leading-relaxed">
          {tutor.bio}
        </p>

        {/* Supported Course Codes */}
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-warmgray-400">
            Supported Courses
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tutor.supportedCourseCodes.map((code) => {
              const isMatch = normHighlight && code.toUpperCase().includes(normHighlight);
              return (
                <span
                  key={code}
                  className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold border ${
                    isMatch
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-violet-50 text-violet-700 border-violet-100"
                  }`}
                >
                  {code}
                </span>
              );
            })}
          </div>
        </div>

        {/* Availability Summary */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-warmgray-500">
          <Clock className="h-3.5 w-3.5 text-warmgray-400 shrink-0" />
          <span className="truncate">{tutor.availabilitySummary}</span>
        </div>
      </div>

      {/* Footer: Rate & Action */}
      <div className="mt-6 pt-4 border-t border-warmgray-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-warmgray-400 font-semibold uppercase">Hourly Rate</p>
          <p className="font-display text-lg font-bold text-ink">
            {formatNaira(tutor.hourlyRateNgn)}
            <span className="text-xs font-normal text-warmgray-500"> / hr</span>
          </p>
        </div>

        <Link
          href={`/tutoring/${tutor.id}`}
          className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          Request Session
        </Link>
      </div>
    </div>
  );
}
