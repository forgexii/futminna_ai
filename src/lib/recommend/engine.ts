import { db, userInteractions, listings, tutorProfiles, recommendations, categories } from "@/lib/db";
import { eq, desc, sql, gte } from "drizzle-orm";

/**
 * Hybrid Recommendation Engine
 * ----------------------------
 * hybrid_score = 0.6 * collaborative_score + 0.4 * content_score
 *
 * Collaborative: user-user similarity via cosine similarity over an
 * interaction-weight vector keyed by (targetType, targetId).
 *
 * Content-based: matches the categories / course-code prefixes the user has
 * shown interest in against listing categories and tutor expertise areas.
 *
 * Cold start (<5 interactions): trending listings + most-booked tutors.
 *
 * This runs on-demand (cheap enough for a campus-scale dataset) and caches
 * results into the `recommendations` table; a cron-style "retrain" just
 * re-runs this for every active user, satisfying the "every 24h" requirement
 * without needing an external scheduler for this build.
 */

const INTERACTION_WEIGHTS: Record<string, number> = {
  view: 1,
  click: 1.5,
  search: 1,
  favorite: 3,
  booking: 5,
  purchase: 6,
  rating: 4,
};

type Vector = Map<string, number>;

function cosineSimilarity(a: Vector, b: Vector) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const [key, val] of a) {
    magA += val * val;
    if (b.has(key)) dot += val * b.get(key)!;
  }
  for (const val of b.values()) magB += val * val;
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function buildUserVectors() {
  const rows = await db.select().from(userInteractions);
  const vectors = new Map<string, Vector>();

  for (const row of rows) {
    const weight = (INTERACTION_WEIGHTS[row.interactionType] ?? 1) * row.weight;
    const key = `${row.targetType}:${row.targetId}`;
    if (!vectors.has(row.userId)) vectors.set(row.userId, new Map());
    const vec = vectors.get(row.userId)!;
    vec.set(key, (vec.get(key) ?? 0) + weight);
  }

  return vectors;
}

async function getUserInterestProfile(userId: string) {
  const interactions = await db
    .select()
    .from(userInteractions)
    .where(eq(userInteractions.userId, userId))
    .orderBy(desc(userInteractions.createdAt))
    .limit(200);

  const categoryWeight = new Map<string, number>();
  const courseWeight = new Map<string, number>();

  for (const i of interactions) {
    const weight = (INTERACTION_WEIGHTS[i.interactionType] ?? 1) * i.weight;
    if (i.targetType === "category") {
      categoryWeight.set(i.targetId, (categoryWeight.get(i.targetId) ?? 0) + weight);
    }
    if (i.targetType === "search" || i.targetType === "tutor") {
      // course-code-like search terms (e.g. MAT201) feed the content profile
      const code = i.targetId.toUpperCase().match(/[A-Z]{2,4}\d{3}/)?.[0];
      if (code) courseWeight.set(code, (courseWeight.get(code) ?? 0) + weight);
    }
  }

  return { categoryWeight, courseWeight, totalInteractions: interactions.length };
}

