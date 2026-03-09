// TODO: Wire up Resend for actual email delivery
// For now, this is a placeholder that returns success

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // TODO: Replace with Resend API call:
    // import { Resend } from 'resend';
    // const resend = new Resend(import.meta.env.RESEND_API_KEY);
    // await resend.contacts.create({ email, audienceId: '...' });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
