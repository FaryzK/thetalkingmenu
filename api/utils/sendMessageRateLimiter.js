import rateLimit from "express-rate-limit";

// Custom rate limiter that identifies users via session tokens
export const sendMessageRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1-minute window
  max: 20, // Limit each session token to 20 requests per `windowMs`
  keyGenerator: (req) => req.headers["x-session-token"] || req.ip, // Use session token, fallback to IP
  message:
    "Too many requests from this session, please try again after a minute.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
