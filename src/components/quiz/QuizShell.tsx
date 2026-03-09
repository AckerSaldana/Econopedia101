import type { ReactNode } from 'react';

interface QuizShellProps {
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
}

export default function QuizShell({
  title,
  description,
  currentStep,
  totalSteps,
  children,
}: QuizShellProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-t-2 border-[var(--color-accent)] pt-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2
            className="text-xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {title}
          </h2>
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {currentStep} / {totalSteps}
          </span>
        </div>
        {description && (
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {description}
          </p>
        )}

        {/* Progress bar */}
        <div
          className="w-full h-1"
          style={{ backgroundColor: 'var(--color-surface-elevated)' }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: 'var(--color-accent)',
            }}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
