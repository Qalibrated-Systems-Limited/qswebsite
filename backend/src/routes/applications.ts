import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import prisma from '../utils/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { detectCv, storeCv, readCv, deleteCv, MAX_CV_BYTES } from '../utils/cvStorage.js';
import { sendMail, escapeHtml } from '../utils/mailer.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_CV_BYTES, files: 1 } });

const RECRUITMENT_EMAIL = process.env.RECRUITMENT_EMAIL || 'recruitment@qalibrated.com';
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://qalibrated.co.ke/dashboard';
const STATUSES = ['New', 'Reviewed', 'Shortlisted', 'Rejected'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Very small per-IP limiter for the public submit endpoint (5 per 10 minutes).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();
function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    return res.status(429).json({ error: 'Too many applications from this connection. Please try again later.' });
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  next();
}

// Run multer (the CV is optional), turning its errors (file too large, etc.) into a clean 400.
function cvUpload(req: Request, res: Response, next: NextFunction) {
  upload.single('cv')(req, res, (err: unknown) => {
    if (!err) return next();
    const tooBig = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE';
    res.status(400).json({ error: tooBig ? 'Your CV must be 5 MB or smaller.' : 'Could not read the uploaded file.' });
  });
}

const fmtSize = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

// Ordered lowest → highest (used to pick the highest qualification).
export const EDUCATION_LEVELS = ['High School', 'Certificate', 'Diploma', "Bachelor's", "Master's", 'PhD'];
export const EXPERIENCE_BANDS = ['0-1', '1-3', '3-5', '5-10', '10+'];
export const AVAILABILITY = ['Immediately', '2 weeks', '1 month', '2+ months'];

type Body = Record<string, string | undefined>;

