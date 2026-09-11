import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import prisma from '../utils/prisma.js';
import { authenticate, requireAdmin, optionalAuthenticate, isAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', optionalAuthenticate, async (req: AuthRequest, res) => {
  try {
    const items = await prisma.announcement.findMany({
      where: isAdmin(req) ? {} : { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.announcement.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.post('/', authenticate, requireAdmin, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const { title, content, isPublished = true, expiresAt } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content required' });

    let imageUrl: string | null = null;
    if (req.file) {
      const filename = `ann-${Date.now()}.webp`;
      const filepath = path.join(process.env.UPLOAD_DIR || './uploads', filename);
      await sharp(req.file.buffer).resize(1200).webp({ quality: 80 }).toFile(filepath);
      imageUrl = `/uploads/${filename}`;
    }

    const item = await prisma.announcement.create({
      data: {
        title,
        content,
        imageUrl,
        isPublished: isPublished === 'true' || isPublished === true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create' });
  }
});

router.put('/:id', authenticate, requireAdmin, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.announcement.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    let imageUrl = existing.imageUrl;
    if (req.file) {
      if (existing.imageUrl) {
        const old = path.join(process.env.UPLOAD_DIR || './uploads', path.basename(existing.imageUrl));
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      const filename = `ann-${Date.now()}.webp`;
      await sharp(req.file.buffer).resize(1200).webp({ quality: 80 }).toFile(path.join(process.env.UPLOAD_DIR || './uploads', filename));
      imageUrl = `/uploads/${filename}`;
    }

    const { title, content, isPublished, expiresAt } = req.body;
    const item = await prisma.announcement.update({
      where: { id: req.params.id },
      data: {
        title: title ?? existing.title,
        content: content ?? existing.content,
        imageUrl,
        isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : existing.isPublished,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : existing.expiresAt,
      },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const item = await prisma.announcement.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.imageUrl) {
      const p = path.join(process.env.UPLOAD_DIR || './uploads', path.basename(item.imageUrl));
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
