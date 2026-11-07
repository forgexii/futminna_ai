/**
 * Rate Limiting Service
 * Implements SEC-05 (Protection against flooding, brute force, and uncontrolled AI API costs).
 * Uses an in-memory sliding-window counter algorithm.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * In-memory storage for active rate-limiting windows.
 */
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Evaluates whether an action key (e.g. `assistant_usr_123` or `msg_usr_123`) is within its allowed threshold.
 *
 * @param key - Unique identifier composed of action namespace and actor ID
 * @param limit - Maximum requests allowed in the given timeframe (default: 10)
 * @param windowMs - Time window in milliseconds (default: 60,000ms = 1 minute)
 * @returns Object with `allowed` boolean, remaining requests, and reset countdown in seconds
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // If no record exists or window expired, initialize a fresh window
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  // If threshold exceeded, reject request
  if (record.count >= limit) {
    const resetInSeconds = Math.max(0, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  // Increment counter
  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}
