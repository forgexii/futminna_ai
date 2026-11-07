/**
 * FUTMINNA AI - Core Domain Data Models & Types
 * In alignment with Version 1.0 MVP Specification (Section 10: Data Model Overview)
 */

/**
 * Roles defining user authorization tiers across the platform (Section 4).
 * Enforced on both server and client state boundaries.
 */
export type UserRole =
  | "visitor"          // Unauthenticated or public browser
  | "student"          // Registered student account
  | "verified_student" // Student with verified institutional affiliation
  | "tutor_applicant"  // Student undergoing peer tutor review
  | "tutor"            // Approved, searchable peer tutor
  | "moderator"        // Operational staff reviewing queues and reports
  | "admin";           // Platform administrator with elevated audit access

/**
 * Verification state of student university affiliation (Section 4.1).
 * Kept private to protect student identity documents under NDPA standards.
 */
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

/**
 * Public and operational user profile representation (Section 6.1).
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  department: string;
  programme: string;
  level: string; // e.g. "100L", "200L", "300L", "400L", "500L", "Postgraduate"
  campus: "Gidan Kwano" | "Bosso";
  bio: string;
  avatarUrl: string;
  role: UserRole;
  isEmailVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  matricNumber?: string; // Stored privately for verification review
  completedTransactionsCount: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
}

/**
 * Eight recognized product and service categories for campus commerce (Section 6.2.1).
 */
export type ListingCategory =
  | "textbooks"
  | "electronics"
  | "accommodation"
  | "services"
  | "food"
  | "fashion"
  | "project_materials"
  | "other";

/**
 * Physical condition of a physical marketplace item.
 */
export type ListingCondition = "Brand New" | "Like New" | "Good" | "Fair" | "Not Applicable";

/**
 * Lifecycle statuses for a marketplace listing (Section 6.2.3).
 */
export type ListingStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "sold"
  | "removed"
  | "rejected";

/**
 * Campus marketplace listing record (Section 6.2.2).
 */
export interface Listing {
  id: string;
  sellerId: string;
  seller: {
    id: string;
    displayName: string;
    avatarUrl: string;
    department: string;
    verificationStatus: VerificationStatus;
    ratingAverage: number;
    ratingCount: number;
    completedTransactionsCount: number;
    campus: string;
  };
  title: string;
  description: string;
  category: ListingCategory;
  priceNgn: number; // Stored as integer Naira (₦)
  condition: ListingCondition;
  images: string[];
  status: ListingStatus;
  campusLocation: "Gidan Kwano" | "Bosso" | "Both";
  isFeatured?: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tutor application approval workflow states (Section 6.3.1).
 */
export type TutorApplicationStatus = "none" | "pending" | "approved" | "rejected" | "needs_information";

/**
 * Peer tutor profile indexed by university course codes (Section 6.3).
 * Acceptance criterion 6.3.3: Only "approved" profiles appear in public search.
 */
export interface TutorProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string;
  department: string;
  level: string;
  campus: "Gidan Kwano" | "Bosso";
  bio: string;
  supportedCourseCodes: string[]; // e.g. ["MAT201", "CSC301", "PHY102"]
  hourlyRateNgn: number;          // Proposed student peer rate (₦/hr)
  availabilitySummary: string;
  availabilitySlots: string[];     // Formatted schedule slots
  applicationStatus: TutorApplicationStatus;
  ratingAverage: number;
  ratingCount: number;
  completedSessionsCount: number;
  isAffiliationVerified: boolean;
  createdAt: string;
}

/**
 * Tutoring session booking lifecycle states (Section 6.3.2).
 */
export type BookingStatus =
  | "requested"
  | "accepted"
  | "alternative_proposed"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "disputed";

/**
 * Tutoring booking record between student and approved peer tutor (Section 6.3.2).
 */
export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  courseCode: string;
  courseTitle: string;
  scheduledTime: string;
  durationHours: number;
  hourlyRateNgn: number;
  totalCostNgn: number;
  learningObjective: string;
  status: BookingStatus;
  alternativeTimeProposed?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * In-app text message between platform participants (Section 6.4).
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * In-app conversation thread associated with a listing, tutoring session, or support inquiry.
 */
export interface Conversation {
  id: string;
  contextType: "listing" | "tutoring" | "support";
  contextId: string;
  contextTitle: string;
  participants: {
    id: string;
    displayName: string;
    avatarUrl: string;
  }[];
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount: number;
}

/**
 * Approved university circular or policy document grounding the Campus Assistant (Section 6.6.1).
 */
export interface KnowledgeSource {
  id: string;
  title: string;
  documentRef: string;
  category: "Academic Calendar" | "Registration" | "Campus Facilities" | "Student Affairs" | "Fees & Bursary";
  officialUrl?: string;
  effectiveDate: string;
  lastReviewedDate: string;
  summary: string;
  isActive: boolean;
}

/**
 * Conversational message within the grounded Campus Assistant stream (Section 6.6.2 & 13).
 */
export interface AssistantMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  citations?: {
    title: string;
    documentRef: string;
    effectiveDate: string;
    url?: string;
  }[];
  isRefusal?: boolean; // True when query asks for off-syllabus/unverified dates/fees
  createdAt: string;
  helpfulFeedback?: boolean;
}

/**
 * Safety and moderation incident report submitted by a user (Section 6.8).
 */
export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: "listing" | "tutor" | "user" | "conversation";
  targetId: string;
  targetTitle: string;
  reason: "Fraud or Scam" | "Inappropriate Content" | "Counterfeit or Prohibited" | "Academic Misconduct" | "Harassment" | "Other";
  description: string;
  status: "pending" | "reviewed" | "actioned" | "dismissed";
  assignedModerator?: string;
  resolutionNote?: string;
  createdAt: string;
}

/**
 * Immutable administrative audit log entry for privileged operations (SEC-08).
 */
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  timestamp: string;
}
