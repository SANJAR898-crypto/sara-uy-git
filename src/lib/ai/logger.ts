/**
 * AI Logging — best-effort structured telemetry persisted to `ai_logs`.
 * Every AI route calls this so admins can monitor usage, latency, provider
 * mix (heuristic vs real model) and failure rates from the Admin panel.
 * Never throws — logging must not break the feature it instruments.
 */
import { db } from "@/db";
import { aiLogs } from "@/db/schema";

export interface AiLogEntry {
  endpoint: string;
  userId?: number | null;
  provider?: "heuristic" | "openai";
  model?: string | null;
  success: boolean;
  latencyMs: number;
  errorMessage?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logAiEvent(entry: AiLogEntry) {
  try {
    await db.insert(aiLogs).values({
      endpoint: entry.endpoint,
      userId: entry.userId ?? null,
      provider: entry.provider ?? "heuristic",
      model: entry.model ?? null,
      success: entry.success,
      latencyMs: Math.max(0, Math.round(entry.latencyMs)),
      errorMessage: entry.errorMessage ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch (err) {
    console.error("[ai.logger] failed to persist AI log:", err instanceof Error ? err.message : err);
  }
}

/** Convenience wrapper: times `fn`, logs the outcome, and rethrows nothing — returns the result or null. */
export async function withAiLogging<T>(
  endpoint: string,
  meta: { userId?: number | null; metadata?: Record<string, unknown> },
  fn: () => Promise<{ result: T; provider?: "heuristic" | "openai"; model?: string | null }>
): Promise<T> {
  const started = Date.now();
  try {
    const { result, provider, model } = await fn();
    await logAiEvent({
      endpoint,
      userId: meta.userId,
      provider,
      model,
      success: true,
      latencyMs: Date.now() - started,
      metadata: meta.metadata,
    });
    return result;
  } catch (err) {
    await logAiEvent({
      endpoint,
      userId: meta.userId,
      success: false,
      latencyMs: Date.now() - started,
      errorMessage: err instanceof Error ? err.message : String(err),
      metadata: meta.metadata,
    });
    throw err;
  }
}
