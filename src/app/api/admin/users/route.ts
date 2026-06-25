import { NextRequest, NextResponse } from "next/server";
import { db, users, trustScores } from "@/lib/db";
import { desc, eq, like, or } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const { error } = await requireRole(["admin"]);
  if (error) return NextResponse.json(error.body, { status: error.status });

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();

  const rows = await db
    .select({
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        verificationStatus: users.verificationStatus,
        createdAt: users.createdAt,
      },
      trust: { score: trustScores.score },
    })
    .from(users)
    .leftJoin(trustScores, eq(users.id, trustScores.userId))
    .where(q ? or(like(users.name, `%${q}%`), like(users.email, `%${q}%`)) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(100);

  return NextResponse.json({ users: rows });
}
