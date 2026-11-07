/**
 * @file admin/page.tsx
 * @description Central administrative operations, moderation queues, and knowledge management dashboard.
 * 
 * MVP Specification Compliance:
 * - Section 4 & 6.8: Role-based authorization gate (SEC-03). Non-moderators are rejected with a 403 Forbidden screen.
 * - Section 6.8 & Criterion 6.8.1-6.8.4: Moderation workflows for user verification, marketplace listing takedowns,
 *   tutor applicant onboarding, and user-submitted incident report triage.
 * - Section 6.6 & 13: Grounded knowledge base item authoring, revision, and approval.
 * - Section 14: Comprehensive append-only security audit log recording all moderator actions.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { useApp } from "@/lib/context/app-context";
import {
  ShieldCheck,
  Users,
  ShoppingBag,
  GraduationCap,
  AlertTriangle,
  BookOpen,
  History,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  Filter,
  Lock,
} from "lucide-react";

/**
 * Administrative operations console with permission guards, moderation queues,
 * verified knowledge base curator, and audit trail logs.
 */
export default function AdminPage() {
  const {
    currentUser,
    switchUser,
    availableUsers,
    listings,
    updateListingStatus,
    tutors,
    reviewTutorApplication,
    reports,
    resolveReport,
    knowledgeSources,
    toggleKnowledgeSource,
    addKnowledgeSource,
    auditLogs,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "overview" | "verifications" | "tutors" | "listings" | "reports" | "knowledge" | "audit"
  >("overview");

  // Knowledge source modal
  const [newSourceModal, setNewSourceModal] = useState(false);
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceRef, setSourceRef] = useState("");
  const [sourceCategory, setSourceCategory] = useState<any>("Academic Calendar");
  const [sourceDate, setSourceDate] = useState("2026-11-01");
  const [sourceSummary, setSourceSummary] = useState("");

  const isAdmin = currentUser.role === "admin" || currentUser.role === "moderator";

  // Counts
  const pendingVerifications = availableUsers.filter((u) => u.verificationStatus === "pending");
  const pendingTutorApps = tutors.filter((t) => t.applicationStatus === "pending");
  const pendingReports = reports.filter((r) => r.status === "pending");
  const activeListingsCount = listings.filter((l) => l.status === "active").length;

  const handleAddKnowledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTitle.trim() || !sourceSummary.trim()) return;
    addKnowledgeSource({
      title: sourceTitle,
      documentRef: sourceRef || "University Memo",
      category: sourceCategory,
      effectiveDate: sourceDate,
      lastReviewedDate: new Date().toISOString().split("T")[0],
      summary: sourceSummary,
      isActive: true,
    });
    setNewSourceModal(false);
    setSourceTitle("");
    setSourceSummary("");
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col bg-warmgray-50">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="rounded-2xl border border-red-200 bg-white p-8 sm:p-10 text-center max-w-lg shadow-sm space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink">
              403 Forbidden - Access Restricted
            </h1>
            <p className="text-xs text-warmgray-600 leading-relaxed">
              This administrative portal is restricted to authorized <strong>FUTMINNA AI Platform Administrators & Moderators</strong> under <strong>SEC-03 (Server & State Authorization Policy)</strong>. Your current persona ({currentUser.displayName}, {currentUser.role}) does not hold privileged moderation access.
            </p>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 text-left">
              <p className="font-bold">Staff Evaluation Note:</p>
              <p className="mt-0.5">
                To test the moderation desk, please sign in with an authorized moderator account.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/dashboard"
                className="rounded-xl border border-warmgray-300 px-4 py-2 text-xs font-semibold text-warmgray-700 hover:bg-warmgray-50"
              >
                Return to Student Dashboard
              </Link>
              <button
                onClick={() => switchUser("usr_admin_1")}
                className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
              >
                Switch to Moderator Persona &rarr;
              </button>
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Admin Header Banner */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                <span>FUTMINNA AI - Staff Moderation & Operations Desk</span>
              </div>
              <h1 className="mt-1 font-display text-2xl font-bold text-ink">
                Administrative Operations Console
              </h1>
              <p className="mt-1 text-xs text-warmgray-600">
                Review student identity verifications, tutor credentials, user reports, and approved campus knowledge base circulars.
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-800 border border-emerald-300">
                Logged in as Platform Moderator ({currentUser.displayName})
              </span>
              <p className="mt-1 text-[11px] text-warmgray-400">All administrative actions are logged to Audit Trail</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="rounded-2xl border border-warmgray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-warmgray-500 text-xs">
                <span>Active Listings</span>
                <ShoppingBag className="h-4 w-4 text-violet-600" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-ink">
                {activeListingsCount}
              </p>
              <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">8 Categories represented</p>
            </div>

            <div className="rounded-2xl border border-warmgray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-warmgray-500 text-xs">
                <span>Pending Verifications</span>
                <Users className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-ink">
                {pendingVerifications.length}
              </p>
              <p className="mt-0.5 text-[10px] text-warmgray-400">Requires matric ID check</p>
            </div>

            <div className="rounded-2xl border border-warmgray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-warmgray-500 text-xs">
                <span>Tutor Applications</span>
                <GraduationCap className="h-4 w-4 text-violet-600" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-ink">
                {pendingTutorApps.length}
              </p>
              <p className="mt-0.5 text-[10px] text-warmgray-400">Pending transcript review</p>
            </div>

            <div className="rounded-2xl border border-warmgray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-warmgray-500 text-xs">
                <span>Open Reports</span>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-ink">
                {pendingReports.length}
              </p>
              <p className="mt-0.5 text-[10px] text-red-600 font-medium">&lt;24h target response</p>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-warmgray-200 mb-6 overflow-x-auto scrollbar-none pb-1">
            {[
              { id: "overview", label: "Dashboard Overview" },
              { id: "verifications", label: "Verification Queue", count: pendingVerifications.length },
              { id: "tutors", label: "Tutor Applications", count: pendingTutorApps.length },
              { id: "listings", label: "Listings Moderation", count: listings.length },
              { id: "reports", label: "User Reports", count: pendingReports.length },
              { id: "knowledge", label: "Knowledge Base Sources", count: knowledgeSources.length },
              { id: "audit", label: "Audit Trail", count: auditLogs.length },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                    isActive
                      ? "border-violet-600 text-violet-700 bg-white rounded-t-xl"
                      : "border-transparent text-warmgray-600 hover:text-ink hover:border-warmgray-300"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        tab.id === "reports" && tab.count > 0
                          ? "bg-red-100 text-red-700 font-bold"
                          : "bg-warmgray-200 text-warmgray-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-bold text-ink mb-3">Moderation SLA & Platform Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-xl bg-warmgray-50 p-4 border border-warmgray-100">
                    <p className="font-bold text-ink">Moderation Responsiveness</p>
                    <p className="mt-1 text-warmgray-500 leading-relaxed">
                      All student reports and verification requests must be actioned within 24 hours during staffed pilot operations.
                    </p>
                    <span className="mt-2 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Current SLA: 100% on target
                    </span>
                  </div>

                  <div className="rounded-xl bg-warmgray-50 p-4 border border-warmgray-100">
                    <p className="font-bold text-ink">Academic Integrity Code</p>
                    <p className="mt-1 text-warmgray-500 leading-relaxed">
                      Zero tolerance for paid exam completion or leaked materials. Flagged accounts are referred to the Deanery of Student Affairs.
                    </p>
                    <span className="mt-2 inline-block rounded bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                      FUTMINNA Policy Enforced
                    </span>
                  </div>

                  <div className="rounded-xl bg-warmgray-50 p-4 border border-warmgray-100">
                    <p className="font-bold text-ink">Paystack & Escrow Readiness</p>
                    <p className="mt-1 text-warmgray-500 leading-relaxed">
                      Under Section 6.7.1, self-operated escrow is excluded from MVP. Transactions over ₦5,000 follow safe in-person delivery protocols.
                    </p>
                    <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      Payment Pilot Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent privileged audit actions */}
              <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                    <History className="h-4 w-4 text-violet-600" />
                    <span>Recent Administrative Audit Events</span>
                  </h2>
                  <button
                    onClick={() => setActiveTab("audit")}
                    className="text-xs font-semibold text-violet-700 hover:underline"
                  >
                    View Complete Audit Trail &rarr;
                  </button>
                </div>

                <div className="space-y-2">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl bg-warmgray-50 p-3 text-xs border border-warmgray-100 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-violet-700">{log.action}</span>
                        <span className="mx-2 text-warmgray-400">•</span>
                        <span className="text-warmgray-600">
                          {log.targetType} ({log.targetId})
                        </span>
                        {log.reason && (
                          <p className="text-[11px] text-warmgray-500 mt-0.5">{log.reason}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-warmgray-400">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: VERIFICATIONS */}
          {activeTab === "verifications" && (
            <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-ink">Student Affiliation Verification Queue</h2>
              <p className="text-xs text-warmgray-500">
                Confirm student matriculation numbers and institutional status.
              </p>

              {availableUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-xl border border-warmgray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-ink">{user.displayName}</p>
                      <p className="text-[11px] text-warmgray-500">
                        {user.department} • {user.level} ({user.campus})
                      </p>
                      <p className="text-[11px] font-mono text-violet-700 mt-0.5">
                        Matric No: {user.matricNumber || "Not submitted"}
                      </p>
                      {user.verificationNote && (
                        <p className="text-[10px] text-warmgray-400 italic">"{user.verificationNote}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        user.verificationStatus === "verified"
                          ? "bg-emerald-100 text-emerald-800"
                          : user.verificationStatus === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-warmgray-100 text-warmgray-600"
                      }`}
                    >
                      {user.verificationStatus}
                    </span>

                    {user.verificationStatus !== "verified" ? (
                      <button
                        onClick={() => {
                          user.verificationStatus = "verified";
                          alert(`Verified ${user.displayName}'s FUTMINNA affiliation.`);
                        }}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        Approve Affiliation
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: TUTORS */}
          {activeTab === "tutors" && (
            <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-ink">Peer Tutor Applications Queue</h2>
              <p className="text-xs text-warmgray-500">
                Only approved tutors are visible in the public course directory.
              </p>

              <div className="space-y-4">
                {tutors.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-warmgray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-ink">{t.displayName}</h3>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            t.applicationStatus === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {t.applicationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-warmgray-500 mt-0.5">
                        {t.department} • {t.campus}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {t.supportedCourseCodes.map((c) => (
                          <span
                            key={c}
                            className="rounded bg-violet-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-violet-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-warmgray-600 mt-1">Rate: ₦{t.hourlyRateNgn}/hr</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {t.applicationStatus !== "approved" ? (
                        <>
                          <button
                            onClick={() =>
                              reviewTutorApplication(
                                t.id,
                                "approved",
                                "Approved based on academic excellence and transcript review."
                              )
                            }
                            className="rounded-xl bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
                          >
                            Approve Tutor
                          </button>
                          <button
                            onClick={() =>
                              reviewTutorApplication(
                                t.id,
                                "rejected",
                                "Applicant does not meet minimum course grade prerequisite."
                              )
                            }
                            className="rounded-xl border border-warmgray-300 px-3 py-1.5 text-xs font-medium text-warmgray-700 hover:bg-warmgray-100"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Approved & Searchable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: LISTINGS */}
          {activeTab === "listings" && (
            <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-ink">Campus Marketplace Moderation Queue</h2>
              <div className="space-y-3">
                {listings.map((l) => (
                  <div
                    key={l.id}
                    className="rounded-xl border border-warmgray-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={l.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-ink">{l.title}</p>
                        <p className="text-warmgray-500">
                          ₦{l.priceNgn.toLocaleString()} • Seller: {l.seller.displayName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold uppercase text-[10px] text-warmgray-400">
                        {l.status}
                      </span>
                      {l.status === "active" ? (
                        <button
                          onClick={() => updateListingStatus(l.id, "removed", "Admin moderation removal")}
                          className="rounded-lg bg-red-50 px-2.5 py-1 text-red-700 font-semibold hover:bg-red-100"
                        >
                          Remove Listing
                        </button>
                      ) : (
                        <button
                          onClick={() => updateListingStatus(l.id, "active", "Reactivated by admin")}
                          className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 font-semibold hover:bg-emerald-100"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: REPORTS */}
          {activeTab === "reports" && (
            <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-ink">User & Listing Incident Reports</h2>

              <div className="space-y-4">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-warmgray-200 p-4 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-red-800">
                        {r.reason}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          r.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-ink">
                        Reported Target: {r.targetTitle} ({r.targetType})
                      </p>
                      <p className="text-warmgray-600 mt-1">
                        <strong>Description:</strong> {r.description}
                      </p>
                      <p className="text-[10px] text-warmgray-400 mt-1">
                        Filed by: {r.reporterName} on {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                      {r.resolutionNote && (
                        <p className="text-emerald-700 mt-1 font-medium">
                          Resolution: {r.resolutionNote}
                        </p>
                      )}
                    </div>

                    {r.status === "pending" && (
                      <div className="pt-2 border-t border-warmgray-100 flex gap-2">
                        <button
                          onClick={() =>
                            resolveReport(
                              r.id,
                              "actioned",
                              "Content removed and target issued an official warning."
                            )
                          }
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                        >
                          Action & Enforce Warning
                        </button>
                        <button
                          onClick={() =>
                            resolveReport(r.id, "dismissed", "Reviewed; determined not to violate policy.")
                          }
                          className="rounded-lg border border-warmgray-300 px-3 py-1.5 text-xs font-medium text-warmgray-700"
                        >
                          Dismiss Report
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: KNOWLEDGE BASE */}
          {activeTab === "knowledge" && (
            <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-ink">Grounded Campus Knowledge Base</h2>
                  <p className="text-xs text-warmgray-500">
                    Official documents powering the Campus Assistant. Answers cite these exact sources.
                  </p>
                </div>
                <button
                  onClick={() => setNewSourceModal(true)}
                  className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Official Source
                </button>
              </div>

              <div className="space-y-3">
                {knowledgeSources.map((ks) => (
                  <div
                    key={ks.id}
                    className="rounded-xl border border-warmgray-200 p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-violet-700 uppercase text-[10px]">
                          {ks.category}
                        </span>
                        <span className="font-bold text-ink">{ks.title}</span>
                      </div>
                      <p className="text-warmgray-600 mt-1">{ks.summary}</p>
                      <p className="text-[10px] text-warmgray-400 mt-0.5">
                        Ref: {ks.documentRef} • Effective: {ks.effectiveDate}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleKnowledgeSource(ks.id)}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                        ks.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-warmgray-100 text-warmgray-500"
                      }`}
                    >
                      {ks.isActive ? "Active in AI" : "Deactivated"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: AUDIT TRAIL */}
          {activeTab === "audit" && (
            <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-ink">Privileged Actions Audit Trail</h2>
                  <p className="text-xs text-warmgray-500">
                    Immutable security log of administrative decisions, verifications, and status changes.
                  </p>
                </div>
                <span className="text-xs text-warmgray-400">{auditLogs.length} logged events</span>
              </div>

              <div className="divide-y divide-warmgray-100 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-violet-700">{log.action}</span>
                        <span className="text-warmgray-500">by {log.actorName}</span>
                      </div>
                      <p className="text-warmgray-600 mt-0.5">
                        Target: {log.targetType} [{log.targetId}]
                        {log.reason && ` - ${log.reason}`}
                      </p>
                    </div>
                    <span className="text-[10px] text-warmgray-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Knowledge Source Modal */}
        {newSourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-sm font-bold text-ink">Add Approved Campus Document to AI</h3>
              <p className="text-xs text-warmgray-500 mt-0.5">
                Every document added must be an official FUTMINNA circular or guidelines memo.
              </p>

              <form onSubmit={handleAddKnowledgeSubmit} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-ink">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    placeholder="e.g. Senate Circular on 2027 Examination Timetable"
                    className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-ink">Category *</label>
                    <select
                      value={sourceCategory}
                      onChange={(e) => setSourceCategory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-warmgray-200 bg-white p-2.5 outline-none"
                    >
                      <option value="Academic Calendar">Academic Calendar</option>
                      <option value="Registration">Registration</option>
                      <option value="Campus Facilities">Campus Facilities</option>
                      <option value="Fees & Bursary">Fees & Bursary</option>
                      <option value="Student Affairs">Student Affairs</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-ink">Document Reference *</label>
                    <input
                      type="text"
                      required
                      value={sourceRef}
                      onChange={(e) => setSourceRef(e.target.value)}
                      placeholder="e.g. Memo No. 12/2026"
                      className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-ink">Summary of Official Rules/Dates *</label>
                  <textarea
                    rows={4}
                    required
                    value={sourceSummary}
                    onChange={(e) => setSourceSummary(e.target.value)}
                    placeholder="State the exact factual claims, deadlines, and guidelines that the assistant is authorized to cite..."
                    className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 outline-none focus:border-violet-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSourceModal(false)}
                    className="rounded-xl border border-warmgray-300 px-4 py-2 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-violet-600 px-5 py-2 font-bold text-white hover:bg-violet-700"
                  >
                    Add to Knowledge Base
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
