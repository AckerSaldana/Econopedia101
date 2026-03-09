interface QuizResultsProps {
  score: number;
  total: number;
  passingScore: number;
  onRetry: () => void;
}

export default function QuizResults({
  score,
  total,
  passingScore,
  onRetry,
}: QuizResultsProps) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= passingScore;

  return (
    <div className="border p-6" style={{ borderColor: 'var(--color-border)' }}>
      <h3
        className="text-xl font-semibold mb-4"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Quiz Complete
      </h3>

      <p
        className="text-3xl font-bold mb-2"
        style={{ color: 'var(--color-accent)' }}
      >
        {score}/{total}
      </p>

      <p
        className="text-sm mb-1"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        You got {percentage}% correct
      </p>

      <p
        className="text-xs mb-4"
        style={{
          color: passed ? 'var(--color-success)' : 'var(--color-error)',
        }}
      >
        {passed
          ? 'You passed!'
          : `${passingScore}% required to pass`}
      </p>

      {/* Score bar */}
      <div
        className="w-full h-2 mb-6"
        style={{ backgroundColor: 'var(--color-surface-elevated)' }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: passed
              ? 'var(--color-success)'
              : 'var(--color-accent)',
          }}
        />
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="px-5 py-2.5 text-sm font-semibold text-white transition-colors"
        style={{ backgroundColor: 'var(--color-accent)' }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor =
            'var(--color-accent-hover)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = 'var(--color-accent)')
        }
      >
        Try Again
      </button>
    </div>
  );
}
