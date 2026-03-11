import { Resend } from 'resend';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Invalid content type' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { title, slug, description, coverUrl } = await request.json();

    if (!title || !slug) {
      return new Response(JSON.stringify({ error: 'Title and slug are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch all active subscribers
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('email')
      .eq('unsubscribed', false);

    if (error || !subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ error: 'No subscribers found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const resend = new Resend(import.meta.env.RESEND_API_KEY);
    const postUrl = `https://econopedia101.com/blog/${slug}`;

    // Send in batches of 50 (Resend batch limit)
    const BATCH_SIZE = 50;
    let sent = 0;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      const emails = batch.map((sub) => ({
        from: 'Econopedia 101 <onboarding@resend.dev>',
        to: sub.email,
        subject: `New Article: ${title}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            ${coverUrl ? `<img src="${coverUrl}" alt="${title}" style="width: 100%; height: auto; margin-bottom: 24px;" />` : ''}
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #A3A3A3; margin-bottom: 8px;">
              New Article
            </p>
            <h1 style="font-size: 24px; font-weight: 600; color: #0A0A0A; margin: 0 0 12px; line-height: 1.3;">
              ${title}
            </h1>
            ${description ? `<p style="font-size: 16px; line-height: 1.6; color: #525252; margin-bottom: 24px;">${description}</p>` : ''}
            <a href="${postUrl}" style="display: inline-block; padding: 12px 24px; background-color: #19155C; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600;">
              Read Article
            </a>
            <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 32px 0 16px;" />
            <p style="font-size: 12px; color: #A3A3A3;">
              You're receiving this because you subscribed to Econopedia 101.
            </p>
          </div>
        `,
      }));

      await resend.batch.send(emails);
      sent += batch.length;
    }

    return new Response(JSON.stringify({ success: true, sent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to send newsletter' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
