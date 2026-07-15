import { NextResponse } from "next/server";
import { db } from "@/db";
import { districts, regions } from "@/db/schema";
import { asc } from "drizzle-orm";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const [allRegions, allDistricts] = await Promise.all([
      db.select().from(regions).orderBy(asc(regions.sortOrder)),
      db.select().from(districts),
    ]);

    const withDistricts = allRegions.map((region) => ({
      ...region,
      districts: allDistricts.filter((d) => d.regionId === region.id),
    }));

    return NextResponse.json({ regions: withDistricts });
  } catch (error) {
    return handleApiError(error);
  }
}
