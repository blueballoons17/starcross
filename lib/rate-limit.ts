/**
 * Rate limiter — Upstash Redis in production, in-memory fallback for local dev.
 *
 * To enable persistent rate limiting on Vercel:
 *   1. Create a free Redis database at https://console.upstash.com
 *   2. Copy the REST URL and token into your env (Vercel dashboard + .env):
 *        UPSTASH_REDIS_REST_URL=https://...
 *        UPSTASH_REDIS_REST_TOKEN=...
 *
 * Without those vars the limiter falls back to an in-process Map (best-effort
 * — resets on every serverless cold start, fine for development).
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis }     from "@upstash/redis";

// ── Upstash setup (only when both env vars are present) ──────────────────────

function tryBuildRedis(): Redis | null {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = tryBuildRedis();

/** Build an Upstash sliding-window limiter, or null if Redis isn't configured. */
function buildUpstash(prefix: string, limit: number, windowSeconds: number): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    prefix:  `kindredstars:rl:${prefix}`,
    ephemeralCache: new Map(), // local cache reduces Redis round-trips
  });
}

// ── In-memory fallback ───────────────────────────────────────────────────────

interface Bucket { count: number; resetAt: number }

function createInMemoryLimiter(limit: number, windowMs: number) {
  const store = new Map<string, Bucket>();
  return {
    async isLimited(key: string): Promise<boolean> {
      const now = Date.now();
      const bucket = store.get(key);
      if (!bucket || now > bucket.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return false;
      }
      if (bucket.count >= limit) return true;
      bucket.count++;
      return false;
    },
  };
}

// ── Unified limiter interface ─────────────────────────────────────────────────

function createLimiter(prefix: string, limit: number, windowSeconds: number) {
  const upstash  = buildUpstash(prefix, limit, windowSeconds);
  const fallback = createInMemoryLimiter(limit, windowSeconds * 1000);

  return {
    async isLimited(key: string): Promise<boolean> {
      if (upstash) {
        const result = await upstash.limit(key).catch(() => null);
        if (result) return !result.success;
      }
      return fallback.isLimited(key);
    },
  };
}

// ── Shared limiters ───────────────────────────────────────────────────────────

/** Registration: max 5 attempts / minute per IP */
export const registerLimiter = createLimiter("register", 5,  60);

/** Login: max 10 attempts / minute per IP */
export const loginLimiter    = createLimiter("login",    10, 60);

/** Message send: max 30 messages / minute per user */
export const messageLimiter  = createLimiter("message",  30, 60);

/** Generic API: max 120 requests / minute per IP */
export const apiLimiter      = createLimiter("api",      120, 60);
