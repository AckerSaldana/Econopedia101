export default function QuizSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div
        className="border-t-2 pt-6 mb-6"
        style={{ borderColor: 'var(--color-accent)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className="h-5 w-40"
            style={{ backgroundColor: 'var(--color-surface-elevated)' }}
          />
          <div
            className="h-3 w-10"
            style={{ backgroundColor: 'var(--color-surface-elevated)' }}
          />
        </div>
        <div
          className="w-full h-1"
          style={{ backgroundColor: 'var(--color-surface-elevated)' }}
        />
      </div>

      {/* Question placeholder */}
      <div className="space-y-2 mb-6">
        <div
          className="h-4 w-full"
          style={{ backgroundColor: 'var(--color-surface-elevated)' }}
        />
        <div
          className="h-4 w-3/4"
          style={{ backgroundColor: 'var(--color-surface-elevated)' }}
        />
      </div>

      {/* Options placeholder */}
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-12 w-full border"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface-elevated)',
              opacity: 1 - i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
