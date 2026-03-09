import { useState, useMemo } from 'react';
import type { MatchingQuestion, QuestionComponentProps } from '../../../lib/quiz/types';

export default function Matching({
  question,
  onAnswer,
  answered,
}: QuestionComponentProps<MatchingQuestion>) {
  // Shuffle right-side options once on mount
  const shuffledRights = useMemo(() => {
    const rights = question.pairs.map((p) => p.right);
    for (let i = rights.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rights[i], rights[j]] = [rights[j], rights[i]];
    }
    return rights;
  }, [question.pairs]);

  const [selections, setSelections] = useState<(string | null)[]>(
    () => new Array(question.pairs.length).fill(null)
  );

  const allSelected = selections.every((s) => s !== null);

  function handleChange(index: number, value: string) {
    if (answered) return;
    setSelections((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleSubmit() {
    if (answered || !allSelected) return;
    const correct = question.pairs.every(
      (pair, i) => selections[i] === pair.right
    );
    onAnswer(correct);
  }

  const isCorrect =
    answered &&
    question.pairs.every((pair, i) => selections[i] === pair.right);

  return (
    <div>
      <p
        className="text-base font-medium mb-4 leading-relaxed"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {question.question}
      </p>

      <div className="space-y-3">
        {question.pairs.map((pair, i) => {
          const pairCorrect =
            answered && selections[i] === pair.right;
          const pairIncorrect =
            answered && selections[i] !== pair.right;

          return (
            <div key={i} className="flex items-center gap-3">
              <span
                className="text-sm font-medium flex-shrink-0 min-w-[120px]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {pair.left}
              </span>
              <span
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                →
              </span>
              <select
                value={selections[i] || ''}
                onChange={(e) => handleChange(i, e.target.value)}
                disabled={answered}
                className="flex-1 px-3 py-2 border text-sm outline-none appearance-none"
                style={{
                  borderColor: pairCorrect
                    ? 'var(--color-success)'
                    : pairIncorrect
                      ? 'var(--color-error)'
                      : 'var(--color-border)',
                  backgroundColor: pairCorrect
                    ? 'rgba(22, 163, 74, 0.05)'
                    : pairIncorrect
                      ? 'rgba(220, 38, 38, 0.05)'
                      : 'transparent',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="" disabled>
                  Select...
                </option>
                {shuffledRights.map((right) => (
                  <option key={right} value={right}>
                    {right}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {!answered && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allSelected}
          className="mt-4 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          style={{
            backgroundColor: allSelected
              ? 'var(--color-accent)'
              : 'var(--color-accent-muted)',
            cursor: allSelected ? 'pointer' : 'default',
          }}
          onMouseEnter={(e) => {
            if (allSelected)
              e.currentTarget.style.backgroundColor =
                'var(--color-accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = allSelected
              ? 'var(--color-accent)'
              : 'var(--color-accent-muted)';
          }}
        >
          Check Answers
        </button>
      )}

      {answered && (
        <div
          className="mt-4 p-3 border-l-2 text-sm leading-relaxed"
          style={{
            borderColor: isCorrect
              ? 'var(--color-success)'
              : 'var(--color-error)',
            backgroundColor: 'var(--color-surface-elevated)',
            color: 'var(--color-text-secondary)',
          }}
          role="status"
          aria-live="polite"
        >
          <strong
            style={{
              color: isCorrect
                ? 'var(--color-success)'
                : 'var(--color-error)',
            }}
          >
            {isCorrect ? 'All correct!' : 'Some matches are incorrect.'}
          </strong>{' '}
          {!isCorrect && (
            <span>
              Correct matches:{' '}
              {question.pairs
                .map((p) => `${p.left} → ${p.right}`)
                .join(', ')}
              .{' '}
            </span>
          )}
          {question.explanation}
        </div>
      )}
    </div>
  );
}