interface Education { level: string; institution: string; course: string | null; yearFrom: number | null; yearTo: number | null }
interface Work { title: string; employer: string; from: string; to: string | null; current: boolean; duties: string | null }

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
function year(v: unknown): number | null | undefined {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 1950 && n <= new Date().getFullYear() + 6 ? n : undefined;
}
function parseJsonArray(raw: string | undefined): unknown[] | null {
  try {
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

// Education list: 1–8 entries, at least one High School entry (mandatory).
function parseEducation(raw: string | undefined): Education[] | string {
  const list = parseJsonArray(raw);
  if (!list || list.length === 0) return 'Please add your education, starting with high school.';
  if (list.length > 8) return 'Please list at most 8 qualifications.';
  const out: Education[] = [];
  for (const [i, e] of list.entries()) {
    const o = (e || {}) as Record<string, unknown>;
    const level = str(o.level, 40);
    const institution = str(o.institution, 150);
    const course = str(o.course, 150) || null;
    const yearFrom = year(o.yearFrom);
    const yearTo = year(o.yearTo);
    const n = `Education #${i + 1}`;
    if (!EDUCATION_LEVELS.includes(level)) return `${n}: please choose a level.`;
    if (!institution) return `${n}: please enter the school / institution.`;
    if (level !== 'High School' && !course) return `${n}: please enter the course or qualification.`;
    if (yearFrom === undefined || yearTo === undefined) return `${n}: please enter valid years.`;
    if (!yearTo) return `${n}: please enter the year completed (or expected).`;
    if (yearFrom && yearFrom > yearTo) return `${n}: the start year is after the end year.`;
    out.push({ level, institution, course, yearFrom, yearTo });
  }
  if (!out.some((e) => e.level === 'High School')) return 'High school education is required.';
  return out;
}

// Work history: 0–10 entries, most recent first.
function parseWork(raw: string | undefined): Work[] | string {
  const list = parseJsonArray(raw);
  if (!list) return 'Invalid work experience.';
  if (list.length > 10) return 'Please list at most 10 jobs.';
  const out: Work[] = [];
  for (const [i, e] of list.entries()) {
    const o = (e || {}) as Record<string, unknown>;
    const title = str(o.title, 150);
    const employer = str(o.employer, 150);
    const from = str(o.from, 7);
    const current = o.current === true;
    const to = current ? null : str(o.to, 7) || null;
    const duties = str(o.duties, 2000) || null;
    const n = `Experience #${i + 1}`;
    if (!title || !employer) return `${n}: please enter the job title and employer.`;
    if (!MONTH_RE.test(from)) return `${n}: please enter the start month.`;
    if (!current && (!to || !MONTH_RE.test(to))) return `${n}: please enter the end month or tick "I currently work here".`;
    if (to && to < from) return `${n}: the end date is before the start date.`;
    out.push({ title, employer, from, to, current, duties });
  }
  // Most recent first: current roles, then by end/start date.
  return out.sort((a, b) => Number(b.current) - Number(a.current) || (b.to || b.from).localeCompare(a.to || a.from));
}

const fmtMonth = (m: string | null) => (m ? new Date(`${m}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : '');

// Trimmed text field with a length cap; returns an error string when invalid.
function text(body: Body, key: string, label: string, max: number, required: boolean): string | null | { error: string } {
  const v = (body[key] || '').trim();
  if (!v) return required ? { error: `Please fill in: ${label}.` } : null;
  if (v.length > max) return { error: `${label} is too long (${max} characters max).` };
  return v;
}

// Public: submit an application. The applicant's details are saved in the
// database (with an optional, compressed CV); recruitment gets an email alert.
router.post('/', rateLimit, cvUpload, async (req, res) => {
  try {
    const body = req.body as Body;

    // Honeypot: real visitors never see or fill this field.
    if (body.website) return res.status(201).json({ message: 'Application received' });

    const spec: [key: string, label: string, max: number, required: boolean][] = [
      ['fullName', 'Full name', 120, true],
      ['email', 'Email', 200, true],
      ['phone', 'Phone number', 40, true],
      ['location', 'Current location', 120, true],
      ['linkedinUrl', 'LinkedIn / portfolio link', 300, false],
      ['yearsExperience', 'Total years of experience', 10, true],
      ['skills', 'Key skills', 2000, true],
      ['certifications', 'Certifications / licences', 2000, false],
      ['availability', 'Availability', 20, true],
      ['expectedSalary', 'Expected salary', 60, false],
      ['message', 'Why you want this role', 3000, false],
    ];
    const f: Record<string, string | null> = {};
    for (const [key, label, max, required] of spec) {
      const v = text(body, key, label, max, required);
      if (v && typeof v === 'object') return res.status(400).json({ error: v.error });
      f[key] = v;
    }

    const email = f.email!.toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    const education = parseEducation(body.education);
    if (typeof education === 'string') return res.status(400).json({ error: education });
    const work = parseWork(body.experience);
    if (typeof work === 'string') return res.status(400).json({ error: work });
    const highest = [...education].sort(
      (a, b) => EDUCATION_LEVELS.indexOf(b.level) - EDUCATION_LEVELS.indexOf(a.level) || (b.yearTo || 0) - (a.yearTo || 0),
    )[0];
    const latest = work[0];
    if (!EXPERIENCE_BANDS.includes(f.yearsExperience!)) return res.status(400).json({ error: 'Please choose your years of experience.' });
    if (!AVAILABILITY.includes(f.availability!)) return res.status(400).json({ error: 'Please choose your availability.' });
    if (f.linkedinUrl && !/^https?:\/\//i.test(f.linkedinUrl)) f.linkedinUrl = `https://${f.linkedinUrl}`;

    if (body.consent !== 'true') {
      return res.status(400).json({ error: 'Please agree to us processing your details for recruitment.' });
    }

    let jobTitle = 'General application';
    let linkedCareerId: string | null = null;
    if (body.careerId) {
      const career = await prisma.career.findUnique({ where: { id: body.careerId } });
      if (!career || !career.isOpen) return res.status(400).json({ error: 'This role is no longer open.' });
      jobTitle = career.title;
      linkedCareerId = career.id;
    }

    // Optional CV — validated by content, then compressed before it's stored.
    let cv = {};
    let storedName: string | null = null;
    if (req.file) {
      const detected = detectCv(req.file.buffer, req.file.originalname);
      if (!detected) return res.status(400).json({ error: 'CV must be a PDF, Word (.docx) or image (JPG/PNG) file.' });
      const stored = await storeCv(req.file.buffer, detected);
      storedName = stored.storedName;
      cv = {
        cvFileName: req.file.originalname.slice(0, 200),
        cvStoredName: stored.storedName,
        cvMimeType: stored.mime,
        cvGzipped: stored.gzipped,
        originalSize: req.file.size,
        storedSize: stored.storedSize,
      };
    }

    let application;
    try {
      application = await prisma.jobApplication.create({
        data: {
          careerId: linkedCareerId,
          jobTitle,
          fullName: f.fullName!,
          email,
          phone: f.phone!,
          location: f.location!,
          linkedinUrl: f.linkedinUrl,
          educationHistory: JSON.stringify(education),
          educationLevel: highest.level,
          fieldOfStudy: highest.course,
          institution: highest.institution,
          graduationYear: highest.yearTo,
          workHistory: JSON.stringify(work),
          yearsExperience: f.yearsExperience!,
          currentTitle: latest?.title ?? null,
          currentEmployer: latest?.employer ?? null,
          skills: f.skills!,
          certifications: f.certifications,
          availability: f.availability!,
          expectedSalary: f.expectedSalary,
          willingToTravel: body.willingToTravel === 'true',
          message: f.message,
          consent: true,
          ...cv,
        },
      });
    } catch (err) {
      if (storedName) deleteCv(storedName);
      throw err;
    }

    // Alert recruitment without holding up the applicant's response.
    const rows: [string, string][] = [
      ['Role', jobTitle],
      ['Name', f.fullName!],
      ['Email', email],
      ['Phone', f.phone!],
      ['Location', f.location!],
      ...education.map((e, i): [string, string] => [
        i === 0 ? 'Education' : '',
        `${e.level}${e.course ? ` — ${e.course}` : ''}, ${e.institution} (${e.yearFrom ? `${e.yearFrom}–` : ''}${e.yearTo})`,
      ]),
      ['Total experience', `${f.yearsExperience} years`],
      ...work.map((w, i): [string, string] => [
        i === 0 ? 'Work history' : '',
        `${w.title} at ${w.employer} (${fmtMonth(w.from)} – ${w.current ? 'present' : fmtMonth(w.to)})`,
      ]),
      ['Availability', f.availability!],
      ['CV attached', req.file ? `${req.file.originalname} (${fmtSize(req.file.size)})` : 'No'],
    ];
    sendMail({
      to: RECRUITMENT_EMAIL,
      replyTo: email,
      subject: `New job application: ${jobTitle} — ${f.fullName}`,
      text:
        `A new application has been submitted on the website.\n\n` +
        rows.map(([k, v]) => `${k}: ${v}`).join('\n') +
        `\n\nView the full application in the dashboard (Applications): ${DASHBOARD_URL}`,
      html:
        `<p>A new application has been submitted on the website.</p><table cellpadding="4">` +
        rows.map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`).join('') +
        `</table>` +
        `<p><a href="${escapeHtml(DASHBOARD_URL)}">Open the dashboard → Applications</a> to view the full application.</p>`,
    }).catch((err) => console.error('Application alert email failed:', err));

    res.status(201).json({ id: application.id, message: 'Application received' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit your application. Please try again.' });
  }
});

// Admin: list applications (metadata only — no file contents).
router.get('/', authenticate, requireAdmin, async (_req, res) => {
  try {
    const items = await prisma.jobApplication.findMany({
      orderBy: { createdAt: 'desc' },
      omit: { cvStoredName: true },
    });
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Admin: the attached CV file itself (decompressed), for inline preview or download.
router.get('/:id/cv', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const item = await prisma.jobApplication.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (!item.cvStoredName || !item.cvMimeType || !item.cvFileName) return res.status(404).json({ error: 'No CV attached' });
    const buf = readCv(item.cvStoredName, item.cvGzipped);
    const ext = item.cvMimeType === 'image/webp' ? '.webp' : '';
    const filename = item.cvFileName.replace(/\.[^.]+$/, (m) => (ext ? ext : m)).replace(/["\r\n]/g, '');
    res.setHeader('Content-Type', item.cvMimeType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read the CV file' });
  }
});

// Admin: an HTML rendering of a Word (.docx) CV, since browsers can't preview
// .docx natively.
router.get('/:id/preview', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const item = await prisma.jobApplication.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (!item.cvStoredName || !item.cvMimeType?.includes('wordprocessingml')) {
      return res.status(400).json({ error: 'Preview conversion is only needed for Word documents' });
    }
    const { value } = await mammoth.convertToHtml({ buffer: readCv(item.cvStoredName, item.cvGzipped) });
    res.setHeader('Cache-Control', 'private, no-store');
    res.json({ html: value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to render a preview of this document' });
  }
});

router.patch('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) return res.status(400).json({ error: `status must be one of ${STATUSES.join(', ')}` });
    const item = await prisma.jobApplication.update({
      where: { id: req.params.id },
      data: { status },
      omit: { cvStoredName: true },
    });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const item = await prisma.jobApplication.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.cvStoredName) deleteCv(item.cvStoredName);
    await prisma.jobApplication.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
