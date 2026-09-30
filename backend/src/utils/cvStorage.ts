import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { execFile } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);

// CVs are private: they live outside UPLOAD_DIR (which is served publicly at
// /uploads) and are only read back through the admin-only applications API.
export const CV_DIR = process.env.CV_DIR || './data/cvs';

export const MAX_CV_BYTES = 5 * 1024 * 1024;

export type CvKind = 'pdf' | 'docx' | 'image';

export interface DetectedCv {
  kind: CvKind;
  mime: string;
}

// Identify the document from its content (magic bytes), not the client-supplied
// mime type, so a renamed executable can't be stored as a "CV".
export function detectCv(buf: Buffer, originalName: string): DetectedCv | null {
  const ext = path.extname(originalName).toLowerCase();
  if (buf.subarray(0, 5).toString('latin1') === '%PDF-') return { kind: 'pdf', mime: 'application/pdf' };
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04 && ext === '.docx') {
    return { kind: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { kind: 'image', mime: 'image/jpeg' };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { kind: 'image', mime: 'image/png' };
  }
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') {
    return { kind: 'image', mime: 'image/webp' };
  }
  return null;
}

// Re-render a PDF with Ghostscript's "ebook" profile (150 dpi images), which
// typically shrinks scanned/photo-heavy CVs several-fold. Skipped silently when
// Ghostscript isn't installed; the result is only kept if it is smaller.
async function compressPdf(buf: Buffer): Promise<Buffer> {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-'));
  const input = path.join(tmp, 'in.pdf');
  const output = path.join(tmp, 'out.pdf');
  try {
    fs.writeFileSync(input, buf);
    await execFileAsync(
      process.env.GHOSTSCRIPT_BIN || 'gs',
      [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.5',
        '-dPDFSETTINGS=/ebook',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        '-dSAFER',
        `-sOutputFile=${output}`,
        input,
      ],
      { timeout: 30_000 },
    );
    const out = fs.readFileSync(output);
    return out.length > 0 && out.length < buf.length ? out : buf;
  } catch {
    return buf;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

export interface StoredCv {
  storedName: string;
  mime: string;
  gzipped: boolean;
  storedSize: number;
}

// Compress and write a CV to CV_DIR:
//  - images → resized to ≤1800px and re-encoded as WebP
//  - PDFs   → optimised with Ghostscript (when available)
//  - then gzip at rest whenever that saves at least 5%
export async function storeCv(buf: Buffer, detected: DetectedCv): Promise<StoredCv> {
  fs.mkdirSync(CV_DIR, { recursive: true });

  let data = buf;
  let mime = detected.mime;
  let ext = detected.kind === 'pdf' ? '.pdf' : detected.kind === 'docx' ? '.docx' : '';

  if (detected.kind === 'image') {
    data = await sharp(buf)
      .rotate()
      .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer();
    mime = 'image/webp';
    ext = '.webp';
  } else if (detected.kind === 'pdf') {
    data = await compressPdf(buf);
  }

  let gzipped = false;
  if (detected.kind !== 'image') {
    const gz = zlib.gzipSync(data, { level: 9 });
    if (gz.length < data.length * 0.95) {
      data = gz;
      gzipped = true;
    }
  }

  const storedName = `cv-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}${gzipped ? '.gz' : ''}`;
  fs.writeFileSync(path.join(CV_DIR, storedName), data);
  return { storedName, mime, gzipped, storedSize: data.length };
}

export function readCv(storedName: string, gzipped: boolean): Buffer {
  const buf = fs.readFileSync(path.join(CV_DIR, path.basename(storedName)));
  return gzipped ? zlib.gunzipSync(buf) : buf;
}

export function deleteCv(storedName: string) {
  const p = path.join(CV_DIR, path.basename(storedName));
  if (fs.existsSync(p)) fs.unlinkSync(p);
}
