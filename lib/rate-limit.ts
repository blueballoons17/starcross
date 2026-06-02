/**
 * Edge-safe sliding-window rate limiter.
 *
 * ⚠️  This in-process Map resets on every serverless cold start, so it is
 *     best-effort protection rather than a hard guarantee.  For a production-
 *     grade limiter swap the Map for an Upstash Redis client:
 *       https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 *
 * Usage:
 *   const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 });
 *   if (limiter.isLimited(ip)) return 429;
 */

interface Bucket { count: number; resetAt: number }

export function createRateLimiter(opts: { limit: number; windowMs: number }) {
  const store = new Map<string, Bucket>();

  return {
    isLimited(key: string): boolean {
      const now = Date.now();
      const bucket = store.get(key);

      if (!bucket || now > bucket.resetAt) {
        store.set(key, { count: 1, resetAt: now + opts.windowMs });
        return false;
      }

      if (bucket.count >= opts.limit) return true;

      bucket.count++;
      return false;
    },

    /** Clean up expired entries (call periodically if you care about memory). */
    purge() {
      const now = Date.now();
      for (const [k, v] of store) {
        if (now > v.resetAt) store.delete(k);
      }
    },
  };
}

// ── Shared limiters ───────────────────────────────────────────────────────────

/** Registration: max 5 attempts / minute per IP */
export const registerLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

/** Login: max 10 attempts / minute per IP */
export const loginLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

/** Message send: max 30 messages / minute per user */
export const messageLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });

/** Generic API: max 120 requests / minute per IP */
export const apiLimiter = createRateLimiter({ limit: 120, windowMs: 60_000 });
