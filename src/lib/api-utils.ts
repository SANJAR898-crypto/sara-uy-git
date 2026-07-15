import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth-helpers";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return jsonError(error.message, error.status);
  }
  if (error instanceof ZodError) {
    return jsonError(error.issues.map((i) => i.message).join(", "), 422);
  }
  if (error instanceof Error) {
    console.error(error);
    return jsonError(error.message || "Server xatoligi", 500);
  }
  console.error(error);
  return jsonError("Noma'lum server xatoligi", 500);
}