export async function getRecommendationsForUser(userId: string, limit = 8) {
  const { categoryWeight, courseWeight, totalInteractions } = await getUserInterestProfile(userId);

  // ---- Cold start ----
  if (totalInteractions < 5) {
    return coldStartRecommendations(limit);
  }

  // ---- Collaborative scores ----
  const vectors = await buildUserVectors();
  const myVector = vectors.get(userId) ?? new Map();
  const similarities: { userId: string; sim: number }[] = [];
  for (const [otherId, vec] of vectors) {
    if (otherId === userId) continue;
    const sim = cosineSimilarity(myVector, vec);
    if (sim > 0) similarities.push({ userId: otherId, sim });
  }
  similarities.sort((a, b) => b.sim - a.sim);
  const topSimilar = similarities.slice(0, 15);

  const collaborativeScore = new Map<string, number>(); // key: "type:id"
  for (const { userId: otherId, sim } of topSimilar) {
    const otherVec = vectors.get(otherId)!;
    for (const [key, weight] of otherVec) {
      if (myVector.has(key)) continue; // already interacted with
      collaborativeScore.set(key, (collaborativeScore.get(key) ?? 0) + sim * weight);
    }
  }

  // ---- Content-based scores ----
  const activeListings = await db.select().from(listings).where(eq(listings.status, "active")).limit(200);
  const approvedTutors = await db
    .select()
    .from(tutorProfiles)
    .where(eq(tutorProfiles.status, "approved"))
    .limit(200);

  const contentScore = new Map<string, number>();
  for (const listing of activeListings) {
    const key = `listing:${listing.id}`;
    const catScore = listing.categoryId ? categoryWeight.get(listing.categoryId) ?? 0 : 0;
    if (catScore > 0) contentScore.set(key, catScore);
  }
  for (const tutor of approvedTutors) {
    const key = `tutor:${tutor.id}`;
    const expertise: string[] = JSON.parse(tutor.expertiseAreas || "[]");
    let score = 0;
    for (const course of expertise) {
      score += courseWeight.get(course.toUpperCase()) ?? 0;
    }
    if (score > 0) contentScore.set(key, score);
  }

  // ---- Normalize + combine ----
  const allKeys = new Set([...collaborativeScore.keys(), ...contentScore.keys()]);
  const maxCollab = Math.max(1, ...collaborativeScore.values());
  const maxContent = Math.max(1, ...contentScore.values());

  const results: { targetType: "listing" | "tutor"; targetId: string; score: number; reason: string }[] = [];

  for (const key of allKeys) {
    const [type, id] = key.split(":") as ["listing" | "tutor", string];
    const collab = (collaborativeScore.get(key) ?? 0) / maxCollab;
    const content = (contentScore.get(key) ?? 0) / maxContent;
    const hybrid = 0.6 * collab + 0.4 * content;
    if (hybrid <= 0) continue;

    let reason = "Trending on campus right now";
    if (collab > content && collab > 0) reason = "Students similar to you engaged with this";
    else if (content > 0) reason = "Matches courses or categories you've shown interest in";

    results.push({ targetType: type, targetId: id, score: hybrid, reason });
  }

  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, limit);

  // Cache into recommendations table
  if (top.length > 0) {
    await db.insert(recommendations).values(
      top.map((r) => ({
        userId,
        targetType: r.targetType,
        targetId: r.targetId,
        score: r.score,
        reason: r.reason,
      }))
    );
  }

  if (top.length < limit) {
    const filler = await coldStartRecommendations(limit - top.length);
    return [...top, ...filler];
  }

  return top;
}

async function coldStartRecommendations(limit: number) {
  const trending = await db
    .select()
    .from(listings)
    .where(eq(listings.status, "active"))
    .orderBy(desc(listings.viewCount), desc(listings.favoriteCount))
    .limit(Math.ceil(limit * 0.6));

  const popularTutors = await db
    .select()
    .from(tutorProfiles)
    .where(eq(tutorProfiles.status, "approved"))
    .orderBy(desc(tutorProfiles.totalSessions), desc(tutorProfiles.avgRating))
    .limit(Math.floor(limit * 0.4) || 2);

  return [
    ...trending.map((l) => ({
      targetType: "listing" as const,
      targetId: l.id,
      score: 0.5,
      reason: "Trending listing this week",
    })),
    ...popularTutors.map((t) => ({
      targetType: "tutor" as const,
      targetId: t.id,
      score: 0.5,
      reason: "Frequently booked tutor",
    })),
  ];
}

/** Records a single interaction event used to train the recommender. Fire-and-forget from API routes. */
export async function trackInteraction(input: {
  userId: string;
  targetType: "listing" | "tutor" | "category" | "search";
  targetId: string;
  interactionType: "click" | "search" | "booking" | "purchase" | "rating" | "favorite" | "view";
  weight?: number;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(userInteractions).values({
    userId: input.userId,
    targetType: input.targetType,
    targetId: input.targetId,
    interactionType: input.interactionType,
    weight: input.weight ?? 1,
    metadata: JSON.stringify(input.metadata ?? {}),
  });
}

/** "Retrain" job — recomputes cached recommendations for all users with recent activity. Call from a cron route every 24h. */
export async function retrainAllRecommendations() {
  const activeUserIds = await db
    .select({ userId: userInteractions.userId })
    .from(userInteractions)
    .where(gte(userInteractions.createdAt, sql`datetime('now', '-30 days')`));

  const uniqueIds = [...new Set(activeUserIds.map((r) => r.userId))];
  let processed = 0;
  for (const userId of uniqueIds) {
    await db.delete(recommendations).where(eq(recommendations.userId, userId));
    await getRecommendationsForUser(userId, 12);
    processed++;
  }
  return { processed, totalActiveUsers: uniqueIds.length };
}

export async function getActiveCategoriesForExplain() {
  return db.select().from(categories).orderBy(categories.sortOrder);
}
