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

/**
 * Applied to webhook create/update/rotate-secret/delete - not a
 * brute-force target the way login is, but a generous-yet-present
 * backstop against a compromised or careless account hammering webhook
 * registration/secret rotation (each rotation invalidates the previous
 * secret, so unbounded rotation requests are a real self-inflicted
 * denial-of-service risk worth guarding against specifically).
 */
export const webhookManagementRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many webhook management requests. Please try again later.',
  },
});
