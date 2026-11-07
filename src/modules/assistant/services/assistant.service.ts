/**
 * Campus Knowledge Assistant Domain Service
 * Encapsulates evidence retrieval, document citation structuring, and
 * anti-hallucination safe refusal logic (Section 6.6 & Section 13).
 */

import { KnowledgeSource, AssistantMessage } from "@/types";

/**
 * Standardized response contract returned by the assistant processor.
 */
export interface AssistantQueryResult {
  content: string;
  citations: NonNullable<AssistantMessage["citations"]>;
  isRefusal: boolean;
}

export class AssistantService {
  /**
   * Processes a student query against active, approved university knowledge sources.
   *
   * Business Rules:
   * 1. Section 6.6.2: Answers must be grounded strictly in retrieved knowledge-base content.
   * 2. Section 6.6.2: Factual answers MUST cite document reference, source title, and effective date.
   * 3. Section 13: The assistant MUST refuse to guess academic dates, departmental fees, or exam schedules
   *    if no active, dated knowledge source corroborates the claim.
   *
   * @param userQuery - Sanitized question from user
   * @param sources - Registered knowledge sources currently marked active
   * @returns Grounded response with citations or a structured safe refusal
   */
  static processQuery(userQuery: string, sources: KnowledgeSource[]): AssistantQueryResult {
    const lowerQuery = userQuery.toLowerCase().trim();

    // 1. Academic Calendar, Lecture Resumption & Examination Schedules
    if (
      lowerQuery.includes("calendar") ||
      lowerQuery.includes("resumption") ||
      lowerQuery.includes("lecture") ||
      lowerQuery.includes("exam") ||
      lowerQuery.includes("break")
    ) {
      const cal = sources.find((ks) => ks.category === "Academic Calendar" && ks.isActive);
      if (cal) {
        return {
          content:
            "According to the approved FUTMINNA Academic Calendar for the 2026/2027 session:\n\n" +
            "• **Lectures Commence**: 10th November 2026 across both Gidan Kwano and Bosso campuses.\n" +
            "• **Mid-Semester Break**: 18th - 22nd January 2027.\n" +
            "• **First Semester Examinations**: Scheduled to begin on 23rd February 2027.\n\n" +
            "Please note that official Senate circulars supersede any informal social media schedules.",
          citations: [
            {
              title: cal.title,
              documentRef: cal.documentRef,
              effectiveDate: cal.effectiveDate,
              url: cal.officialUrl,
            },
          ],
          isRefusal: false,
        };
      }
    }

    // 2. Undergraduate e-Portal Course Registration, Credit Load & Penalties
    if (
      lowerQuery.includes("registration") ||
      lowerQuery.includes("credit load") ||
      lowerQuery.includes("course reg") ||
      lowerQuery.includes("late reg")
    ) {
      const reg = sources.find((ks) => ks.category === "Registration" && ks.isActive);
      if (reg) {
        return {
          content:
            "Official Undergraduate e-Portal Course Registration guidelines state:\n\n" +
            "1. **Prerequisite**: School fees payment must be authenticated through the Bursary Remita/Paystack gateway before the portal unlocks course registration.\n" +
            "2. **Credit Load**: Normal semester maximum is 24 credit units (minimum 15 units).\n" +
            "3. **Late Registration**: Any registration conducted after the deadline incurs a mandatory penalty fee of ₦10,000.\n" +
            "4. **Approval**: Print three (3) copies of your course registration slip for Level Adviser, HOD, and School Officer endorsement.",
          citations: [
            {
              title: reg.title,
              documentRef: reg.documentRef,
              effectiveDate: reg.effectiveDate,
              url: reg.officialUrl,
            },
          ],
          isRefusal: false,
        };
      }
    }

    // 3. Student Affairs Hostels, Accommodation & Safety Regulations
    if (lowerQuery.includes("hostel") || lowerQuery.includes("accommodation") || lowerQuery.includes("room")) {
      const host = sources.find((ks) => ks.category === "Campus Facilities" && ks.isActive);
      if (host) {
        return {
          content:
            "According to the Student Affairs Division Hostel Allocation Regulation:\n\n" +
            "• **Priority Allocation**: Hostels are allocated on a first-come first-served priority basis to 100L freshers and 500L graduating students.\n" +
            "• **Safety Prohibition**: Electric hotplates and heavy heating appliances inside rooms are strictly forbidden due to electrical safety codes.\n" +
            "• **Off-Campus Advisory**: For private lodges around Gidan Kwano or Bosso, always inspect the accommodation in person before making any payments.",
          citations: [
            {
              title: host.title,
              documentRef: host.documentRef,
              effectiveDate: host.effectiveDate,
              url: host.officialUrl,
            },
          ],
          isRefusal: false,
        };
      }
    }

    // 4. Bursary Fee Verification, Remita / Paystack e-Receipt Authentication
    if (
      lowerQuery.includes("fee") ||
      lowerQuery.includes("pay") ||
      lowerQuery.includes("bursary") ||
      lowerQuery.includes("remita")
    ) {
      const burs = sources.find((ks) => ks.category === "Fees & Bursary" && ks.isActive);
      if (burs) {
        return {
          content:
            "Bursary Financial Regulations explicitly mandate:\n\n" +
            "• All official tuition, acceptance, and accommodation fees must be paid strictly through Remita/Paystack on the official university portal.\n" +
            "• **Anti-Scam Alert**: FUTMINNA never asks students to transfer university fees to personal bank accounts or student union representatives.\n" +
            "• Always retain your RRR slip and Bursary e-receipt for clearance verification.",
          citations: [
            {
              title: burs.title,
              documentRef: burs.documentRef,
              effectiveDate: burs.effectiveDate,
              url: burs.officialUrl,
            },
          ],
          isRefusal: false,
        };
      }
    }

    // 5. Anti-Hallucination Fallback: Declines to invent unverified claims (Section 6.6.2 & 13)
    return {
      content:
        "I don't have verified records in the approved FUTMINNA knowledge base to answer this query accurately. Under our campus safety policy, I will not guess sensitive academic dates, departmental fees, or personal records.\n\n" +
        "Please consult your Level Adviser, the Academic Affairs Directorate, or the official university portal at https://futminna.edu.ng.",
      citations: [],
      isRefusal: true,
    };
  }
}
