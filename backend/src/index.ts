import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import announcementRoutes from './routes/announcements.js';
import adRoutes from './routes/ads.js';
import careerRoutes from './routes/careers.js';
import applicationRoutes from './routes/applications.js';
import { rateLimit } from './middleware/rateLimit.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Behind the gateway/reverse proxy, take the client IP from X-Forwarded-For
// (used by the applications rate limiter). Only private-network proxies are trusted.
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback, linklocal, uniquelocal');

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  console.error('FATAL: JWT_SECRET must be set to a random value of at least 32 characters.');
  process.exit(1);
}

app.disable('x-powered-by');
// Security headers. The API only returns JSON and images, so the strictest CSP
// applies; uploads must stay embeddable by the website.
app.use(
  helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// Only the website's own origins may call the API from a browser. Set
// CORS_ORIGINS (comma-separated) in production; unset = allow any (development).
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Blanket per-IP limit on the whole API (stricter limits apply on login/submit).
app.use('/api', rateLimit({ windowMs: 60_000, max: 300 }));

app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

// Serve uploaded images (never directory listings, never dotfiles).
app.use(
  '/uploads',
  express.static(path.resolve(UPLOAD_DIR), { index: false, dotfiles: 'deny', maxAge: '7d' }),
);

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/applications', applicationRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Errors: log the detail server-side, never send stack traces to the client.
app.use((err: Error & { status?: number; type?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.type === 'entity.too.large' ? 'Request too large' : 'Bad request' });
});

app.listen(PORT, () => {
  console.log(`Qalibrated API running on http://localhost:${PORT}`);
  console.log(`Uploads served from ${path.resolve(UPLOAD_DIR)}`);
});
