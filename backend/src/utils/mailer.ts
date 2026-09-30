import nodemailer from 'nodemailer';

// Outbound email for notifications. Uses Resend's HTTP API when RESEND_API_KEY is
// set, otherwise SMTP when SMTP_HOST is set; with neither configured the message
// is only logged, so the rest of the app keeps working in development.
export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

const FROM = process.env.MAIL_FROM || 'Qalibrated Careers <noreply@qalibrated.co.ke>';

export async function sendMail(mail: Mail): Promise<void> {
  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        reply_to: mail.replyTo,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    return;
  }

  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT || 587);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({ from: FROM, ...mail });
    return;
  }

  console.warn(`[mail] No RESEND_API_KEY or SMTP_HOST set — not sending "${mail.subject}" to ${mail.to}`);
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
