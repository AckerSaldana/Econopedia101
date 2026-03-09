import type { ReactNode } from 'react';

interface CalculatorShellProps {
  title: string;
  description: string;
  children: ReactNode;
  results?: ReactNode;
  chart?: ReactNode;
}

export default function CalculatorShell({
  title,
  description,
  children,
  results,
  chart,
}: CalculatorShellProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-t-2 border-[var(--color-accent)] pt-6 mb-8">
        <h2
          className="font-serif text-2xl font-semibold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {description}
        </p>
      </div>

      <div className="space-y-4">{children}</div>

      {results && (
        <div className="mt-8">{results}</div>
      )}

      {chart && (
        <div className="mt-8">{chart}</div>
      )}
    </div>
  );
}
