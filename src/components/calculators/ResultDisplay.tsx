interface ResultItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface ResultDisplayProps {
  results: ResultItem[];
  visible: boolean;
}

export default function ResultDisplay({ results, visible }: ResultDisplayProps) {
  if (!visible) return null;

  return (
    <div
      className="border p-5 space-y-3 animate-fade-in"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <h3
        className="text-xs font-bold uppercase tracking-wider mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Results
      </h3>
      {results.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between py-2"
          style={{
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <span
            className="text-sm"
            style={{
              color: item.highlight
                ? 'var(--color-text-primary)'
                : 'var(--color-text-secondary)',
              fontWeight: item.highlight ? 600 : 400,
            }}
          >
            {item.label}
          </span>
          <span
            className="text-sm font-medium tabular-nums"
            style={{
              color: item.highlight
                ? 'var(--color-accent)'
                : 'var(--color-text-primary)',
              fontWeight: item.highlight ? 700 : 500,
            }}
          >
            {item.value}
          </span>
        </div>
      ))}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
