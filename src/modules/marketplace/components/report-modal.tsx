/**
 * @file report-modal.tsx
 * @description Universal modal dialog for reporting suspicious, fraudulent, or policy-violating items.
 * 
 * MVP Specification Compliance:
 * - Section 6.8 & 14: User safety & dispute escalation flow.
 * - Allows reporting of listings, tutors, users, and conversations.
 * - Captures standardized report reasons (Fraud or Scam, Misleading Information, Harassment, etc.)
 *   with required detailed descriptions.
 */

import React, { useState } from "react";
import { Report } from "@/types";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

/**
 * Props for ReportModal component.
 */
interface ReportModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Category of entity being reported */
  targetType: "listing" | "tutor" | "user" | "conversation";
  /** Identifier of the target entity */
  targetId: string;
  /** Human-readable title or label of target */
  targetTitle: string;
  /** Dispatcher function to log the report into moderation state */
  onSubmitReport: (
    targetType: "listing" | "tutor" | "user" | "conversation",
    targetId: string,
    targetTitle: string,
    reason: Report["reason"],
    description: string
  ) => void;
}

/**
 * Universal reporting modal dialog providing instant user feedback upon submission.
 */
export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  onSubmitReport,
}: ReportModalProps) {
  const [reason, setReason] = useState<Report["reason"]>("Fraud or Scam");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onSubmitReport(targetType, targetId, targetTitle, reason, description);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription("");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-warmgray-400 hover:bg-warmgray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>Report {targetType} to Campus Moderators</span>
        </div>
        <p className="mt-1 text-xs text-warmgray-500">
          Target: <strong>{targetTitle}</strong>. All reports are treated confidentially and reviewed within 24 hours.
        </p>

        {submitted ? (
          <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-center text-xs text-emerald-800">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
            <p className="font-bold">Report Submitted Successfully</p>
            <p className="mt-1">Our moderation team has queued this item for investigation.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-ink">Violation Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as Report["reason"])}
                className="mt-1 w-full rounded-xl border border-warmgray-200 bg-white p-2.5 text-xs text-ink outline-none"
              >
                <option value="Fraud or Scam">Suspected Fraud or Advance Fee Scam</option>
                <option value="Academic Misconduct">Academic Misconduct (Leaked Exams, Impersonation)</option>
                <option value="Counterfeit or Prohibited">Counterfeit, Stolen, or Prohibited Items</option>
                <option value="Inappropriate Content">Inappropriate Content or Language</option>
                <option value="Harassment">Harassment or Abuse</option>
                <option value="Other">Other Policy Violation</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink">Explanation / Details</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe why this item violates platform rules or poses a risk..."
                className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 rounded-xl border border-warmgray-300 py-2 text-xs font-medium text-warmgray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 rounded-xl bg-red-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
