export default function AdminLoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="text-center">
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-accent)',
            marginBottom: '20px',
          }}
        >
          Econopedia 101
        </p>
        <div
          style={{
            width: '48px',
            height: '2px',
            backgroundColor: 'var(--color-accent)',
            margin: '0 auto 20px',
            animation: 'admin-pulse 1.4s ease-in-out infinite',
            transformOrigin: 'center',
          }}
        />
        <p
          style={{
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.02em',
          }}
        >
          Loading admin panel...
        </p>
      </div>
    </div>
  );
}
