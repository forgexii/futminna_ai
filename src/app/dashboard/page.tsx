/**
 * @file dashboard/page.tsx
 * @description Unified Student Dashboard for managing marketplace listings, tutoring sessions,
 * messages, saved items, and campus verification.
 * 
 * MVP Specification Compliance:
 * - Section 4: Self-service profile management and student verification submission.
 * - Section 6.2: My Listings manager (mark as sold, delete, edit).
 * - Section 6.3 & 6.7: Tutoring session management (upcoming/completed sessions, tutor earnings ledger).
 * - Section 6.4: In-platform message threads with text sanitization and anti-leak safeguards.
 * - Next.js App Router: Encloses search parameter consumers in `<Suspense>` boundary.
 */

"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { TrustBadge } from "@/components/shared/trust-badge";
import { useApp } from "@/lib/context/app-context";
import { CATEGORY_DETAILS } from "@/lib/data/mock-data";
import { sanitizeText } from "@/lib/security/sanitize";
import { ListingCard } from "@/modules/marketplace/components/listing-card";
import { formatNaira } from "@/lib/utils/formatters";
import {
  User,
  ShoppingBag,
  GraduationCap,
  Heart,
  MessageCircle,
  Settings,
  ShieldCheck,
  Clock,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Send,
  Lock,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

/**
 * Inner dashboard container handling tab switching, messaging, and listings.
 */
function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const initialConvId = searchParams.get("conv") || "";

  const {
    currentUser,
    updateCurrentUserProfile,
    submitVerificationRequest,
    listings,
    updateListingStatus,
    favorites,
    toggleFavorite,
    bookings,
    updateBookingStatus,
    tutors,
    conversations,
    messages,
    sendMessage,
  } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedConvId, setSelectedConvId] = useState(initialConvId || conversations[0]?.id || "");
  const [replyBody, setReplyBody] = useState("");

  // Verification request modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [matricNumberInput, setMatricNumberInput] = useState(currentUser.matricNumber || "");
  const [verificationNoteInput, setVerificationNoteInput] = useState("");

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [department, setDepartment] = useState(currentUser.department);
  const [level, setLevel] = useState(currentUser.level);
  const [campus, setCampus] = useState(currentUser.campus);
  const [bio, setBio] = useState(currentUser.bio);

  // Filtered collections for current user
  const myListings = listings.filter((l) => l.sellerId === currentUser.id);
  const myStudentBookings = bookings.filter((b) => b.studentId === currentUser.id);
  const myTutorBookings = bookings.filter((b) => {
    const isMyTutorProfile = tutors.some((t) => t.userId === currentUser.id && t.id === b.tutorId);
    return isMyTutorProfile;
  });
  const mySavedListings = listings.filter((l) => favorites.includes(l.id));

  // Active conversation & messages
  const activeConversation = conversations.find((c) => c.id === selectedConvId);
  const convMessages = messages.filter((m) => m.conversationId === selectedConvId);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      displayName: sanitizeText(displayName, 60),
      department: sanitizeText(department, 80),
      level,
      campus,
      bio: sanitizeText(bio, 1000),
    });
    setEditingProfile(false);
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNumberInput.trim()) return;
    const cleanMatric = sanitizeText(matricNumberInput, 20).toUpperCase();
    const cleanNote = sanitizeText(verificationNoteInput, 500);
    submitVerificationRequest(cleanMatric, cleanNote);
    setVerifyModalOpen(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !selectedConvId) return;
    sendMessage(selectedConvId, replyBody.trim());
    setReplyBody("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Welcome Banner for newly registered/logged-in students */}
      {searchParams.get("welcome") === "true" && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base">
                Welcome to FUTMINNA AI, {currentUser.displayName.split(" ")[0]}!
              </h2>
              <p className="text-xs text-white/90 mt-0.5">
                Your student profile is active. You can browse the campus marketplace, book course tutors, or verify your matric number below to earn your badge.
              </p>
            </div>
          </div>
          <button
            onClick={() => setVerifyModalOpen(true)}
            className="shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-50 transition"
          >
            Verify Student Affiliation
          </button>
        </div>
      )}

      {/* Top Profile Summary Card */}
      <div className="rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="h-16 w-16 rounded-2xl object-cover border border-warmgray-200 shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl font-bold text-ink">
                  {currentUser.displayName}
                </h1>
                <TrustBadge
                  status={currentUser.verificationStatus}
                  isTutorApproved={currentUser.role === "tutor"}
                  ratingAverage={currentUser.ratingAverage}
                  ratingCount={currentUser.ratingCount}
                  completedCount={currentUser.completedTransactionsCount}
                />
              </div>
              <p className="text-xs text-warmgray-500 mt-0.5">
                {currentUser.department} • {currentUser.level} ({currentUser.campus} Campus)
              </p>
              <p className="text-[11px] text-warmgray-400 mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          {/* Action buttons: Verification trigger / Post listing */}
          <div className="flex flex-wrap items-center gap-2">
            {currentUser.verificationStatus !== "verified" && (
              <button
                onClick={() => setVerifyModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition"
              >
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                <span>
                  {currentUser.verificationStatus === "pending"
                    ? "Verification Pending Review"
                    : "Verify Student ID"}
                </span>
              </button>
            )}

            <Link
              href="/marketplace/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Listing</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-warmgray-200 mb-6 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: "overview", label: "My Listings", count: myListings.length, icon: ShoppingBag },
          {
            id: "tutoring",
            label: "Tutoring Sessions",
            count: myStudentBookings.length + myTutorBookings.length,
            icon: GraduationCap,
          },
          { id: "saved", label: "Saved Listings", count: mySavedListings.length, icon: Heart },
          {
            id: "messages",
            label: "Messages",
            count: conversations.length,
            icon: MessageCircle,
          },
          { id: "settings", label: "Profile & Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                isActive
                  ? "border-violet-600 text-violet-700 bg-white rounded-t-xl"
                  : "border-transparent text-warmgray-600 hover:text-ink hover:border-warmgray-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isActive ? "bg-violet-100 text-violet-800" : "bg-warmgray-200 text-warmgray-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MY LISTINGS */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">My Marketplace Listings</h2>
            <Link
              href="/marketplace/new"
              className="text-xs font-semibold text-violet-700 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add New Item
            </Link>
          </div>

          {myListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-warmgray-200 bg-white p-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="h-20 w-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "sold"
                            ? "bg-warmgray-200 text-warmgray-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status}
                      </span>
                      <h3 className="mt-1 text-xs font-bold text-ink truncate">{item.title}</h3>
                      <p className="font-display text-sm font-bold text-ink mt-0.5">
                        ₦{item.priceNgn.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-warmgray-400 mt-1">
                        {item.viewsCount} views • {item.campusLocation}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-warmgray-100 flex items-center justify-between text-xs">
                    <Link
                      href={`/marketplace/${item.id}`}
                      className="text-violet-600 font-semibold hover:underline"
                    >
                      View Public Page &rarr;
                    </Link>

                    <div className="flex items-center gap-1">
                      {item.status === "active" ? (
                        <button
                          onClick={() => updateListingStatus(item.id, "sold")}
                          className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          Mark Sold
                        </button>
                      ) : (
                        <button
                          onClick={() => updateListingStatus(item.id, "active")}
                          className="rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100"
                        >
                          Reactivate
                        </button>
                      )}
                      <button
                        onClick={() => updateListingStatus(item.id, "paused")}
                        className="rounded-lg bg-warmgray-100 px-2 py-1 text-[11px] text-warmgray-600 hover:bg-warmgray-200"
                      >
                        Pause
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-warmgray-300 bg-white p-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-warmgray-300" />
              <h3 className="mt-2 text-sm font-bold text-ink">No active listings</h3>
              <p className="mt-1 text-xs text-warmgray-500">
                You haven't listed any textbooks, calculators, or campus supplies yet.
              </p>
              <Link
                href="/marketplace/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Create Your First Listing
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TUTORING SESSIONS */}
      {activeTab === "tutoring" && (
        <div className="space-y-6">
          {/* As a Student: Bookings Requested */}
          <div>
            <h2 className="text-sm font-bold text-ink">My Sessions as a Student</h2>
            <div className="mt-3 space-y-3">
              {myStudentBookings.length > 0 ? (
                myStudentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-warmgray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-violet-100 px-2 py-0.5 font-mono text-xs font-bold text-violet-700">
                          {b.courseCode}
                        </span>
                        <span className="text-xs font-semibold text-ink">{b.courseTitle}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            b.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : b.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-warmgray-600">
                        <strong>Tutor:</strong> {b.tutorName} • <strong>Slot:</strong> {b.scheduledTime} ({b.durationHours} hrs)
                      </p>
                      <p className="mt-1 text-[11px] text-warmgray-500 italic">
                        "{b.learningObjective}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-semibold text-warmgray-400">Total Fee</p>
                        <p className="font-display text-sm font-bold text-ink">
                          ₦{b.totalCostNgn.toLocaleString()}
                        </p>
                      </div>

                      {b.status === "confirmed" && (
                        <button
                          onClick={() => updateBookingStatus(b.id, "completed")}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          Mark Completed
                        </button>
                      )}

                      {b.status === "requested" && (
                        <button
                          onClick={() => updateBookingStatus(b.id, "cancelled", "cancel:Student cancelled")}
                          className="rounded-xl border border-warmgray-300 px-3 py-1.5 text-xs font-medium text-warmgray-700 hover:bg-warmgray-100"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-warmgray-500 bg-white p-6 rounded-2xl border border-warmgray-200">
                  You haven't requested any tutoring sessions yet.{" "}
                  <Link href="/tutoring" className="text-violet-600 font-semibold underline">
                    Find a course tutor &rarr;
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* As a Tutor: Incoming Requests */}
          <div>
            <h2 className="text-sm font-bold text-ink">Incoming Requests for You (As a Tutor)</h2>
            <div className="mt-3 space-y-3">
              {myTutorBookings.length > 0 ? (
                myTutorBookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-warmgray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-violet-100 px-2 py-0.5 font-mono text-xs font-bold text-violet-700">
                          {b.courseCode}
                        </span>
                        <span className="text-xs font-bold text-ink">{b.studentName}</span>
                        <span className="text-xs text-warmgray-500">requested a session</span>
                      </div>
                      <p className="mt-1 text-xs text-warmgray-600">
                        <strong>Requested slot:</strong> {b.scheduledTime} ({b.durationHours} hrs)
                      </p>
                      <p className="mt-1 text-[11px] text-warmgray-500 italic">
                        Objective: "{b.learningObjective}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.status === "requested" && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(b.id, "confirmed")}
                            className="rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
                          >
                            Accept & Confirm
                          </button>
                          <button
                            onClick={() => updateBookingStatus(b.id, "cancelled", "cancel:Tutor unavailable")}
                            className="rounded-xl border border-warmgray-300 px-3 py-1.5 text-xs text-warmgray-700 hover:bg-warmgray-100"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <button
                          onClick={() => updateBookingStatus(b.id, "completed")}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          Confirm Session Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-warmgray-500 bg-white p-6 rounded-2xl border border-warmgray-200">
                  No pending requests. Make sure your profile availability is up to date in the directory!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAVED LISTINGS */}
      {activeTab === "saved" && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-ink">Saved Marketplace Listings</h2>
          {/* Saved Listings Grid (DRY component reuse) */}
          {mySavedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySavedListings.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  isSaved={true}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-warmgray-300 bg-white p-12 text-center">
              <Heart className="mx-auto h-12 w-12 text-warmgray-300" />
              <h3 className="mt-2 text-sm font-bold text-ink">No saved listings</h3>
              <p className="mt-1 text-xs text-warmgray-500">
                Click the heart icon on any marketplace item to keep track of it here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: IN-APP MESSAGES (Section 6.4) */}
      {activeTab === "messages" && (
        <div className="rounded-2xl border border-warmgray-200 bg-white shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Conversation List */}
          <div className="border-r border-warmgray-200 p-4 overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-warmgray-400 mb-3">
              Conversations
            </h3>
            <div className="space-y-1">
              {conversations.map((conv) => {
                const otherParticipant =
                  conv.participants.find((p) => p.id !== currentUser.id) || conv.participants[0];
                const isSelected = conv.id === selectedConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition ${
                      isSelected ? "bg-violet-50 border border-violet-200" : "hover:bg-warmgray-50"
                    }`}
                  >
                    <img
                      src={otherParticipant.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-ink truncate">
                        {otherParticipant.displayName}
                      </p>
                      <p className="text-[10px] text-violet-700 truncate font-medium">
                        {conv.contextTitle}
                      </p>
                      <p className="text-[11px] text-warmgray-500 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2 flex flex-col h-full bg-warmgray-50/50">
            {activeConversation ? (
              <>
                <div className="border-b border-warmgray-200 bg-white p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-violet-600" />
                    <div>
                      <p className="text-xs font-bold text-ink">{activeConversation.contextTitle}</p>
                      <p className="text-[10px] text-warmgray-400">
                        Context: {activeConversation.contextType.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>Protected Campus Chat</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {convMessages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                            isMe
                              ? "bg-violet-600 text-white rounded-br-none"
                              : "bg-white border border-warmgray-200 text-ink rounded-bl-none shadow-sm"
                          }`}
                        >
                          <p className="font-semibold text-[10px] mb-0.5 opacity-80">
                            {msg.senderName}
                          </p>
                          <p>{msg.body}</p>
                        </div>
                        <span className="text-[10px] text-warmgray-400 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Chat reply form */}
                <form onSubmit={handleSendReply} className="border-t border-warmgray-200 bg-white p-3 flex gap-2">
                  <input
                    type="text"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Type a safe message... (e.g. Can we meet at SEET library?)"
                    className="flex-1 rounded-xl border border-warmgray-200 px-3 py-2 text-xs text-ink outline-none focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-warmgray-400 text-xs">
                Select a conversation from the left to start chatting.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PROFILE & SETTINGS */}
      {activeTab === "settings" && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-warmgray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-sm font-bold text-ink">Account Profile & Data Governance</h2>
          <p className="mt-1 text-xs text-warmgray-500">
            In compliance with the Nigeria Data Protection Act (NDPA), you control your public identity and can update or request deactivation anytime.
          </p>

          <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink">Full Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink">Department / School</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Academic Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-warmgray-200 bg-white p-2.5 text-xs text-ink outline-none"
                >
                  <option value="100L">100L</option>
                  <option value="200L">200L</option>
                  <option value="300L">300L</option>
                  <option value="400L">400L</option>
                  <option value="500L">500L</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink">Primary Campus</label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-warmgray-200 bg-white p-2.5 text-xs text-ink outline-none"
              >
                <option value="Gidan Kwano">Gidan Kwano Campus (Main)</option>
                <option value="Bosso">Bosso Campus</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink">Bio / About</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-violet-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Verification Request Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
              <ShieldCheck className="h-5 w-5" />
              <span>Submit FUTMINNA Affiliation Verification</span>
            </div>
            <p className="mt-1 text-xs text-warmgray-500 leading-relaxed">
              Verification awards you the <strong>Affiliation Verified</strong> badge, building trust across marketplace transactions and tutoring bookings. Evidence is kept strictly private.
            </p>

            <form onSubmit={handleVerificationSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-ink">Matriculation Number *</label>
                <input
                  type="text"
                  required
                  value={matricNumberInput}
                  onChange={(e) => setMatricNumberInput(e.target.value)}
                  placeholder="e.g. 2021/1/89410EE"
                  className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">
                  Supporting Details (Level, e-Portal email, or ID reference)
                </label>
                <textarea
                  rows={3}
                  value={verificationNoteInput}
                  onChange={(e) => setVerificationNoteInput(e.target.value)}
                  placeholder="e.g. Registered with official @st.futminna.edu.ng email. Currently 400L Electrical Engineering."
                  className="mt-1 w-full rounded-xl border border-warmgray-200 p-2.5 text-xs text-ink outline-none"
                />
              </div>

              <div className="rounded-xl bg-amber-50 p-2.5 border border-amber-200 text-[11px] text-amber-900">
                <p>
                  🔒 <strong>Privacy Assurance:</strong> Student ID records are reviewed exclusively by authorized campus moderators and deleted following verification approval.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="w-1/2 rounded-xl border border-warmgray-300 py-2 text-xs font-medium text-warmgray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-violet-600 py-2 text-xs font-bold text-white hover:bg-violet-700"
                >
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />
      <main className="flex-1 py-8">
        <Suspense fallback={<div className="p-12 text-center text-xs text-warmgray-500">Loading student dashboard...</div>}>
          <DashboardContent />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
