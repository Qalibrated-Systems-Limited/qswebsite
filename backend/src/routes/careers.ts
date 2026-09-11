import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticate, requireAdmin, optionalAuthenticate, isAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuthenticate, async (req: AuthRequest, res) => {
  try {
    const items = await prisma.career.findMany({
      where: isAdmin(req) ? {} : { isOpen: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch careers' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.career.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, department, location, type = 'Full-time', description, requirements, isOpen = true } = req.body;
    if (!title || !department || !location || !description) {
      return res.status(400).json({ error: 'title, department, location, description required' });
    }
    const item = await prisma.career.create({
      data: {
        title,
        department,
        location,
        type,
        description,
        requirements: requirements || null,
        isOpen: isOpen === true || isOpen === 'true',
      },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.career.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const { title, department, location, type, description, requirements, isOpen } = req.body;
    const item = await prisma.career.update({
      where: { id: req.params.id },
      data: {
        title: title ?? existing.title,
        department: department ?? existing.department,
        location: location ?? existing.location,
        type: type ?? existing.type,
        description: description ?? existing.description,
        requirements: requirements ?? existing.requirements,
        isOpen: isOpen !== undefined ? (isOpen === true || isOpen === 'true') : existing.isOpen,
      },
    });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    await prisma.career.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
