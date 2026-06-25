import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  matricNumber: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const listingSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  categoryId: z.string().min(1),
  condition: z.enum(["new", "like_new", "used", "fair"]).default("used"),
  images: z.array(z.string()).default([]),
  location: z.string().optional(),
});

export const tutorProfileSchema = z.object({
  headline: z.string().min(5).max(120),
  expertiseAreas: z.array(z.string()).min(1, "Add at least one course code"),
  bio: z.string().min(20).max(1000),
  hourlyRate: z.number().positive(),
  availability: z.record(z.string(), z.array(z.string())).default({}),
});

export const bookingSchema = z.object({
  tutorProfileId: z.string(),
  courseCode: z.string().min(2),
  scheduledAt: z.string(),
  durationMinutes: z.number().int().positive().default(60),
});

export const orderSchema = z.object({
  listingId: z.string(),
});

export const ratingSchema = z.object({
  targetUserId: z.string(),
  targetType: z.enum(["listing", "tutor_session", "order"]),
  targetId: z.string(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationHistory: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .default([]),
});
