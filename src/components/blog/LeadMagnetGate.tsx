import { useState, useEffect } from 'react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email');

interface LeadMagnetGateProps {
  title: string;
  description: string;
  file: string;
}

export default function LeadMagnetGate({ title, description, file }: LeadMagnetGateProps) {
  const [email, setEmail] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lead-magnet-subscribed');
    if (stored === 'true') setUnlocked(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setError('');
    localStorage.setItem('lead-magnet-subscribed', 'true');
    setUnlocked(true);
  }

  return (
    <div
      className="p-6 border"
      style={{
        backgroundColor: 'var(--color-accent-light)',
        borderColor: 'rgba(22, 163, 74, 0.2)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
        >
          <svg className="w-6 h-6" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {description}
          </p>

          {unlocked ? (
            <a
              href={file}
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-medium text-sm transition-colors mt-2"
              style={{ backgroundColor: 'var(--color-accent)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
              </svg>
              Download PDF
            </a>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
              <label htmlFor="lead-magnet-email" className="sr-only">Email address</label>
              <input
                id="lead-magnet-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 border text-sm"
                style={{
                  borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: 'var(--color-accent)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
              >
                Unlock
              </button>
            </form>
          )}
          {error && (
            <p className="text-xs" style={{ color: 'var(--color-error)' }} role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
