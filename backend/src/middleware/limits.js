import rateLimit from 'express-rate-limit'
export const limiter = (max, windowMin = 15) =>
  rateLimit({ windowMs: windowMin * 60_000, max, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests, try again later.' } })
