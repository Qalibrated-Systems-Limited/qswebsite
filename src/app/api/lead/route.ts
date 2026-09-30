import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { allow, clientIp } from '@/utils/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function POST(req: Request) {
  if (!allow('lead', clientIp(req), 5, 10 * 60_000)) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  let name = '';
  let email = '';
  try {
    const body = await req.json();
    name = String(body?.name ?? '').trim();
    email = String(body?.email ?? '').trim();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  if (!name || name.length > 120 || !EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ success: false, error: 'Please enter a valid name and email' }, { status: 400 });
  }

  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'noreply@qalibrated.co.ke',
        to: 'info@qalibrated.co.ke',
        subject: 'New Catalogue Lead',
        html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
      });
    } else {
      console.warn("⚠️ RESEND_API_KEY not set — skipping email send.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send failed:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
