import { NextRequest, NextResponse } from "next/server";
import { db, reports, listings } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { z } from "zod";

const reportSchema = z.object({
  targetType: z.enum(["listing", "user", "message"]),
  targetId: z.string(),
  reason: z.string().min(5).max(500),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [report] = await db
    .insert(reports)
    .values({
      reporterId: session!.user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reason: parsed.data.reason,
    })
    .returning();

  if (parsed.data.targetType === "listing") {
    await db
      .update(listings)
      .set({ reportCount: sql`${listings.reportCount} + 1` })
      .where(eq(listings.id, parsed.data.targetId));
  }

  return NextResponse.json({ report }, { status: 201 });
}
