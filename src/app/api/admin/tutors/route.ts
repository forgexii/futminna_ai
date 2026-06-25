import { NextRequest, NextResponse } from "next/server";
import { db, tutorProfiles, users } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const { error } = await requireRole(["admin"]);
  if (error) return NextResponse.json(error.body, { status: error.status });

  const status = req.nextUrl.searchParams.get("status");

  const rows = await db
    .select({
      tutor: tutorProfiles,
      user: { id: users.id, name: users.name, email: users.email, department: users.department },
    })
    .from(tutorProfiles)
    .leftJoin(users, eq(tutorProfiles.userId, users.id))
    .where(status ? eq(tutorProfiles.status, status as "pending" | "approved" | "rejected" | "suspended") : undefined)
    .orderBy(desc(tutorProfiles.createdAt));

  return NextResponse.json({ tutors: rows });
}
