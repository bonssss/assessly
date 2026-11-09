import rateLimit from "express-rate-limit";

// Named constants for rate limiting intervals and thresholds
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

const GLOBAL_MAX_REQUESTS = 300;
const AUTH_MAX_REQUESTS = 25;
const EXAM_MAX_REQUESTS = 120;
const PAYMENT_MAX_REQUESTS = 30;
const QUESTION_MAX_REQUESTS = 150;
const RESOURCE_MAX_REQUESTS = 60;
const ADMIN_MAX_REQUESTS = 100;
const DEFAULT_CUSTOM_MAX_REQUESTS = 20;

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
  windowMs: FIFTEEN_MINUTES_MS,
  limit: GLOBAL_MAX_REQUESTS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many requests from this client. Please retry after 15 minutes."),
});

/**
 * Auth rate limiter: applied to login, register, password reset, and recovery
 * 25 requests per 15 minutes per IP to mitigate credential brute-force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: AUTH_MAX_REQUESTS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many authentication attempts. Please retry after 15 minutes."),
});

/**
 * Exam operations rate limiter: applied to exam attempts and answer submissions
 * 120 requests per 15 minutes per IP
 */
export const examRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: EXAM_MAX_REQUESTS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many exam requests. Please slow down and try again shortly."),
});

/**
 * Payment and receipt upload rate limiter
 * 30 requests per 15 minutes per IP
 */
export const paymentRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: PAYMENT_MAX_REQUESTS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many payment submission attempts. Please try again later."),
});

/**
 * Question bank and practice rate limiter
 * 150 requests per 15 minutes per IP
 */
export const questionRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: QUESTION_MAX_REQUESTS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many practice question requests. Please try again shortly."),
});

/**
 * Learning resources rate limiter
 * 60 requests per 15 minutes per IP
 */
export const resourceRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: RESOURCE_MAX_REQUESTS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many resource requests. Please try again later."),
});

/**
 * Admin operations rate limiter
 * 100 requests per 15 minutes per IP
 */
export const adminRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: ADMIN_MAX_REQUESTS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitResponse("Too many administrative requests. Please try again later."),
});

/**
 * Factory helper for custom rate limiters
 */
export const createRateLimiter = (
  windowMs: number = ONE_MINUTE_MS,
  max: number = DEFAULT_CUSTOM_MAX_REQUESTS,
  message: string = "Too many requests. Please try again later."
) => {
  const limiter = rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: rateLimitResponse(message),
  });
  return limiter;
};
