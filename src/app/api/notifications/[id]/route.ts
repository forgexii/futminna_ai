import { NextRequest, NextResponse } from "next/server";
import { db, notifications } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";

export async function PATCH(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [existing] = await db.select().from(notifications).where(eq(notifications.id, id));
  if (!existing || existing.userId !== session!.user.id) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(notifications)
    .set({ readAt: new Date().toISOString() })
    .where(eq(notifications.id, id))
    .returning();

  return NextResponse.json({ notification: updated });
}
