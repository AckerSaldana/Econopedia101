import { Resend } from 'resend';

export const prerender = false;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST({ request }: { request: Request }) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Invalid content type' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { name, email, subject, message, website } = body;

    // Honeypot check — bots fill this hidden field
    if (website) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    if (!name || typeof name !== 'string' ||
        !email || typeof email !== 'string' ||
        !subject || typeof subject !== 'string' ||
        !message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    // Validate lengths
    if (trimmedName.length === 0 || trimmedName.length > MAX_NAME_LENGTH) {
      return new Response(JSON.stringify({ error: 'Name must be between 1 and 100 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (trimmedEmail.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(trimmedEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (trimmedSubject.length === 0 || trimmedSubject.length > MAX_SUBJECT_LENGTH) {
      return new Response(JSON.stringify({ error: 'Subject must be between 1 and 200 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (trimmedMessage.length === 0 || trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({ error: 'Message must be between 1 and 5000 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sanitize for HTML embedding
    const safeName = escapeHtml(trimmedName);
    const safeEmail = escapeHtml(trimmedEmail);
    const safeSubject = escapeHtml(trimmedSubject);
    const safeMessage = escapeHtml(trimmedMessage);

    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    // Notification email to site owner
    await resend.emails.send({
      from: 'Econopedia 101 <noreply@econopedia101.com>',
      to: 'econopedia101@gmail.com',
      replyTo: trimmedEmail,
      subject: `Contact: ${trimmedName} — ${trimmedSubject}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #A3A3A3; margin-bottom: 8px;">
            Contact Form Submission
          </p>
          <h1 style="font-size: 24px; font-weight: 600; color: #0A0A0A; margin: 0 0 24px;">
            ${safeSubject}
          </h1>
          <table style="width: 100%; font-size: 14px; color: #525252; margin-bottom: 24px;">
            <tr><td style="padding: 4px 0; font-weight: 600;">Name</td><td>${safeName}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: 600;">Email</td><td>${safeEmail}</td></tr>
          </table>
          <div style="border-top: 1px solid #E5E5E5; padding-top: 16px; font-size: 16px; line-height: 1.6; color: #0A0A0A; white-space: pre-wrap;">${safeMessage}</div>
        </div>
      `,
    });

    // Confirmation email to sender
    await resend.emails.send({
      from: 'Econopedia 101 <noreply@econopedia101.com>',
      to: trimmedEmail,
      subject: 'We received your message — Econopedia 101',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 600; color: #0A0A0A; margin-bottom: 16px;">
            Thanks for reaching out
          </h1>
          <p style="font-size: 16px; line-height: 1.6; color: #525252; margin-bottom: 24px;">
            We've received your message and will get back to you as soon as possible. We aim to respond within 48 hours.
          </p>
          <p style="font-size: 14px; color: #A3A3A3;">
            &mdash; The Econopedia 101 Team
          </p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to send message. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
