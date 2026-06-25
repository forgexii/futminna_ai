import { NextResponse } from "next/server";
import { db, notifications } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session!.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return NextResponse.json({ notifications: rows });
}
