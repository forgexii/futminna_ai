import { db, users, trustScores } from "@/lib/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  return rows[0] ?? null;
}

export async function getUserById(id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id));
  return rows[0] ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  matricNumber?: string;
  department?: string;
  level?: string;
  role?: "student" | "tutor" | "admin";
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  const [user] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      matricNumber: input.matricNumber,
      department: input.department,
      level: input.level,
      role: input.role ?? "student",
      // FUTMINNA email domains are auto-marked pending verification
      verificationStatus: input.email.toLowerCase().endsWith("@futminna.edu.ng")
        ? "pending"
        : "unverified",
    })
    .returning();

  await db.insert(trustScores).values({ userId: user.id, score: 50 });

  return user;
}

export async function verifyPassword(plain: string, hash: string | null) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}
