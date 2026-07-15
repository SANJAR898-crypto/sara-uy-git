import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { isCurrentUserAdmin } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ user: null, isAdmin: false });
    return NextResponse.json({ user, isAdmin: isCurrentUserAdmin(user) });
  } catch (error) {
    return handleApiError(error);
  }
}
