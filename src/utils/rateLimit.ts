// In-memory fixed-window limiter for Next.js route handlers (single instance).
const buckets = new Map<string, Map<string, { count: number; reset: number }>>();

// Client IP as seen by our gateway: it appends the real address as the LAST
// X-Forwarded-For entry (earlier entries are client-supplied and spoofable).
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',').pop()!.trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

// Returns true when the request is allowed.
export function allow(name: string, key: string, max: number, windowMs: number): boolean {
  let hits = buckets.get(name);
  if (!hits) buckets.set(name, (hits = new Map()));
  const now = Date.now();
  let entry = hits.get(key);
  if (!entry || entry.reset <= now) {
    entry = { count: 0, reset: now + windowMs };
    hits.set(key, entry);
  }
  entry.count++;
  if (hits.size > 10_000) for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
  return entry.count <= max;
}
