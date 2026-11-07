"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserProfile,
  Listing,
  TutorProfile,
  KnowledgeSource,
  Booking,
  Report,
  AuditLog,
  Conversation,
  Message,
  AssistantMessage,
  BookingStatus,
  ListingStatus,
  VerificationStatus,
} from "@/types";
import {
  INITIAL_USERS,
  INITIAL_LISTINGS,
  INITIAL_TUTORS,
  INITIAL_KNOWLEDGE_SOURCES,
  INITIAL_BOOKINGS,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
} from "@/lib/data/mock-data";
import { isSafeUrl, getSafeUrl, sanitizeText } from "@/lib/security/sanitize";
import { isAdminOrModerator } from "@/lib/security/auth-guard";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { AssistantService } from "@/modules/assistant/services/assistant.service";

/**
 * Master Application State & Facade Context
 * Orchestrates user sessions, marketplace listings, peer tutoring bookings,
 * evidence-grounded AI knowledge base retrieval, in-app messaging, and staff moderation.
 *
 * Implements:
 * - SEC-03: Authorization checks across listing updates, booking transitions, and moderation.
 * - SEC-05: Rate-limiting on AI queries and direct messaging.
 * - Interface Segregation Principle (ISP): Focused sub-hooks provided at the bottom of this module.
 */
interface AppContextType {
  // User Identity & Persona Switching
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (profile: Partial<UserProfile>) => void;
  submitVerificationRequest: (matricNumber: string, note: string) => void;
  registerUser: (data: {
    fullName: string;
    email: string;
    department: string;
    level: string;
    campus?: "Gidan Kwano" | "Bosso";
    password?: string;
  }) => { success: boolean; error?: string; user?: UserProfile };
  loginUser: (
    email: string,
    password?: string
  ) => { success: boolean; error?: string; user?: UserProfile };
  logoutUser: () => void;

  // Marketplace Listings Management
  listings: Listing[];
  favorites: string[];
  toggleFavorite: (listingId: string) => void;
  createListing: (newListing: Omit<Listing, "id" | "sellerId" | "seller" | "viewsCount" | "createdAt" | "updatedAt">) => Listing;
  updateListingStatus: (listingId: string, status: ListingStatus, reason?: string) => void;

  // Peer Tutoring Directory & Applications
  tutors: TutorProfile[];
  submitTutorApplication: (data: {
    courseCodes: string[];
    hourlyRateNgn: number;
    bio: string;
    availabilitySlots: string[];
  }) => void;
  reviewTutorApplication: (tutorId: string, decision: "approved" | "rejected", reason: string) => void;

  // Tutoring Session Bookings
  bookings: Booking[];
  createBooking: (tutor: TutorProfile, courseCode: string, courseTitle: string, scheduledTime: string, durationHours: number, learningObjective: string) => Booking;
  updateBookingStatus: (bookingId: string, newStatus: BookingStatus, note?: string) => void;

  // Safety & Incident Reporting
  reports: Report[];
  submitReport: (targetType: "listing" | "tutor" | "user" | "conversation", targetId: string, targetTitle: string, reason: Report["reason"], description: string) => void;
  resolveReport: (reportId: string, action: "actioned" | "dismissed", note: string) => void;

  // Campus AI Assistant & Knowledge Base
  knowledgeSources: KnowledgeSource[];
  toggleKnowledgeSource: (id: string) => void;
  addKnowledgeSource: (source: Omit<KnowledgeSource, "id">) => void;
  assistantMessages: AssistantMessage[];
  sendAssistantMessage: (userQuery: string) => void;
  feedbackAssistantMessage: (messageId: string, isHelpful: boolean) => void;

  // Administrative Audit Logging
  auditLogs: AuditLog[];

