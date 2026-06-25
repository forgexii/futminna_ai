import { NextResponse } from "next/server";
import { db, users, listings, orders, bookings, tutorProfiles, reports } from "@/lib/db";
import { eq, sql, gte } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  const { error } = await requireRole(["admin"]);
  if (error) return NextResponse.json(error.body, { status: error.status });

  const [[{ totalUsers }], [{ totalListings }], [{ activeListings }], [{ totalOrders }], [{ completedOrders }], [{ totalBookings }], [{ completedBookings }], [{ pendingTutors }], [{ openReports }], gmvRow] =
    await Promise.all([
      db.select({ totalUsers: sql<number>`count(*)` }).from(users),
      db.select({ totalListings: sql<number>`count(*)` }).from(listings),
      db.select({ activeListings: sql<number>`count(*)` }).from(listings).where(eq(listings.status, "active")),
      db.select({ totalOrders: sql<number>`count(*)` }).from(orders),
      db.select({ completedOrders: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "completed")),
      db.select({ totalBookings: sql<number>`count(*)` }).from(bookings),
      db.select({ completedBookings: sql<number>`count(*)` }).from(bookings).where(eq(bookings.status, "completed")),
      db.select({ pendingTutors: sql<number>`count(*)` }).from(tutorProfiles).where(eq(tutorProfiles.status, "pending")),
      db.select({ openReports: sql<number>`count(*)` }).from(reports).where(eq(reports.status, "open")),
      db.select({ gmv: sql<number>`coalesce(sum(${orders.amount}), 0)` }).from(orders).where(eq(orders.status, "completed")),
    ]);

  const newUsersLast7d = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, sql`datetime('now', '-7 days')`));

  const categoryBreakdown = await db
    .select({
      categoryId: listings.categoryId,
      count: sql<number>`count(*)`,
    })
    .from(listings)
    .where(eq(listings.status, "active"))
    .groupBy(listings.categoryId);

  return NextResponse.json({
    totalUsers,
    totalListings,
    activeListings,
    totalOrders,
    completedOrders,
    totalBookings,
    completedBookings,
    pendingTutors,
    openReports,
    gmv: gmvRow[0]?.gmv ?? 0,
    bookingCompletionRate: totalBookings > 0 ? completedBookings / totalBookings : 0,
    orderCompletionRate: totalOrders > 0 ? completedOrders / totalOrders : 0,
    newUsersLast7d: newUsersLast7d[0]?.count ?? 0,
    categoryBreakdown,
  });
}
