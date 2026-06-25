import { db, trustScores, ratings, orders, bookings, users } from "@/lib/db";
import { eq, and } from "drizzle-orm";

/**
 * Trust Score Engine
 * ------------------
 * Composite 0-100 score built from five weighted signals, recomputed
 * whenever a relevant event occurs (verification, completed transaction,
 * new rating, dispute). Stored denormalized on `trust_scores` for fast reads,
 * and the breakdown is kept so the UI can explain *why* a score is what it is.
 */

const WEIGHTS = {
  verification: 20, // max points
  transactions: 30, // max points, scales with successful completions
  rating: 35, // max points, scales with average star rating
  response: 10, // max points, placeholder until messaging read-receipts feed this
  disputePenaltyCap: 25, // max points that can be deducted
};

export async function recomputeTrustScore(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return null;

  // Verification points
  const verificationPoints =
    user.verificationStatus === "verified" ? WEIGHTS.verification : user.verificationStatus === "pending" ? 8 : 0;

  // Successful transaction points (completed orders + completed bookings, capped)
  const completedOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.sellerId, userId), eq(orders.status, "completed")));
  const completedBookings = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.studentId, userId), eq(bookings.status, "completed")));
  const totalCompleted = completedOrders.length + completedBookings.length;
  const transactionPoints = Math.min(WEIGHTS.transactions, Math.round(Math.log2(totalCompleted + 1) * 9));

  // Rating points, scaled from average star rating (1-5) across all rating rows for this user
  const userRatings = await db.select().from(ratings).where(eq(ratings.targetUserId, userId));
  const avgRating =
    userRatings.length > 0 ? userRatings.reduce((sum, r) => sum + r.score, 0) / userRatings.length : 0;
  const ratingPoints = userRatings.length > 0 ? Math.round((avgRating / 5) * WEIGHTS.rating) : Math.round(WEIGHTS.rating * 0.6);

  // Response points — flat baseline for now (would be derived from message read/reply latency)
  const responsePoints = WEIGHTS.response;

  // Dispute penalty
  const disputedOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.sellerId, userId), eq(orders.status, "disputed")));
  const disputePenalty = Math.min(WEIGHTS.disputePenaltyCap, disputedOrders.length * 8);

  const score = Math.max(
    0,
    Math.min(100, verificationPoints + transactionPoints + ratingPoints + responsePoints - disputePenalty)
  );

  const existing = await db.select().from(trustScores).where(eq(trustScores.userId, userId));

  if (existing.length === 0) {
    await db.insert(trustScores).values({
      userId,
      score,
      verificationPoints,
      transactionPoints,
      ratingPoints,
      responsePoints,
      disputePenalty,
    });
  } else {
    await db
      .update(trustScores)
      .set({
        score,
        verificationPoints,
        transactionPoints,
        ratingPoints,
        responsePoints,
        disputePenalty,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(trustScores.userId, userId));
  }

  return { score, verificationPoints, transactionPoints, ratingPoints, responsePoints, disputePenalty };
}

export function trustTier(score: number) {
  if (score >= 85) return { label: "Highly trusted", variant: "emerald" as const };
  if (score >= 65) return { label: "Trusted", variant: "violet" as const };
  if (score >= 40) return { label: "Building trust", variant: "gold" as const };
  return { label: "New member", variant: "neutral" as const };
}
