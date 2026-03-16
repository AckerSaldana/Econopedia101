export default function AdminLoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="text-center">
        <p
          className="text-[13px] font-semibold uppercase mb-4"
          style={{
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.08em',
            color: 'var(--color-accent)',
          }}
        >
          Econopedia 101
        </p>
        <div
          className="mx-auto mb-4"
          style={{
            width: '48px',
            height: '2px',
            backgroundColor: 'var(--color-accent)',
            animation: 'admin-pulse 1.2s ease-in-out infinite',
          }}
        />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Loading admin panel...
        </p>
        <style>{`
          @keyframes admin-pulse {
            0%, 100% { transform: scaleX(1); opacity: 1; }
            50% { transform: scaleX(0.4); opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  );
}
