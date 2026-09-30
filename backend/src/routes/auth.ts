import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

export const MIN_PASSWORD_LENGTH = 8;
const normEmail = (e: unknown) => String(e || '').trim().toLowerCase();

// Brute-force protection: per IP, and per target account.
const loginPerIp = rateLimit({ windowMs: 15 * 60_000, max: 20, message: 'Too many login attempts. Try again in 15 minutes.' });
const loginPerEmail = rateLimit({
  windowMs: 15 * 60_000,
  max: 8,
  message: 'Too many login attempts for this account. Try again in 15 minutes.',
  key: (req) => `email:${normEmail(req.body?.email)}`,
});

// A real hash to compare against when the account doesn't exist, so response
// time doesn't reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

// No public sign-up: accounts are created by an admin (Dashboard → Users).

router.post('/login', loginPerIp, loginPerEmail, async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!email || !password || password.length > 200) return res.status(401).json({ error: 'Invalid credentials' });

    const user = await prisma.user.findUnique({ where: { email } });
    const valid = await bcrypt.compare(password, user?.password || DUMMY_HASH);
    if (!user || !valid) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status !== 'Active') return res.status(403).json({ error: 'This account is not active.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
