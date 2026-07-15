import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings, reports, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { handleApiError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();

    const rows = await db
      .select({
        report: reports,
        listingTitle: listings.title,
        reporterName: users.firstName,
      })
      .from(reports)
      .innerJoin(listings, eq(reports.listingId, listings.id))
      .leftJoin(users, eq(reports.reporterId, users.id))
      .orderBy(desc(reports.createdAt));

    const items = rows.map((r) => ({
      ...r.report,
      listingTitle: r.listingTitle,
      reporterName: r.reporterName,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
