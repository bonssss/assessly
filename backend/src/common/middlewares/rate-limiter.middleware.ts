import type { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * Creates an in-memory sliding-window / fixed-window rate limiter
 * @param windowMs Time window in milliseconds
 * @param max Max allowed requests per window
 * @param message Custom message on 429
 */
export const createRateLimiter = (
  windowMs: number = 60 * 1000,
  max: number = 20,
  message: string = "Too many requests. Please try again later."
) => {
  const ipStore = new Map<string, RateLimitRecord>();

  // Cleanup expired entries periodically every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      if (now > record.resetTime) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    // Determine client IP (considering standard reverse proxies)
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : undefined) ||
      req.socket.remoteAddress ||
      "unknown-ip";

    const now = Date.now();
    const existing = ipStore.get(ip);

    if (!existing || now > existing.resetTime) {
      ipStore.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - 1);
      return next();
    }

    if (existing.count >= max) {
      const retryAfterSeconds = Math.ceil((existing.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.status(429).json({
        success: false,
        message,
        retryAfterSeconds,
      });
      return;
    }

    existing.count += 1;
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", max - existing.count);
    return next();
  };
};

export const authRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute window
  15, // max 15 requests per minute (covers registration & login brute force)
  "Too many authentication attempts. Please wait 60 seconds before trying again."
);
