import { btnSecondary } from './adminStyles';

interface AdminAccessDeniedProps {
  email: string;
  signOut: () => void;
}

export default function AdminAccessDenied({ email, signOut }: AdminAccessDeniedProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div
        className="w-full max-w-[400px] p-10"
        style={{
          border: '1px solid var(--color-border)',
          borderTopWidth: '2px',
          borderTopColor: 'var(--color-error)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <h1
          className="text-2xl font-semibold mb-2"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
        >
          Access Denied
        </h1>
        <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{email}</strong> is not authorised to access the admin panel.
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Contact the site owner if you believe this is an error.
        </p>
        <button
          onClick={signOut}
          style={btnSecondary}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-error)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-error)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
