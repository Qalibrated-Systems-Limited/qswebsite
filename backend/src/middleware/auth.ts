import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

// Verify the token, then re-read the user so a deleted, deactivated or demoted
// account loses access immediately instead of when its 7-day token expires.
async function resolveUser(header: string | undefined) {
  if (!header?.startsWith('Bearer ')) return null;
  let payload: { id: string };
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!, { algorithms: ['HS256'] }) as { id: string };
  } catch {
    return null;
  }
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || user.status !== 'Active') return null;
  return { id: user.id, email: user.email, role: user.role };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.headers.authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const user = await resolveUser(req.headers.authorization);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Sets req.user when a valid token is present, but never rejects. Used on public
// list endpoints so an authenticated admin can also see unpublished / closed /
// inactive items, while anonymous visitors only get live content.
export async function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req.headers.authorization);
    if (user) req.user = user;
  } catch {
    // treat as anonymous
  }
  next();
}

export const isAdmin = (req: AuthRequest) => req.user?.role === 'Admin';
