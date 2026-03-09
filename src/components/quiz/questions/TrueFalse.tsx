import { useState } from 'react';
import type { TrueFalseQuestion, QuestionComponentProps } from '../../../lib/quiz/types';

export default function TrueFalse({
  question,
  onAnswer,
  answered,
}: QuestionComponentProps<TrueFalseQuestion>) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const isCorrect = selected === question.correctAnswer;

  function handleSelect(value: boolean) {
    if (answered) return;
    setSelected(value);
    onAnswer(value === question.correctAnswer);
  }

  const options = [
    { label: 'True', value: true },
    { label: 'False', value: false },
  ];

  return (
    <div>
      <p
        className="text-base font-medium mb-4 leading-relaxed"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {question.question}
      </p>

      <div className="flex gap-3">
        {options.map(({ label, value }) => {
          let borderColor = 'var(--color-border)';
          let bgColor = 'transparent';
          let textColor = 'var(--color-text-primary)';

          if (answered && selected !== null) {
            if (value === question.correctAnswer) {
              borderColor = 'var(--color-success)';
              bgColor = 'rgba(22, 163, 74, 0.05)';
            } else if (value === selected && !isCorrect) {
              borderColor = 'var(--color-error)';
              bgColor = 'rgba(220, 38, 38, 0.05)';
            }
          }

          if (selected === value && answered) {
            textColor = isCorrect
              ? 'var(--color-success)'
              : 'var(--color-error)';
          }

          return (
            <button
              key={label}
              type="button"
              onClick={() => handleSelect(value)}
              disabled={answered}
              className="flex-1 py-3 border text-sm font-semibold transition-colors"
              style={{
                borderColor,
                backgroundColor: bgColor,
                color: textColor,
                cursor: answered ? 'default' : 'pointer',
              }}
            >
              {label}
            </button>
          );
        })}
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
          {question.explanation}
        </div>
      )}
    </div>
  );
}
