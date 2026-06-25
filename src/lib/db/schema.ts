import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ---------- helpers ----------
const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  deletedAt: text("deleted_at"), // soft deletion
};

// ---------- Users ----------
export const users = sqliteTable(
  "users",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    matricNumber: text("matric_number"),
    department: text("department"),
    level: text("level"),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    phone: text("phone"),
    role: text("role", { enum: ["student", "tutor", "admin"] })
      .notNull()
      .default("student"),
    emailVerified: integer("email_verified", { mode: "boolean" })
      .notNull()
      .default(false),
    verificationStatus: text("verification_status", {
      enum: ["unverified", "pending", "verified", "rejected"],
    })
      .notNull()
      .default("unverified"),
    mfaEnabled: integer("mfa_enabled", { mode: "boolean" })
      .notNull()
      .default(false),
    walletBalance: real("wallet_balance").notNull().default(0),
    suspended: integer("suspended", { mode: "boolean" }).notNull().default(false),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email), index("users_role_idx").on(t.role)]
);

export const usersRelations = relations(users, ({ one, many }) => ({
  tutorProfile: one(tutorProfiles, {
    fields: [users.id],
    references: [tutorProfiles.userId],
  }),
  listings: many(listings),
  trustScore: one(trustScores, {
    fields: [users.id],
    references: [trustScores.userId],
  }),
}));

// ---------- Tutor Profiles ----------
export const tutorProfiles = sqliteTable(
  "tutor_profiles",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    headline: text("headline").notNull(),
    expertiseAreas: text("expertise_areas").notNull(), // JSON array of course codes
    bio: text("bio"),
    hourlyRate: real("hourly_rate").notNull(),
    availability: text("availability").notNull().default("{}"), // JSON schedule
    status: text("status", { enum: ["pending", "approved", "rejected", "suspended"] })
      .notNull()
      .default("pending"),
    totalSessions: integer("total_sessions").notNull().default(0),
    totalEarnings: real("total_earnings").notNull().default(0),
    avgRating: real("avg_rating").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("tutor_user_idx").on(t.userId),
    index("tutor_status_idx").on(t.status),
  ]
);

export const tutorProfilesRelations = relations(tutorProfiles, ({ one, many }) => ({
  user: one(users, { fields: [tutorProfiles.userId], references: [users.id] }),
  bookings: many(bookings),
}));

// ---------- Categories ----------
export const categories = sqliteTable(
  "categories",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    icon: text("icon"),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("category_slug_idx").on(t.slug)]
);

// ---------- Listings ----------
export const listings = sqliteTable(
  "listings",
  {
    id: id(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => categories.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: real("price").notNull(),
    condition: text("condition", { enum: ["new", "like_new", "used", "fair"] }).default(
      "used"
    ),
    images: text("images").notNull().default("[]"), // JSON array of URLs
    status: text("status", { enum: ["active", "sold", "reserved", "removed"] })
      .notNull()
      .default("active"),
    location: text("location"),
    viewCount: integer("view_count").notNull().default(0),
    favoriteCount: integer("favorite_count").notNull().default(0),
    reportCount: integer("report_count").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    index("listing_seller_idx").on(t.sellerId),
    index("listing_category_idx").on(t.categoryId),
    index("listing_status_idx").on(t.status),
  ]
);

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, { fields: [listings.sellerId], references: [users.id] }),
  category: one(categories, { fields: [listings.categoryId], references: [categories.id] }),
  orders: many(orders),
}));

// ---------- Favorites ----------
export const favorites = sqliteTable(
  "favorites",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    listingId: text("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  },
  (t) => [uniqueIndex("favorite_unique_idx").on(t.userId, t.listingId)]
);

// ---------- Orders ----------
export const orders = sqliteTable(
  "orders",
  {
    id: id(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id),
    amount: real("amount").notNull(),
    status: text("status", {
      enum: ["pending", "paid", "escrowed", "completed", "cancelled", "refunded", "disputed"],
    })
      .notNull()
      .default("pending"),
    paymentId: text("payment_id"),
    ...timestamps,
  },
  (t) => [
    index("order_buyer_idx").on(t.buyerId),
    index("order_seller_idx").on(t.sellerId),
    index("order_status_idx").on(t.status),
  ]
);

export const ordersRelations = relations(orders, ({ one }) => ({
  listing: one(listings, { fields: [orders.listingId], references: [listings.id] }),
  buyer: one(users, { fields: [orders.buyerId], references: [users.id] }),
  seller: one(users, { fields: [orders.sellerId], references: [users.id] }),
}));

// ---------- Bookings ----------
export const bookings = sqliteTable(
  "bookings",
  {
    id: id(),
    tutorProfileId: text("tutor_profile_id")
      .notNull()
      .references(() => tutorProfiles.id),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id),
    courseCode: text("course_code").notNull(),
    scheduledAt: text("scheduled_at").notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(60),
    amount: real("amount").notNull(),
    sessionLink: text("session_link"),
    status: text("status", {
      enum: ["requested", "accepted", "rejected", "completed", "cancelled"],
    })
      .notNull()
      .default("requested"),
    paymentId: text("payment_id"),
    ...timestamps,
  },
  (t) => [
    index("booking_tutor_idx").on(t.tutorProfileId),
    index("booking_student_idx").on(t.studentId),
    index("booking_status_idx").on(t.status),
  ]
);

