/**
 * Trust Indicators Component (Section 6.7.2)
 * Displays verified university affiliation, tutor approval badge,
 * peer ratings, and completed transaction counters without single opaque numerical scores.
 */

import React from "react";
import { CheckCircle2, ShieldCheck, Award, Star, Clock } from "lucide-react";
import { VerificationStatus } from "@/types";

interface TrustBadgeProps {
  /** Verification status of student university affiliation */
  status: VerificationStatus;
  /** Whether student email address is validated */
  isEmailVerified?: boolean;
  /** Whether user is a screened and approved course tutor */
  isTutorApproved?: boolean;
  /** Average student rating out of 5.0 */
  ratingAverage?: number;
  /** Number of eligible reviews received */
  ratingCount?: number;
  /** Count of confirmed completed transactions/sessions */
  completedCount?: number;
  /** Badge size variant */
  size?: "sm" | "md";
}

export function TrustBadge({
  status,
  isEmailVerified = true,
  isTutorApproved = false,
  ratingAverage,
  ratingCount,
  completedCount,
  size = "md",
}: TrustBadgeProps) {
  const isSm = size === "sm";

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {status === "verified" ? (
        <span
          title="Platform verified FUTMINNA student affiliation"
          className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 font-medium text-emerald-700 border border-emerald-200 ${
            isSm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
        >
          <ShieldCheck className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} />
          Affiliation Verified
        </span>
      ) : status === "pending" ? (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-amber-50 font-medium text-amber-700 border border-amber-200 ${
            isSm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
        >
          <Clock className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} />
          Review Pending
        </span>
      ) : (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-slate-100 font-medium text-slate-600 border border-slate-200 ${
            isSm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
        >
          Unverified Student
        </span>
      )}

      {isTutorApproved && (
        <span
          title="Reviewed and approved FUTMINNA peer tutor"
          className={`inline-flex items-center gap-1 rounded-full bg-violet-50 font-medium text-violet-700 border border-violet-200 ${
            isSm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
        >
          <Award className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} />
          Approved Tutor
        </span>
      )}

      {ratingAverage !== undefined && ratingCount !== undefined && ratingCount > 0 && (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-amber-50 font-medium text-amber-800 border border-amber-200 ${
            isSm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
        >
          <Star className={`${isSm ? "h-3 w-3" : "h-3.5 w-3.5"} fill-amber-400 text-amber-400`} />
          {ratingAverage.toFixed(1)} ({ratingCount})
        </span>
      )}

      {completedCount !== undefined && completedCount > 0 && (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-slate-100 font-medium text-slate-700 border border-slate-200 ${
            isSm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
        >
          <CheckCircle2 className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} />
          {completedCount} completed
        </span>
      )}
    </div>
  );
}
