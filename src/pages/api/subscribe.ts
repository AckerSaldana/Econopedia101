import { Resend } from 'resend';
import { supabase } from '../../lib/supabase';

export const prerender = false;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const MAX_EMAIL_LENGTH = 254;

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
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const trimmed = email.trim().toLowerCase();

    if (trimmed.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(trimmed)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Save subscriber to Supabase (upsert to handle re-subscriptions)
    await supabase
      .from('subscribers')
      .upsert(
        { email: trimmed, unsubscribed: false },
        { onConflict: 'email' },
      );

    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Econopedia 101 <onboarding@resend.dev>',
      to: trimmed,
      subject: 'Welcome to Econopedia 101',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 600; color: #0A0A0A; margin-bottom: 16px;">
            Welcome to Econopedia 101
          </h1>
          <p style="font-size: 16px; line-height: 1.6; color: #525252; margin-bottom: 24px;">
            Thanks for subscribing! You'll receive our latest articles on economics, finance, trading, and more directly in your inbox.
          </p>
          <p style="font-size: 14px; color: #A3A3A3;">
            &mdash; The Econopedia 101 Team
          </p>
        </div>
      `,
    });

    // Notify yourself of new subscriber
    await resend.emails.send({
      from: 'Econopedia 101 <onboarding@resend.dev>',
      to: 'econopedia101@gmail.com',
      subject: `New subscriber: ${trimmed}`,
      html: `<p>New newsletter subscriber: <strong>${trimmed}</strong></p>`,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to subscribe' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
