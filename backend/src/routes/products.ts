import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import prisma from '../utils/prisma.js';
import { authenticate, requireAdmin, optionalAuthenticate, isAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    cb(null, ok);
  },
});

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Public list (admins also see inactive products)
router.get('/', optionalAuthenticate, async (req: AuthRequest, res) => {
  try {
    const products = await prisma.product.findMany({
      where: isAdmin(req) ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Public single
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isActive: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Admin create
router.post('/', authenticate, requireAdmin, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const { name, description, category, price, features, specs } = req.body;
    if (!name || !description || !category) {
      return res.status(400).json({ error: 'name, description, category required' });
    }

    let imageUrl: string | null = null;
    if (req.file) {
      const filename = `${Date.now()}-${slugify(name)}.webp`;
      const filepath = path.join(process.env.UPLOAD_DIR || './uploads', filename);
      await sharp(req.file.buffer).resize(800).webp({ quality: 80 }).toFile(filepath);
      imageUrl = `/uploads/${filename}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: slugify(name) + '-' + Date.now().toString(36),
        description,
        category,
        price: price ? parseFloat(price) : null,
        imageUrl,
        features: features || null,
        specs: specs || null,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin update
router.put('/:id', authenticate, requireAdmin, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, description, category, price, features, specs, isActive } = req.body;
    let imageUrl = existing.imageUrl;

    if (req.file) {
      // delete old image
      if (existing.imageUrl) {
        const oldPath = path.join(process.env.UPLOAD_DIR || './uploads', path.basename(existing.imageUrl));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const filename = `${Date.now()}-${slugify(name || existing.name)}.webp`;
      const filepath = path.join(process.env.UPLOAD_DIR || './uploads', filename);
      await sharp(req.file.buffer).resize(800).webp({ quality: 80 }).toFile(filepath);
      imageUrl = `/uploads/${filename}`;
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: name ?? existing.name,
        description: description ?? existing.description,
        category: category ?? existing.category,
        price: price !== undefined ? (price ? parseFloat(price) : null) : existing.price,
        imageUrl,
        features: features ?? existing.features,
        specs: specs ?? existing.specs,
        isActive: isActive !== undefined ? isActive === 'true' || isActive === true : existing.isActive,
      },
    });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin delete
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.imageUrl) {
      const imgPath = path.join(process.env.UPLOAD_DIR || './uploads', path.basename(product.imageUrl));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
