import { useState } from 'react';
import type { FillBlankQuestion, QuestionComponentProps } from '../../../lib/quiz/types';

export default function FillBlank({
  question,
  onAnswer,
  answered,
}: QuestionComponentProps<FillBlankQuestion>) {
  const [value, setValue] = useState('');
  const isCorrect =
    answered &&
    question.acceptedAnswers.some(
      (a) => a.trim().toLowerCase() === value.trim().toLowerCase()
    );

  function handleSubmit() {
    if (answered || !value.trim()) return;
    const correct = question.acceptedAnswers.some(
      (a) => a.trim().toLowerCase() === value.trim().toLowerCase()
    );
    onAnswer(correct);
  }

  return (
    <div>
      <p
        className="text-base font-medium mb-4 leading-relaxed"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {question.question}
      </p>

      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          disabled={answered}
          placeholder="Type your answer..."
          className="flex-1 px-3 py-2.5 border text-sm transition-colors outline-none"
          style={{
            borderColor: answered
              ? isCorrect
                ? 'var(--color-success)'
                : 'var(--color-error)'
              : 'var(--color-border)',
            backgroundColor: answered
              ? isCorrect
                ? 'rgba(22, 163, 74, 0.05)'
                : 'rgba(220, 38, 38, 0.05)'
              : 'transparent',
            color: 'var(--color-text-primary)',
          }}
        />
        {!answered && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="px-5 py-2.5 text-sm font-semibold text-white transition-colors"
            style={{
              backgroundColor: value.trim()
                ? 'var(--color-accent)'
                : 'var(--color-accent-muted)',
              cursor: value.trim() ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => {
              if (value.trim())
                e.currentTarget.style.backgroundColor =
                  'var(--color-accent-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = value.trim()
                ? 'var(--color-accent)'
                : 'var(--color-accent-muted)';
            }}
          >
            Submit
          </button>
        )}
      </div>

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
            {isCorrect ? 'Correct!' : 'Incorrect.'}
          </strong>{' '}
          {!isCorrect && (
            <span>
              Accepted answers:{' '}
              <strong style={{ color: 'var(--color-text-primary)' }}>
                {question.acceptedAnswers.join(', ')}
              </strong>
              .{' '}
            </span>
          )}
          {question.explanation}
        </div>
      )}
    </div>
  );
}
