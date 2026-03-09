import { useState } from 'react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setErrorMsg(result.error.errors[0].message);
      setState('error');
      return;
    }

    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error('Subscription failed');

      setState('success');
      setEmail('');
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div
        className="flex items-center justify-center gap-2 py-3 text-sm font-medium"
        style={{ color: 'var(--color-accent)' }}
        role="status"
        aria-live="polite"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        You're subscribed! Check your inbox.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md mx-auto" noValidate>
      <label htmlFor="newsletter-email-input" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email-input"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === 'error') {
            setState('idle');
            setErrorMsg('');
          }
        }}
        placeholder="your@email.com"
        required
        autoComplete="email"
        aria-invalid={state === 'error' ? true : undefined}
        aria-describedby={errorMsg ? 'newsletter-error' : undefined}
        className="flex-1 px-4 py-3 border border-r-0 text-sm transition-colors focus:outline-none focus:ring-1"
        style={{
          borderColor: state === 'error' ? 'var(--color-error)' : 'var(--color-border)',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-primary)',
        }}
        onFocus={(e) => {
          if (state !== 'error') {
            e.target.style.borderColor = 'var(--color-accent)';
          }
        }}
        onBlur={(e) => {
          if (state !== 'error') {
            e.target.style.borderColor = 'var(--color-border)';
          }
        }}
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors whitespace-nowrap disabled:opacity-70"
        style={{ backgroundColor: 'var(--color-accent)' }}
        onMouseEnter={(e) => {
          if (state !== 'loading') e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-accent)';
        }}
      >
        {state === 'loading' ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Join free'
        )}
      </button>
      {errorMsg && (
        <p
          id="newsletter-error"
          className="absolute mt-14 text-xs"
          style={{ color: 'var(--color-error)' }}
          role="alert"
          aria-live="polite"
        >
          {errorMsg}
        </p>
      )}
    </form>
  );
}
