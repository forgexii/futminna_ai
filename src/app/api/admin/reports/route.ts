import { NextRequest, NextResponse } from "next/server";
import { db, reports, users, listings } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const { error } = await requireRole(["admin"]);
  if (error) return NextResponse.json(error.body, { status: error.status });

  const status = req.nextUrl.searchParams.get("status") ?? "open";

  const rows = await db
    .select({
      report: reports,
      reporter: { id: users.id, name: users.name, email: users.email },
    })
    .from(reports)
    .leftJoin(users, eq(reports.reporterId, users.id))
    .where(eq(reports.status, status as "open" | "reviewing" | "resolved" | "dismissed"))
    .orderBy(desc(reports.createdAt));

  const listingIds = rows.filter((r) => r.report.targetType === "listing").map((r) => r.report.targetId);
  const listingTitles = listingIds.length
    ? await db.select({ id: listings.id, title: listings.title }).from(listings)
    : [];
  const titleMap = new Map(listingTitles.map((l) => [l.id, l.title]));

  return NextResponse.json({
    reports: rows.map((r) => ({
      ...r,
      targetLabel: r.report.targetType === "listing" ? titleMap.get(r.report.targetId) ?? "Unknown listing" : null,
    })),
  });
}
