import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";
import { sellerApplySchema } from "@/lib/validation";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (!rateLimit(getClientKey(req, "seller-apply"), 5, 60_000)) {
      return jsonError("Juda ko'p urinish", 429);
    }

    const user = await requireUser();
    const body = await req.json();
    const data = sellerApplySchema.parse(body);

    const [updated] = await db
      .update(users)
      .set({
        phoneNumber: data.phoneNumber,
        phoneVerified: true,
        isSeller: true,
        agencyName: data.agencyName,
        sellerBio: data.bio,
        sellerSince: user.sellerSince ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
