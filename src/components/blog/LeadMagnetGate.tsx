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
      style={{
        marginTop: '2.5rem',
        marginBottom: '2.5rem',
        borderTop: '2px solid var(--color-accent)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div
        style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div
            style={{
              flexShrink: 0,
              width: '3.5rem',
              height: '3.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border)',
            }}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ color: 'var(--color-accent)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z"
              />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-accent)',
                marginBottom: '0.5rem',
              }}
            >
              Free Resource
            </p>
            <h3
              style={{
                fontWeight: 600,
                fontSize: '1.125rem',
                lineHeight: 1.3,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--color-text-secondary)',
                marginTop: '0.375rem',
                maxWidth: '32rem',
              }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Action area */}
        {unlocked ? (
          <a
            href={file}
            download
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              textDecoration: 'none',
              transition: 'background-color 150ms ease',
              alignSelf: 'flex-start',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF
          </a>
        ) : (
          <div>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                marginBottom: '0.75rem',
              }}
            >
              Enter your email to unlock this resource.
            </p>
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', gap: '0.5rem', maxWidth: '28rem' }}
            >
              <label htmlFor="lead-magnet-email" className="sr-only">
                Email address
              </label>
              <input
                id="lead-magnet-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="your@email.com"
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={(e) => {
                  if (!error) e.currentTarget.style.borderColor = 'var(--color-accent)';
                }}
                onBlur={(e) => {
                  if (!error) e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#fff',
                  backgroundColor: 'var(--color-accent)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
              >
                Unlock
              </button>
            </form>
            {error && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-error)',
                  marginTop: '0.5rem',
                }}
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
