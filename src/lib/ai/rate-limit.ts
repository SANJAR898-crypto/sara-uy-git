/**
 * AI Rate Limiting — reusable in-memory sliding-window limiter so every AI
 * endpoint (chat, search, moderation, image verification...) is protected
 * from abuse without needing an external dependency. One limiter instance
 * per named bucket (e.g. "ai.chat", "ai.search").
 */
const buckets = new Map<string, Map<number, number[]>>();

export function isRateLimited(bucket: string, identifier: number | string, max: number, windowMs: number): boolean {
  const key = typeof identifier === "string" ? identifier : String(identifier);
  const bucketMap = buckets.get(bucket) ?? new Map<number, number[]>();
  if (!buckets.has(bucket)) buckets.set(bucket, bucketMap);

  const now = Date.now();
  const numericKey = hashKey(key);
  const attempts = (bucketMap.get(numericKey) ?? []).filter((t) => now - t < windowMs);
  attempts.push(now);
  bucketMap.set(numericKey, attempts);
  return attempts.length > max;
}

function hashKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  }
  return h;
}
