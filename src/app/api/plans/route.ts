import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptionPlans } from "@/db/schema";
import { asc } from "drizzle-orm";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const plans = await db.select().from(subscriptionPlans).orderBy(asc(subscriptionPlans.sortOrder));
    return NextResponse.json({ plans });
  } catch (error) {
    return handleApiError(error);
  }
}
