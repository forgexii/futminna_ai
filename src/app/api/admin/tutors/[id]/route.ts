import { NextRequest, NextResponse } from "next/server";
import { db, tutorProfiles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { notify } from "@/lib/notifications";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { error } = await requireRole(["admin"]);
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [existing] = await db.select().from(tutorProfiles).where(eq(tutorProfiles.id, id));
  if (!existing) return NextResponse.json({ error: "Tutor application not found" }, { status: 404 });

  const body = await req.json();
  const status = body.status as "pending" | "approved" | "rejected" | "suspended";
  if (!["pending", "approved", "rejected", "suspended"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [updated] = await db
    .update(tutorProfiles)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(tutorProfiles.id, id))
    .returning();

  const messages: Record<string, { title: string; body: string }> = {
    approved: { title: "Tutor application approved", body: "Your tutor profile is now live and bookable by students. Good luck!" },
    rejected: { title: "Tutor application update", body: "Your tutor application wasn't approved this time. You can edit your profile and reapply." },
    suspended: { title: "Tutor profile suspended", body: "Your tutor profile has been suspended by an administrator." },
    pending: { title: "Tutor application under review", body: "Your tutor application is back under review." },
  };

  const msg = messages[status];
  if (msg) {
    await notify({ userId: existing.userId, type: `tutor_${status}`, title: msg.title, body: msg.body });
  }

  return NextResponse.json({ tutor: updated });
}
