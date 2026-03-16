import { useState } from 'react';
import { inputBase, labelBase, btnPrimary } from './adminStyles';

interface AdminLoginPageProps {
  signInWithGoogle: () => void;
  signInWithEmail: (email: string, password: string) => Promise<any>;
}

export default function AdminLoginPage({ signInWithGoogle, signInWithEmail }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div
        className="w-full max-w-[400px] p-10"
        style={{
          borderTop: '2px solid var(--color-accent)',
          border: '1px solid var(--color-border)',
          borderTopWidth: '2px',
          borderTopColor: 'var(--color-accent)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <p
          className="text-[15px] font-semibold uppercase mb-1"
          style={{
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.08em',
            color: 'var(--color-accent)',
          }}
        >
          Econopedia 101
        </p>
        <h1
          className="mb-1"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '28px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--color-text-primary)',
          }}
        >
          Admin Login
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Sign in to manage Econopedia 101
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full px-4 py-2.5 text-sm font-semibold mb-6"
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-background)',
            cursor: 'pointer',
            transition: 'border-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
          }}
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <hr className="flex-1" style={{ borderColor: 'var(--color-border)' }} />
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            or
          </span>
          <hr className="flex-1" style={{ borderColor: 'var(--color-border)' }} />
        </div>

        <form onSubmit={handleEmailLogin}>
          <label style={labelBase}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
            style={inputBase}
            required
          />

          <label style={labelBase}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
            style={inputBase}
            required
          />

          {error && (
            <div
              className="mb-4 px-3 py-2.5 text-xs"
              style={{
                borderLeft: '3px solid var(--color-error)',
                backgroundColor: 'rgba(220, 38, 38, 0.06)',
                color: 'var(--color-error)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 disabled:opacity-50"
            style={btnPrimary}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
