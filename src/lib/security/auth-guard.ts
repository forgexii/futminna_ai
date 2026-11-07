/**
 * Authorization Guard Utilities
 * Implements SEC-03 (State and server authorization enforcement for privileged actions)
 * and guards against Insecure Direct Object References (IDOR).
 */

import { UserProfile, Listing, Booking, Conversation } from "@/types";

/**
 * Checks whether a user holds administrative or moderation authority.
 *
 * @param user - User profile requesting the action
 * @returns true if user has admin or moderator privileges
 */
export function isAdminOrModerator(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return user.role === "admin" || user.role === "moderator";
}

/**
 * Verifies whether a user has authority to alter a marketplace listing (pause, mark as sold, delete).
 * Permission rule: Only the original listing seller or a platform moderator can manage a listing.
 *
 * @param user - User attempting the update
 * @param listing - Targeted marketplace listing
 * @returns true if user is permitted to manage the listing
 */
export function canManageListing(user: UserProfile, listing: Listing): boolean {
  if (isAdminOrModerator(user)) return true;
  return listing.sellerId === user.id;
}

/**
 * Verifies whether a user has authority to confirm, cancel, or complete a tutoring booking.
 * Permission rule: Only the student who booked, the assigned tutor, or a moderator can update status.
 *
 * @param user - User attempting the update
 * @param booking - Targeted session booking
 * @returns true if user is an authorized party to the session
 */
export function canManageBooking(user: UserProfile, booking: Booking): boolean {
  if (isAdminOrModerator(user)) return true;
  return booking.studentId === user.id || booking.tutorId === user.id;
}

/**
 * Verifies whether a user has authority to read or participate in a private conversation.
 * Permission rule: Only designated thread participants or a moderator investigating a report can access messages.
 *
 * @param user - User requesting message thread
 * @param conversation - Targeted conversation thread
 * @returns true if user is an authorized participant
 */
export function canAccessConversation(user: UserProfile, conversation: Conversation): boolean {
  if (isAdminOrModerator(user)) return true;
  return conversation.participants.some((p) => p.id === user.id);
}