export const bookingsRelations = relations(bookings, ({ one }) => ({
  tutorProfile: one(tutorProfiles, {
    fields: [bookings.tutorProfileId],
    references: [tutorProfiles.id],
  }),
  student: one(users, { fields: [bookings.studentId], references: [users.id] }),
}));

// ---------- Payments ----------
export const payments = sqliteTable(
  "payments",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    reference: text("reference").notNull(),
    paystackRef: text("paystack_ref"),
    amount: real("amount").notNull(),
    type: text("type", { enum: ["order", "booking", "wallet_topup", "withdrawal"] }).notNull(),
    relatedId: text("related_id"), // orderId or bookingId
    status: text("status", { enum: ["pending", "success", "failed", "refunded"] })
      .notNull()
      .default("pending"),
    channel: text("channel").default("card"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("payment_reference_idx").on(t.reference),
    index("payment_user_idx").on(t.userId),
    index("payment_status_idx").on(t.status),
  ]
);

// ---------- Ratings ----------
export const ratings = sqliteTable(
  "ratings",
  {
    id: id(),
    raterId: text("rater_id")
      .notNull()
      .references(() => users.id),
    targetUserId: text("target_user_id")
      .notNull()
      .references(() => users.id),
    targetType: text("target_type", { enum: ["listing", "tutor_session", "order"] }).notNull(),
    targetId: text("target_id").notNull(),
    score: integer("score").notNull(), // 1-5
    comment: text("comment"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index("rating_target_idx").on(t.targetUserId)]
);

// ---------- Conversations & Messages ----------
export const conversations = sqliteTable(
  "conversations",
  {
    id: id(),
    participantOneId: text("participant_one_id")
      .notNull()
      .references(() => users.id),
    participantTwoId: text("participant_two_id")
      .notNull()
      .references(() => users.id),
    listingId: text("listing_id").references(() => listings.id),
    lastMessageAt: text("last_message_at").default(sql`(current_timestamp)`),
    ...timestamps,
  },
  (t) => [
    index("conv_p1_idx").on(t.participantOneId),
    index("conv_p2_idx").on(t.participantTwoId),
  ]
);

export const messages = sqliteTable(
  "messages",
  {
    id: id(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    readAt: text("read_at"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index("message_conv_idx").on(t.conversationId)]
);

// ---------- Notifications ----------
export const notifications = sqliteTable(
  "notifications",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    link: text("link"),
    readAt: text("read_at"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index("notif_user_idx").on(t.userId)]
);

// ---------- User Interactions (for recommender) ----------
export const userInteractions = sqliteTable(
  "user_interactions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: text("target_type", { enum: ["listing", "tutor", "category", "search"] }).notNull(),
    targetId: text("target_id").notNull(),
    interactionType: text("interaction_type", {
      enum: ["click", "search", "booking", "purchase", "rating", "favorite", "view"],
    }).notNull(),
    weight: real("weight").notNull().default(1),
    metadata: text("metadata").default("{}"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  },
  (t) => [
    index("interaction_user_idx").on(t.userId),
    index("interaction_target_idx").on(t.targetType, t.targetId),
  ]
);

// ---------- Recommendations (cached output) ----------
export const recommendations = sqliteTable(
  "recommendations",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: text("target_type", { enum: ["listing", "tutor"] }).notNull(),
    targetId: text("target_id").notNull(),
    score: real("score").notNull(),
    reason: text("reason").notNull(),
    generatedAt: text("generated_at").notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index("reco_user_idx").on(t.userId)]
);

// ---------- Trust Scores ----------
export const trustScores = sqliteTable(
  "trust_scores",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: integer("score").notNull().default(50), // 0-100
    verificationPoints: integer("verification_points").notNull().default(0),
    transactionPoints: integer("transaction_points").notNull().default(0),
    ratingPoints: integer("rating_points").notNull().default(0),
    responsePoints: integer("response_points").notNull().default(0),
    disputePenalty: integer("dispute_penalty").notNull().default(0),
    updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
  },
  (t) => [uniqueIndex("trust_user_idx").on(t.userId)]
);

// ---------- Knowledge Base (for chatbot RAG) ----------
export const knowledgeBaseDocuments = sqliteTable(
  "knowledge_base_documents",
  {
    id: id(),
    title: text("title").notNull(),
    category: text("category", {
      enum: ["academic_calendar", "course_catalog", "campus_services", "marketplace_policy", "it_support", "registration", "general"],
    }).notNull(),
    content: text("content").notNull(),
    keywords: text("keywords").default("[]"),
    ...timestamps,
  },
  (t) => [index("kb_category_idx").on(t.category)]
);

// ---------- Reports (content moderation) ----------
export const reports = sqliteTable(
  "reports",
  {
    id: id(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id),
    targetType: text("target_type", { enum: ["listing", "user", "message"] }).notNull(),
    targetId: text("target_id").notNull(),
    reason: text("reason").notNull(),
    status: text("status", { enum: ["open", "reviewing", "resolved", "dismissed"] })
      .notNull()
      .default("open"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  },
  (t) => [index("report_status_idx").on(t.status)]
);
