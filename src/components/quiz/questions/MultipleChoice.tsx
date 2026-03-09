import { useState } from 'react';
import type { MultipleChoiceQuestion, QuestionComponentProps } from '../../../lib/quiz/types';

export default function MultipleChoice({
  question,
  onAnswer,
  answered,
}: QuestionComponentProps<MultipleChoiceQuestion>) {
  const [selected, setSelected] = useState<number | null>(null);
  const isCorrect = selected === question.correctIndex;

  function handleSelect(index: number) {
    if (answered) return;
    setSelected(index);
    onAnswer(index === question.correctIndex);
  }

  return (
    <div>
      <p
        className="text-base font-medium mb-4 leading-relaxed"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {question.question}
      </p>

      <fieldset aria-label={question.question}>
        <legend className="sr-only">{question.question}</legend>
        <div className="space-y-2">
          {question.options.map((option, i) => {
            let borderColor = 'var(--color-border)';
            let bgColor = 'transparent';

            if (answered && selected !== null) {
              if (i === question.correctIndex) {
                borderColor = 'var(--color-success)';
                bgColor = 'rgba(22, 163, 74, 0.05)';
              } else if (i === selected && !isCorrect) {
                borderColor = 'var(--color-error)';
                bgColor = 'rgba(220, 38, 38, 0.05)';
              }
            }

            return (
              <label
                key={i}
                className="flex items-center gap-3 p-3 border cursor-pointer transition-colors"
                style={{
                  borderColor,
                  backgroundColor: bgColor,
                  cursor: answered ? 'default' : 'pointer',
                }}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  checked={selected === i}
                  onChange={() => handleSelect(i)}
                  disabled={answered}
                  className="sr-only"
                />
                <span
                  className="w-5 h-5 border flex items-center justify-center flex-shrink-0 text-xs font-medium"
                  style={{
                    borderColor,
                    color:
                      selected === i
                        ? 'white'
                        : 'var(--color-text-secondary)',
                    backgroundColor:
                      selected === i
                        ? isCorrect || i === question.correctIndex
                          ? 'var(--color-success)'
                          : 'var(--color-error)'
                        : 'transparent',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

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
