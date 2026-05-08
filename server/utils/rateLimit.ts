import type { H3Event } from 'h3';

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
	key: string;
	limit: number;
	windowMs: number;
	message?: string;
}

/**
 * In-memory IP-based rate limiter. Throws 429 when exceeded.
 *
 * NOTE: in-memory state is per-instance — useless on serverless. Migrate to
 * Redis/Edge before scaling beyond a single Node instance. See tech-debt #57.
 */
export function rateLimit(event: H3Event, opts: RateLimitOptions): void {
	const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
	const cacheKey = `${opts.key}:${ip}`;
	const now = Date.now();

	const existing = buckets.get(cacheKey);
	if (existing && now >= existing.resetAt) {
		buckets.delete(cacheKey);
	}

	const bucket = buckets.get(cacheKey);
	if (bucket && bucket.count >= opts.limit) {
		throw createError({
			status: 429,
			statusText: opts.message || 'Too many requests. Please try again later.',
		});
	}

	const next: Bucket = bucket || { count: 0, resetAt: now + opts.windowMs };
	next.count++;
	buckets.set(cacheKey, next);
}

/**
 * Decrement the bucket — call on success when you only want to count failures
 * (e.g. login attempts). Safe no-op if no bucket exists.
 */
export function rateLimitClear(event: H3Event, key: string): void {
	const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
	buckets.delete(`${key}:${ip}`);
}
