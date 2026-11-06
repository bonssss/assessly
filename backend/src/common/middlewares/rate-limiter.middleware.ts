import rateLimit from "express-rate-limit";

/**
 * Standard response payload on 429 Too Many Requests
 */
const rateLimitResponse = (message: string) => ({
  success: false,
  code: "RATE_LIMIT_EXCEEDED",
  message,
});

/**
 * Global rate limiter: applied to all general API endpoints
 * 300 requests per 15 minutes per IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many requests from this client. Please retry after 15 minutes."),
});

/**
 * Auth rate limiter: applied to login, register, password reset, and recovery
 * 25 requests per 15 minutes per IP to mitigate credential brute-force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many authentication attempts. Please retry after 15 minutes."),
});

/**
 * Exam operations rate limiter: applied to exam attempts and answer submissions
 * 120 requests per 15 minutes per IP
 */
export const examRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many exam requests. Please slow down and try again shortly."),
});

/**
 * Payment and receipt upload rate limiter
 * 30 requests per 15 minutes per IP
 */
export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many payment submission attempts. Please try again later."),
});

/**
 * Question bank and practice rate limiter
 * 150 requests per 15 minutes per IP
 */
export const questionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 150,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many practice question requests. Please try again shortly."),
});

/**
 * Learning resources rate limiter
 * 60 requests per 15 minutes per IP
 */
export const resourceRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many resource requests. Please try again later."),
});

/**
 * Admin operations rate limiter
 * 100 requests per 15 minutes per IP
 */
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many administrative requests. Please try again later."),
});

/**
 * Factory helper for custom rate limiters
 */
export const createRateLimiter = (
  windowMs: number = 60 * 1000,
  max: number = 20,
  message: string = "Too many requests. Please try again later."
) => {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: rateLimitResponse(message),
  });
};
