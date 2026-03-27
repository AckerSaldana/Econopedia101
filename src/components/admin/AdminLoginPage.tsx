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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="admin-card-accent" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        {/* Branding */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-accent)',
            marginBottom: '4px',
          }}
        >
          Econopedia 101
        </p>
        <h1 className="admin-page-title" style={{ marginBottom: '4px' }}>
          Admin Login
        </h1>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}
        >
          Sign in to manage Econopedia 101
        </p>

        {/* Google OAuth */}
        <button onClick={signInWithGoogle} className="admin-btn-oauth" style={{ marginBottom: '24px' }}>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
          <hr className="admin-divider" style={{ flex: 1 }} />
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-text-muted)',
            }}
          >
            or
          </span>
          <hr className="admin-divider" style={{ flex: 1 }} />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailLogin}>
          <label className="admin-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-input"
            style={{ marginBottom: '16px' }}
            required
          />

          <label className="admin-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
            style={{ marginBottom: '16px' }}
            required
          />

          {error && (
            <div className="admin-alert-error" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
