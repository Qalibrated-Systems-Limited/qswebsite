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
    const now = new Date();
    const items = await prisma.ad.findMany({
      where: isAdmin(req)
        ? {}
        : {
            isActive: true,
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

router.post('/', authenticate, requireAdmin, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const { title, description, linkUrl, position = 'banner', isActive = true, endDate } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    let imageUrl: string | null = null;
    if (req.file) {
      const filename = `ad-${Date.now()}.webp`;
      await sharp(req.file.buffer).resize(1200).webp({ quality: 80 }).toFile(path.join(process.env.UPLOAD_DIR || './uploads', filename));
      imageUrl = `/uploads/${filename}`;
    }

    const item = await prisma.ad.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        linkUrl: linkUrl || null,
        position,
        isActive: isActive === 'true' || isActive === true,
        endDate: endDate ? new Date(endDate) : null,
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
    const existing = await prisma.ad.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    let imageUrl = existing.imageUrl;
    if (req.file) {
      if (existing.imageUrl) {
        const old = path.join(process.env.UPLOAD_DIR || './uploads', path.basename(existing.imageUrl));
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      const filename = `ad-${Date.now()}.webp`;
      await sharp(req.file.buffer).resize(1200).webp({ quality: 80 }).toFile(path.join(process.env.UPLOAD_DIR || './uploads', filename));
      imageUrl = `/uploads/${filename}`;
    }

    const { title, description, linkUrl, position, isActive, endDate } = req.body;
    const item = await prisma.ad.update({
      where: { id: req.params.id },
      data: {
        title: title ?? existing.title,
        description: description ?? existing.description,
        imageUrl,
        linkUrl: linkUrl ?? existing.linkUrl,
        position: position ?? existing.position,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : existing.isActive,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
      },
    });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const item = await prisma.ad.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.imageUrl) {
      const p = path.join(process.env.UPLOAD_DIR || './uploads', path.basename(item.imageUrl));
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    await prisma.ad.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
