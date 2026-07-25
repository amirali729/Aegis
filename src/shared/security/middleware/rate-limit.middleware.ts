import rateLimit from 'express-rate-limit';

/**
 * Applied globally in app.ts. Generous enough to not bother normal
 * API usage, just a backstop against abuse.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Applied to login/signup/refresh - the classic brute-force and
 * credential-stuffing targets.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many attempts. Please try again later.',
  },
});

/**
 * Applied to forgot-password/resend-verification - endpoints that
 * accept just an email and could otherwise be used to spam a mailbox
 * or enumerate accounts via timing.
 */
export const sensitiveActionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Please try again later.',
  },
});
