import { NextRequest, NextResponse } from "next/server";
import { db, reports, listings } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { error } = await requireRole(["admin"]);
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [existing] = await db.select().from(reports).where(eq(reports.id, id));
  if (!existing) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const body = await req.json();
  const status = body.status as "open" | "reviewing" | "resolved" | "dismissed";
  const removeListing = Boolean(body.removeListing);

  const [updated] = await db.update(reports).set({ status }).where(eq(reports.id, id)).returning();

  if (removeListing && existing.targetType === "listing") {
    await db
      .update(listings)
      .set({ status: "removed", deletedAt: new Date().toISOString() })
      .where(eq(listings.id, existing.targetId));
  }

  return NextResponse.json({ report: updated });
}
