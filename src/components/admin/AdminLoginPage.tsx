import { useState } from 'react';

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm border p-8"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <h1
          className="text-2xl font-semibold mb-1"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
        >
          Admin Login
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Sign in to manage Econopedia 101
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full border px-4 py-2.5 text-sm font-semibold mb-6 hover:opacity-80 transition-opacity"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-background)',
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
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 text-sm mb-3 outline-none"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-primary)',
            }}
            required
          />

          <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 text-sm mb-4 outline-none"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-primary)',
            }}
            required
          />

          {error && (
            <p className="text-xs mb-3" style={{ color: '#DC2626' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
