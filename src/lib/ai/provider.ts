/**
 * Sara Uylar — AI Provider Layer (Phase 7)
 *
 * Single source of truth for talking to a real, server-side LLM/vision
 * model. Every AI feature in the platform (title/description generation,
 * chat assistant, moderation, fraud analysis, translation, image
 * verification) goes through this module instead of calling a provider SDK
 * directly. This keeps API keys out of client bundles, centralises
 * rate-limiting/logging hooks, and lets us swap providers without touching
 * call sites.
 *
 * Today it talks to the OpenAI Chat Completions API (text + vision) when
 * `OPENAI_API_KEY` is configured in the server environment. When no key is
 * present the platform automatically falls back to the deterministic
 * heuristic engines already implemented in `@/lib/ai` and `@/lib/ai-assist`
 * so every feature keeps working out of the box.
 */

export interface ChatMessagePart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ChatMessagePart[];
}

export interface AiCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  model?: string;
}

export interface AiCompletionResult {
  text: string;
  model: string;
  provider: "openai";
  latencyMs: number;
}

const DEFAULT_TEXT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const DEFAULT_VISION_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";
const BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");

export function isRealAiAvailable(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Low-level call to the Chat Completions endpoint. Never throws to callers
 * that use `safeComplete` — but this raw version does throw so callers can
 * decide how to handle failures (used internally).
 */
export async function complete(messages: ChatMessage[], opts: AiCompletionOptions = {}): Promise<AiCompletionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const started = Date.now();
  const model = opts.model || DEFAULT_TEXT_MODEL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.6,
        max_tokens: opts.maxTokens ?? 700,
        ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`OpenAI request failed (${res.status}): ${body.slice(0, 300)}`);
    }

    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    return { text, model, provider: "openai", latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timeout);
  }
}

/** Never throws — returns null on any failure so callers can fall back to heuristics. */
export async function safeComplete(messages: ChatMessage[], opts: AiCompletionOptions = {}): Promise<AiCompletionResult | null> {
  if (!isRealAiAvailable()) return null;
  try {
    return await complete(messages, opts);
  } catch (err) {
    console.error("[ai.provider] completion failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Attempts to parse a JSON object from a model response, tolerating markdown code fences. */
export function parseJsonSafely<T = Record<string, unknown>>(text: string): T | null {
  if (!text) return null;
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Vision-capable analysis: sends one image URL (or data URL) with an
 * instruction prompt and returns raw text (usually JSON, parsed by caller).
 * Returns null when no provider is configured or the request fails.
 */
export async function safeVisionComplete(imageUrl: string, instruction: string, opts: AiCompletionOptions = {}): Promise<AiCompletionResult | null> {
  if (!isRealAiAvailable()) return null;
  try {
    return await complete(
      [
        {
          role: "user",
          content: [
            { type: "text", text: instruction },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      { model: opts.model || DEFAULT_VISION_MODEL, ...opts }
    );
  } catch (err) {
    console.error("[ai.provider] vision completion failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
