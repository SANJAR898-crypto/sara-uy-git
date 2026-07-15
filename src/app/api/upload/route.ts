import { NextResponse } from "next/server";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { requireSeller } from "@/lib/auth-helpers";
import { uploadImageFile } from "@/lib/upload";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (!rateLimit(getClientKey(req, "upload"), 40, 60_000)) {
      return jsonError("Juda ko'p urinish", 429);
    }

    await requireSeller();

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return jsonError("Fayl talab qilinadi", 400);

    const result = await uploadImageFile(file);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
