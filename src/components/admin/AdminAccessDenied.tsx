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
        className="admin-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px',
          borderTopWidth: '2px',
          borderTopColor: 'var(--color-error)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '8px',
          }}
        >
          Access Denied
        </h1>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}
        >
          <strong className="admin-mono" style={{ fontSize: '13px' }}>
            {email}
          </strong>{' '}
          is not authorised to access the admin panel.
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-muted)', marginBottom: '28px' }}
        >
          Contact the site owner if you believe this is an error.
        </p>
        <button onClick={signOut} className="admin-btn-secondary">
          Sign Out
        </button>
      </div>
    </div>
  );
}
