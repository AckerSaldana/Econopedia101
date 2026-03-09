export default function AdminLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-8 h-8 border-2 border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: 'var(--color-border)', borderTopColor: 'transparent' }}
        />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Loading admin panel...
        </p>
      </div>
    </div>
  );
}