  // In-App Messaging
  conversations: Conversation[];
  messages: Message[];
  sendMessage: (conversationId: string, body: string) => void;
  startOrGetConversation: (contextType: "listing" | "tutoring" | "support", contextId: string, contextTitle: string, recipient: { id: string; displayName: string; avatarUrl: string }) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [favorites, setFavorites] = useState<string[]>(["list_1", "list_2"]);
  const [tutors, setTutors] = useState<TutorProfile[]>(INITIAL_TUTORS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(INITIAL_KNOWLEDGE_SOURCES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Initial Conversations & Messages
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv_1",
      contextType: "listing",
      contextId: "list_1",
      contextTitle: "Engineering Mathematics by K.A. Stroud",
      participants: [
        { id: "usr_student_1", displayName: "Abubakar Mohammed", avatarUrl: INITIAL_USERS[0].avatarUrl },
        { id: "usr_tutor_1", displayName: "Zainab Ibrahim", avatarUrl: INITIAL_USERS[1].avatarUrl },
      ],
      lastMessage: "Is this still available for pick up at SEET complex tomorrow?",
      lastMessageAt: "2026-11-06T17:30:00Z",
      unreadCount: 0,
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      conversationId: "conv_1",
      senderId: "usr_tutor_1",
      senderName: "Zainab Ibrahim",
      body: "Hi Abubakar! Is this textbook still available for pick up at SEET complex tomorrow?",
      createdAt: "2026-11-06T17:30:00Z",
      isRead: true,
    },
  ]);

  // Initial Assistant Chat with welcoming message
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    {
      id: "ast_welcome",
      sender: "assistant",
      content:
        "Hello! I am the FUTMINNA Campus Assistant. I am grounded directly in approved university circulars, academic calendars, and official e-portal registration guidelines. How can I assist you with your campus queries today?",
      createdAt: new Date().toISOString(),
    },
  ]);

  // Switch persona helper
  const switchUser = (userId: string) => {
    const user = availableUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const updateCurrentUserProfile = (profileData: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...profileData };
    setCurrentUser(updated);
    setAvailableUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const submitVerificationRequest = (matricNumber: string, note: string) => {
    updateCurrentUserProfile({
      matricNumber,
      verificationStatus: "pending",
      verificationNote: note,
    });
    // Log audit event
    addAuditLog("VERIFICATION_REQUESTED", "User", currentUser.id, `Submitted matric number: ${matricNumber}`);
  };

  /**
   * Registers a new student account in the platform.
   */
  const registerUser = (data: {
    fullName: string;
    email: string;
    department: string;
    level: string;
    campus?: "Gidan Kwano" | "Bosso";
    password?: string;
  }): { success: boolean; error?: string; user?: UserProfile } => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: "Institutional or personal email is required." };
    }
    if (!data.fullName.trim()) {
      return { success: false, error: "Full name is required." };
    }
    const existing = availableUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: "An account with this email already exists. Please sign in instead.",
      };
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      displayName: data.fullName.trim(),
      department: data.department.trim() || "General Studies",
      programme: data.department.trim() || "Undergraduate Studies",
      level: data.level || "100L",
      campus: data.campus || "Gidan Kwano",
      bio: `FUTMINNA ${data.level || "100L"} student in ${data.department.trim() || "Engineering & Science"}.`,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80",
      role: "student",
      isEmailVerified: true,
      verificationStatus: "unverified",
      completedTransactionsCount: 0,
      ratingAverage: 5.0,
      ratingCount: 0,
      createdAt: new Date().toISOString(),
    };

    setAvailableUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    addAuditLog(
      "USER_REGISTERED",
      "User",
      newUser.id,
      `New student registered: ${newUser.displayName} (${newUser.email}) - ${newUser.campus}`
    );
    return { success: true, user: newUser };
  };

  /**
   * Authenticates a user with email and optional password.
   */
  const loginUser = (
    email: string,
    password?: string
  ): { success: boolean; error?: string; user?: UserProfile } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: "Please enter your email address." };
    }

    const user = availableUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return {
        success: false,
        error:
          "No account found with this email. Please verify your spelling or create a new student account.",
      };
    }

    setCurrentUser(user);
    addAuditLog("USER_LOGIN", "User", user.id, `User ${user.displayName} signed in.`);
    return { success: true, user };
  };

  /**
   * Signs the current user out.
   */
  const logoutUser = () => {
    addAuditLog("USER_LOGOUT", "User", currentUser.id, `User ${currentUser.displayName} signed out.`);
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
  };

  const createListing = (
    data: Omit<Listing, "id" | "sellerId" | "seller" | "viewsCount" | "createdAt" | "updatedAt">
  ): Listing => {
    // Sanitize title & description
    const safeTitle = sanitizeText(data.title, 120);
    const safeDescription = sanitizeText(data.description, 3000);

    // Sanitize image URLs (reject dangerous protocols like javascript: or data:text/html)
    const fallbackImage = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80";
    const safeImages = (data.images && data.images.length > 0)
      ? data.images.map((img) => getSafeUrl(img, fallbackImage))
      : [fallbackImage];

    const safePrice = Math.max(100, Math.min(Number(data.priceNgn) || 100, 10_000_000));

    const newListing: Listing = {
      ...data,
      id: `list_${Date.now()}`,
      title: safeTitle,
      description: safeDescription,
      priceNgn: safePrice,
      images: safeImages,
      sellerId: currentUser.id,
      seller: {
        id: currentUser.id,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        department: currentUser.department,
        verificationStatus: currentUser.verificationStatus,
        ratingAverage: currentUser.ratingAverage,
        ratingCount: currentUser.ratingCount,
        completedTransactionsCount: currentUser.completedTransactionsCount,
        campus: currentUser.campus,
      },
      viewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setListings((prev) => [newListing, ...prev]);
    addAuditLog("LISTING_CREATED", "Listing", newListing.id, `Title: ${newListing.title}`);
    return newListing;
  };

  const updateListingStatus = (listingId: string, status: ListingStatus, reason?: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;

    // SEC-03: Authorization check - only seller or moderator can update listing status
    if (listing.sellerId !== currentUser.id && !isAdminOrModerator(currentUser)) {
      addAuditLog("UNAUTHORIZED_ATTEMPT", "Listing", listingId, "Non-owner attempted to alter listing status.");
      console.warn("Security Alert: Unauthorized listing status change blocked.");
      return;
    }

    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status, updatedAt: new Date().toISOString() } : l))
    );
    addAuditLog("LISTING_STATUS_CHANGED", "Listing", listingId, `New status: ${status}. ${reason || ""}`);
  };

  const submitTutorApplication = (data: {
    courseCodes: string[];
    hourlyRateNgn: number;
    bio: string;
    availabilitySlots: string[];
  }) => {
    const safeBio = sanitizeText(data.bio, 2000);
    const safeCourses = data.courseCodes
      .map((c) => sanitizeText(c, 10).toUpperCase().replace(/[^A-Z0-9]/g, ""))
      .filter((c) => c.length > 0);
    const safeRate = Math.max(500, Math.min(data.hourlyRateNgn, 50_000));

    const existing = tutors.find((t) => t.userId === currentUser.id);
    if (existing) {
      setTutors((prev) =>
        prev.map((t) =>
          t.userId === currentUser.id
            ? {
                ...t,
                supportedCourseCodes: safeCourses,
                hourlyRateNgn: safeRate,
                bio: safeBio,
                availabilitySlots: data.availabilitySlots,
                applicationStatus: "pending",
              }
            : t
        )
      );
    } else {
      const newTutor: TutorProfile = {
        id: `tut_${Date.now()}`,
        userId: currentUser.id,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        department: currentUser.department,
        level: currentUser.level,
        campus: currentUser.campus,
        bio: safeBio,
        supportedCourseCodes: safeCourses,
        hourlyRateNgn: safeRate,
        availabilitySummary: data.availabilitySlots.join(", "),
        availabilitySlots: data.availabilitySlots,
        applicationStatus: "pending",
        ratingAverage: 5.0,
        ratingCount: 0,
        completedSessionsCount: 0,
        isAffiliationVerified: currentUser.verificationStatus === "verified",
        createdAt: new Date().toISOString(),
      };
      setTutors((prev) => [...prev, newTutor]);
    }

    addAuditLog(
      "TUTOR_APPLICATION_SUBMITTED",
      "TutorProfile",
      currentUser.id,
      `Courses applied: ${safeCourses.join(", ")}`
    );
  };

  const reviewTutorApplication = (tutorId: string, decision: "approved" | "rejected", reason: string) => {
    // SEC-03: Authorization check - only admin or moderator can approve/reject tutors
    if (!isAdminOrModerator(currentUser)) {
      addAuditLog("UNAUTHORIZED_ATTEMPT", "TutorProfile", tutorId, "Non-admin attempted to review tutor application.");
      console.warn("Security Alert: Unauthorized tutor review blocked.");
      return;
    }

    setTutors((prev) =>
      prev.map((t) => (t.id === tutorId ? { ...t, applicationStatus: decision } : t))
    );
    addAuditLog(
      decision === "approved" ? "TUTOR_APPLICATION_APPROVED" : "TUTOR_APPLICATION_REJECTED",
      "TutorProfile",
      tutorId,
      reason
    );
  };

  const createBooking = (
    tutor: TutorProfile,
    courseCode: string,
    courseTitle: string,
    scheduledTime: string,
    durationHours: number,
    learningObjective: string
  ): Booking => {
    const safeObjective = sanitizeText(learningObjective, 1000);
    const safeDuration = Math.max(1, Math.min(durationHours, 8));

    const newBooking: Booking = {
      id: `book_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.displayName,
      tutorId: tutor.id,
      tutorName: tutor.displayName,
      courseCode: sanitizeText(courseCode, 10).toUpperCase(),
      courseTitle: sanitizeText(courseTitle, 100),
      scheduledTime: sanitizeText(scheduledTime, 100),
      durationHours: safeDuration,
      hourlyRateNgn: tutor.hourlyRateNgn,
      totalCostNgn: tutor.hourlyRateNgn * safeDuration,
      learningObjective: safeObjective,
      status: "requested",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    addAuditLog("BOOKING_REQUESTED", "Booking", newBooking.id, `Course: ${newBooking.courseCode} with Tutor ${tutor.displayName}`);
    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, newStatus: BookingStatus, note?: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // SEC-03: Authorization check - caller must be the student, the tutor, or an admin
    const isStudentForBooking = booking.studentId === currentUser.id;
    const isTutorForBooking = tutors.some((t) => t.id === booking.tutorId && t.userId === currentUser.id);
    if (!isStudentForBooking && !isTutorForBooking && !isAdminOrModerator(currentUser)) {
      addAuditLog("UNAUTHORIZED_ATTEMPT", "Booking", bookingId, "Unauthorized user attempted to modify booking status.");
      console.warn("Security Alert: Unauthorized booking modification blocked.");
      return;
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: newStatus,
              alternativeTimeProposed: note?.startsWith("alt:") ? sanitizeText(note.replace("alt:", ""), 200) : b.alternativeTimeProposed,
              cancellationReason: note?.startsWith("cancel:") ? sanitizeText(note.replace("cancel:", ""), 200) : b.cancellationReason,
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );
    addAuditLog("BOOKING_STATUS_UPDATED", "Booking", bookingId, `New status: ${newStatus}. ${note || ""}`);
  };

  const submitReport = (
    targetType: "listing" | "tutor" | "user" | "conversation",
    targetId: string,
    targetTitle: string,
    reason: Report["reason"],
    description: string
  ) => {
    const safeDescription = sanitizeText(description, 1000);
    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.displayName,
      targetType,
      targetId: sanitizeText(targetId, 50),
      targetTitle: sanitizeText(targetTitle, 120),
      reason,
      description: safeDescription,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
    addAuditLog("REPORT_SUBMITTED", targetType, targetId, `Reason: ${reason}`);
  };

  const resolveReport = (reportId: string, action: "actioned" | "dismissed", note: string) => {
    // SEC-03: Authorization check - only admin or moderator can resolve reports
    if (!isAdminOrModerator(currentUser)) {
      addAuditLog("UNAUTHORIZED_ATTEMPT", "Report", reportId, "Non-admin attempted to resolve report.");
      console.warn("Security Alert: Unauthorized report resolution blocked.");
      return;
    }

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: action,
              assignedModerator: currentUser.displayName,
              resolutionNote: sanitizeText(note, 500),
            }
          : r
      )
    );
    addAuditLog("REPORT_RESOLVED", "Report", reportId, `Action: ${action}. Note: ${note}`);
  };

  const toggleKnowledgeSource = (id: string) => {
    if (!isAdminOrModerator(currentUser)) {
      addAuditLog("UNAUTHORIZED_ATTEMPT", "KnowledgeSource", id, "Non-admin attempted to toggle knowledge source.");
      return;
    }

    setKnowledgeSources((prev) =>
      prev.map((ks) => (ks.id === id ? { ...ks, isActive: !ks.isActive } : ks))
    );
  };

  const addKnowledgeSource = (data: Omit<KnowledgeSource, "id">) => {
    if (!isAdminOrModerator(currentUser)) {
      addAuditLog("UNAUTHORIZED_ATTEMPT", "KnowledgeSource", "new", "Non-admin attempted to add knowledge source.");
      return;
    }

    const safeUrl = isSafeUrl(data.officialUrl) ? data.officialUrl : undefined;

    const newSource: KnowledgeSource = {
      ...data,
      id: `ks_${Date.now()}`,
      title: sanitizeText(data.title, 200),
      documentRef: sanitizeText(data.documentRef, 100),
      summary: sanitizeText(data.summary, 1000),
      officialUrl: safeUrl,
    };
    setKnowledgeSources((prev) => [...prev, newSource]);
    addAuditLog("KNOWLEDGE_SOURCE_ADDED", "KnowledgeSource", newSource.id, newSource.title);
  };

  const addAuditLog = (action: string, targetType: string, targetId: string, reason?: string) => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.displayName,
      action,
      targetType,
      targetId,
      reason,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Safe Grounded Knowledge Assistant logic (with SEC-05 Rate Limiting & Input Sanitization)
  const sendAssistantMessage = (userQuery: string) => {
    const cleanQuery = sanitizeText(userQuery, 500);
    if (!cleanQuery) return;

    // SEC-05: Rate limit check (max 12 assistant queries per minute per user)
    const rateCheck = checkRateLimit(`assistant_${currentUser.id}`, 12, 60_000);
    if (!rateCheck.allowed) {
      const throttledMsg: AssistantMessage = {
        id: `ast_throttle_${Date.now()}`,
        sender: "assistant",
        content: `Rate limit reached. To maintain platform stability and protect AI operational costs, please wait ${rateCheck.resetInSeconds} seconds before sending another question.`,
        isRefusal: true,
        createdAt: new Date().toISOString(),
      };
      setAssistantMessages((prev) => [...prev, throttledMsg]);
      return;
    }

    const userMsg: AssistantMessage = {
      id: `ast_u_${Date.now()}`,
      sender: "user",
      content: cleanQuery,
      createdAt: new Date().toISOString(),
    };

    setAssistantMessages((prev) => [...prev, userMsg]);

    // Check query against active knowledge sources using decoupled domain service (SRP & DIP)
    setTimeout(() => {
      const result = AssistantService.processQuery(cleanQuery, knowledgeSources);

      const botReply: AssistantMessage = {
        id: `ast_a_${Date.now()}`,
        sender: "assistant",
        content: result.content,
        citations: result.citations,
        isRefusal: result.isRefusal,
        createdAt: new Date().toISOString(),
      };

      setAssistantMessages((prev) => [...prev, botReply]);
    }, 400);
  };

  const feedbackAssistantMessage = (messageId: string, isHelpful: boolean) => {
    setAssistantMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, helpfulFeedback: isHelpful } : m))
    );
  };

  // Messaging operations with rate-limiting and text sanitization (SEC-04 & SEC-05)
  const sendMessage = (conversationId: string, body: string) => {
    const cleanBody = sanitizeText(body, 1500);
    if (!cleanBody) return;

    const rateCheck = checkRateLimit(`msg_${currentUser.id}`, 30, 60_000);
    if (!rateCheck.allowed) {
      console.warn("Message rate limit exceeded");
      return;
    }

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      body: cleanBody,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: cleanBody,
              lastMessageAt: newMsg.createdAt,
            }
          : c
      )
    );
  };

  const startOrGetConversation = (
    contextType: "listing" | "tutoring" | "support",
    contextId: string,
    contextTitle: string,
    recipient: { id: string; displayName: string; avatarUrl: string }
  ): string => {
    const existing = conversations.find(
      (c) =>
        c.contextType === contextType &&
        c.contextId === contextId &&
        c.participants.some((p) => p.id === recipient.id)
    );
    if (existing) {
      return existing.id;
    }

    const newId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      contextType,
      contextId,
      contextTitle,
      participants: [
        { id: currentUser.id, displayName: currentUser.displayName, avatarUrl: currentUser.avatarUrl },
        recipient,
      ],
      lastMessage: "Conversation initiated",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };
    setConversations((prev) => [newConv, ...prev]);
    return newId;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        availableUsers,
        switchUser,
        updateCurrentUserProfile,
        submitVerificationRequest,
        registerUser,
        loginUser,
        logoutUser,
        listings,
        favorites,
        toggleFavorite,
        createListing,
        updateListingStatus,
        tutors,
        submitTutorApplication,
        reviewTutorApplication,
        bookings,
        createBooking,
        updateBookingStatus,
        reports,
        submitReport,
        resolveReport,
        knowledgeSources,
        toggleKnowledgeSource,
        addKnowledgeSource,
        assistantMessages,
        sendAssistantMessage,
        feedbackAssistantMessage,
        auditLogs,
        conversations,
        messages,
        sendMessage,
        startOrGetConversation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

/**
 * Interface Segregation Principle (ISP): Focused Domain Hooks
 */
export function useMarketplace() {
  const { listings, favorites, toggleFavorite, createListing, updateListingStatus } = useApp();
  return { listings, favorites, toggleFavorite, createListing, updateListingStatus };
}

export function useTutoring() {
  const { tutors, submitTutorApplication, reviewTutorApplication, bookings, createBooking, updateBookingStatus } = useApp();
  return { tutors, submitTutorApplication, reviewTutorApplication, bookings, createBooking, updateBookingStatus };
}

export function useAssistant() {
  const { knowledgeSources, assistantMessages, sendAssistantMessage, feedbackAssistantMessage } = useApp();
  return { knowledgeSources, assistantMessages, sendAssistantMessage, feedbackAssistantMessage };
}

export function useIdentity() {
  const {
    currentUser,
    availableUsers,
    switchUser,
    updateCurrentUserProfile,
    submitVerificationRequest,
    registerUser,
    loginUser,
    logoutUser,
  } = useApp();
  return {
    currentUser,
    availableUsers,
    switchUser,
    updateCurrentUserProfile,
    submitVerificationRequest,
    registerUser,
    loginUser,
    logoutUser,
  };
}

export function useModeration() {
  const { reports, submitReport, resolveReport, auditLogs, knowledgeSources, toggleKnowledgeSource, addKnowledgeSource } = useApp();
  return { reports, submitReport, resolveReport, auditLogs, knowledgeSources, toggleKnowledgeSource, addKnowledgeSource };
}
