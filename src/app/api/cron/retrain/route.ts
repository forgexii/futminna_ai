import { NextRequest, NextResponse } from "next/server";
import { retrainAllRecommendations } from "@/lib/recommend/engine";

/**
 * Intended to be hit by an external scheduler (cron job, GitHub Actions
 * schedule, DigitalOcean App Platform job, etc.) once every 24 hours, per
 * the "retrain models automatically every 24 hours" requirement.
 *
 * Protected by a shared secret rather than a user session since the caller
 * is a machine, not a logged-in person.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret");

  if (!secret || secret.includes("replace_me")) {
    return NextResponse.json({ error: "CRON_SECRET not configured on this server" }, { status: 503 });
  }
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await retrainAllRecommendations();
  return NextResponse.json({ success: true, ...result, ranAt: new Date().toISOString() });
}
