import { NextRequest, NextResponse } from "next/server";
import { moderateListing, getPriorityReviewQueue } from "@/lib/ai/moderation";
import { queryProperties } from "@/lib/properties-query";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * AI Moderation — analyze listing for spam, fake content, policy violations
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listing, checkDuplicates = true } = body;

    if (!listing) {
      return NextResponse.json(
        { error: "listing majburiy" },
        { status: 400 }
      );
    }

    // Optionally get existing listings for duplicate check
    let existingListings: Awaited<ReturnType<typeof queryProperties>> = [];
    
    if (checkDuplicates && listing.category && listing.city) {
      existingListings = await queryProperties({
        status: ["active", "pending"],
        category: listing.category,
        city: listing.city,
        limit: 100,
      });
    }

    // Run moderation
    const result = moderateListing(listing, existingListings);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI Moderation error:", error);
    return NextResponse.json(
      { error: "Moderatsiya xatoligi" },
      { status: 500 }
    );
  }
}

/**
 * Get priority review queue for admins
 */
export async function GET(req: NextRequest) {
  try {
    // Check admin auth
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    // Get pending listings
    const pendingListings = await queryProperties({
      status: "pending",
      limit: 50,
    });

    // Generate priority queue
    const queue = getPriorityReviewQueue(pendingListings);

    return NextResponse.json({
      queue,
      total: queue.length,
    });
  } catch (error) {
    console.error("AI Moderation queue error:", error);
    return NextResponse.json(
      { error: "Navbat olishda xatolik" },
      { status: 500 }
    );
  }
}
