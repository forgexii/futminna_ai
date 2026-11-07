/**
 * Tutoring Domain Service
 * Encapsulates peer tutor discovery, course code normalization, session pricing,
 * and booking state machine lifecycle transitions (Section 6.3).
 */

import { TutorProfile, Booking, BookingStatus } from "@/types";
import { normalizeCourseCode } from "@/lib/utils/formatters";

/**
 * Filter parameters for searching and matching course tutors.
 */
export interface TutorFilterOptions {
  courseCode?: string;
  campus?: string;
  maxHourlyRate?: number;
}

export class TutoringService {
  /**
   * Filters and matches approved tutors against user criteria.
   *
   * Business Rules:
   * 1. Section 6.3.3: Unapproved tutors CANNOT appear in public discovery.
   * 2. Course code matching normalizes whitespace and casing (e.g. "mat 201" matches "MAT201").
   *
   * @param tutors - All tutor records from repository or state
   * @param options - Student search criteria
   * @returns Array of eligible, approved tutors matching criteria
   */
  static filterTutors(tutors: TutorProfile[], options: TutorFilterOptions): TutorProfile[] {
    const { courseCode = "", campus = "all", maxHourlyRate = 10000 } = options;
    const normalizedQuery = normalizeCourseCode(courseCode);

    return tutors.filter((tutor) => {
      // Rule 6.3.3: Strict approval gate
      if (tutor.applicationStatus !== "approved") return false;

      // Campus gate (Gidan Kwano vs Bosso)
      if (campus !== "all" && tutor.campus !== campus) return false;

      // Hourly budget gate
      if (tutor.hourlyRateNgn > maxHourlyRate) return false;

      // Course code and profile search
      if (normalizedQuery) {
        const matchesCourse = tutor.supportedCourseCodes.some((code) =>
          normalizeCourseCode(code).includes(normalizedQuery)
        );
        const matchesName = tutor.displayName.toLowerCase().includes(courseCode.toLowerCase());
        const matchesDept = tutor.department.toLowerCase().includes(courseCode.toLowerCase());
        if (!matchesCourse && !matchesName && !matchesDept) return false;
      }

      return true;
    });
  }

  /**
   * Calculates total session fee based on tutor hourly rate and requested duration.
   * Clamps session duration between 1 and 8 hours to prevent overflow/erroneous booking states.
   *
   * @param hourlyRate - Hourly fee in Naira (₦)
   * @param durationHours - Duration of the session in hours
   * @returns Total Naira fee
   */
  static calculateSessionCost(hourlyRate: number, durationHours: number): number {
    const clampedHours = Math.max(1, Math.min(durationHours, 8));
    return hourlyRate * clampedHours;
  }

  /**
   * State Machine validation: verifies whether a booking transition from
   * `currentStatus` to `nextStatus` complies with session coordination policies (Section 6.3.2).
   *
   * @param currentStatus - Current booking lifecycle status
   * @param nextStatus - Target status requested by student or tutor
   * @returns true if transition is permissible under platform policy
   */
  static isValidBookingTransition(currentStatus: BookingStatus, nextStatus: BookingStatus): boolean {
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      requested: ["accepted", "alternative_proposed", "confirmed", "cancelled"],
      accepted: ["confirmed", "cancelled"],
      alternative_proposed: ["confirmed", "cancelled"],
      confirmed: ["completed", "cancelled", "disputed"],
      completed: ["disputed"],
      cancelled: [],
      disputed: ["completed", "cancelled"],
    };

    return validTransitions[currentStatus]?.includes(nextStatus) ?? false;
  }
}
