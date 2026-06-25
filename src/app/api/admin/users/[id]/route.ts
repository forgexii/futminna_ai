import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { recomputeTrustScore } from "@/lib/trust/score-engine";
import { notify } from "@/lib/notifications";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { error } = await requireRole(["admin"]);
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [existing] = await db.select().from(users).where(eq(users.id, id));
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  if ("verificationStatus" in body) allowed.verificationStatus = body.verificationStatus;
  if ("suspended" in body) allowed.suspended = Boolean(body.suspended);
  if ("role" in body) allowed.role = body.role;
  allowed.updatedAt = new Date().toISOString();

  const [updated] = await db.update(users).set(allowed).where(eq(users.id, id)).returning();

  if ("verificationStatus" in body) {
    await recomputeTrustScore(id).catch(() => {});
    await notify({
      userId: id,
      type: "verification_update",
      title: body.verificationStatus === "verified" ? "You're verified!" : "Verification update",
      body:
        body.verificationStatus === "verified"
          ? "Your account has been verified. Your trust score has increased."
          : `Your verification status is now: ${body.verificationStatus}.`,
    });
  }

  if ("suspended" in body && body.suspended) {
    await notify({
      userId: id,
      type: "account_suspended",
      title: "Account suspended",
      body: "Your account has been suspended by an administrator. Contact support if you believe this is a mistake.",
    });
  }

  return NextResponse.json({ user: updated });
}
