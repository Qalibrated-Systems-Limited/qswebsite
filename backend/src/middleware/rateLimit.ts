import { Request, Response, NextFunction } from 'express';

// Small in-memory fixed-window rate limiter (single backend instance). Keys
// default to the client IP; pass `key` to limit on something else (e.g. email).
export function rateLimit(opts: {
  windowMs: number;
  max: number;
  message?: string;
  key?: (req: Request) => string;
}) {
  const hits = new Map<string, { count: number; reset: number }>();
  const message = opts.message || 'Too many requests. Please try again later.';

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = opts.key ? opts.key(req) : req.ip || 'unknown';
    let entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + opts.windowMs };
      hits.set(key, entry);
    }
    entry.count++;
    if (entry.count > opts.max) {
      res.setHeader('Retry-After', Math.ceil((entry.reset - now) / 1000));
      return res.status(429).json({ error: message });
    }
    // Drop expired entries now and then so the map can't grow without bound.
    if (hits.size > 10_000) {
      for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
    }
    next();
  };
}
