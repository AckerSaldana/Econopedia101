interface AdminAccessDeniedProps {
  email: string;
  signOut: () => void;
}

export default function AdminAccessDenied({ email, signOut }: AdminAccessDeniedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <h1
          className="text-2xl font-semibold mb-2"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
        >
          Access Denied
        </h1>
        <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>{email}</strong> is not authorised to access the admin panel.
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Contact the site owner if you believe this is an error.
        </p>
        <button
          onClick={signOut}
          className="px-5 py-2.5 text-sm font-semibold border transition-opacity hover:opacity-80"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
