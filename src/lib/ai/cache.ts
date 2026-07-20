/**
 * AI Cache — tiny in-memory TTL cache used to avoid re-running expensive
 * AI/market computations (price advice, market analysis, investment score)
 * on every request. Fine for a single-instance deployment; swap for
 * Redis/Upstash later without changing call sites.
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;

  const value = await fn();
  store.set(key, { value, expiresAt: now + ttlMs });

  // Opportunistic cleanup so the map doesn't grow unbounded on long-lived processes.
  if (store.size > 500) {
    for (const [k, v] of store) {
      if (v.expiresAt <= now) store.delete(k);
    }
  }
  return value;
}

export function invalidateCache(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
