import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All user management is admin-only.
router.use(authenticate, requireAdmin);

const shape = (u: {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
}) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status,
  createdAt: u.createdAt,
});

// List users (never returns password hashes)
router.get('/', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(users.map(shape));
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(shape(user));
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create a user (admin adds a team member)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role = 'Client', status = 'Active' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password required' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, status },
    });
    res.status(201).json(shape(user));
  } catch {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update a user's details / role / status (password optional)
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const { name, email, role, status, password } = req.body;
    const data: Record<string, unknown> = {
      name: name ?? existing.name,
      email: email ?? existing.email,
      role: role ?? existing.role,
      status: status ?? existing.status,
    };
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    res.json(shape(user));
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user (an admin cannot delete their own account)
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    if (req.user?.id === req.params.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
