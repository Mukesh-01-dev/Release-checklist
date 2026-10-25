
const cache = new Map();

const DEFAULT_TTL_MS = 5_000;
const MAX_ENTRIES = 500;

export const cacheStats = {
  hits: 0,
  misses: 0,
};

export function getCached(key) {
  const entry = cache.get(key);

  if (!entry) {
    cacheStats.misses++;
    return undefined;
  }

  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    cacheStats.misses++;
    return undefined;
  }

  // Refresh insertion order for LRU eviction.
  cache.delete(key);
  cache.set(key, entry);

  cacheStats.hits++;
  return entry.value;
}

export function setCached(key, value, ttlMs = DEFAULT_TTL_MS) {
  cache.delete(key);

  while (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }

  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateCache() {
  cache.clear();
}
