import { useState } from 'react';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizWidgetProps {
  questions: Question[];
  title?: string;
  category?: string;
}

export default function QuizWidget({
  questions,
  title = 'Test Your Knowledge',
  category,
}: QuizWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const current = questions[currentIndex];
  const isCorrect = selectedAnswer === current?.correctIndex;
  const progress = ((currentIndex + (finished ? 1 : 0)) / questions.length) * 100;

  function handleSelect(index: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === current.correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  }

  function handleRetry() {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setFinished(false);
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="border p-6" style={{ borderColor: 'var(--color-border)' }}>
        <h3
          className="font-serif text-xl font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Quiz Complete
        </h3>
        <p
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--color-accent)' }}
        >
          {score}/{questions.length}
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          You got {percentage}% correct
        </p>
        {/* Progress bar */}
        <div
          className="w-full h-2 mb-6"
          style={{ backgroundColor: 'var(--color-surface-elevated)' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: 'var(--color-accent)',
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleRetry}
          className="px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: 'var(--color-accent)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="border p-6" style={{ borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-serif text-lg font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h3>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1 mb-6"
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

      {/* Question */}
      <p
        className="font-serif text-base font-medium mb-4 leading-relaxed"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {current.question}
      </p>

      {/* Options */}
      <fieldset aria-label={`Question ${currentIndex + 1}`}>
        <legend className="sr-only">{current.question}</legend>
        <div className="space-y-2">
          {current.options.map((option, i) => {
            let borderColor = 'var(--color-border)';
            let bgColor = 'transparent';

            if (selectedAnswer !== null) {
              if (i === current.correctIndex) {
                borderColor = 'var(--color-success)';
                bgColor = 'rgba(22, 163, 74, 0.05)';
              } else if (i === selectedAnswer && !isCorrect) {
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
                  cursor: selectedAnswer !== null ? 'default' : 'pointer',
                }}
              >
                <input
                  type="radio"
                  name={`question-${currentIndex}`}
                  checked={selectedAnswer === i}
                  onChange={() => handleSelect(i)}
                  disabled={selectedAnswer !== null}
                  className="sr-only"
                />
                <span
                  className="w-5 h-5 border flex items-center justify-center flex-shrink-0 text-xs font-medium"
                  style={{
                    borderColor,
                    color: selectedAnswer === i ? 'white' : 'var(--color-text-secondary)',
                    backgroundColor: selectedAnswer === i
                      ? (isCorrect || i === current.correctIndex ? 'var(--color-success)' : 'var(--color-error)')
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

      {/* Explanation */}
      {showExplanation && (
        <div
          className="mt-4 p-3 border-l-2 text-sm leading-relaxed"
          style={{
            borderColor: isCorrect ? 'var(--color-success)' : 'var(--color-error)',
            backgroundColor: 'var(--color-surface-elevated)',
            color: 'var(--color-text-secondary)',
          }}
          role="status"
          aria-live="polite"
        >
          <strong style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}>
            {isCorrect ? 'Correct!' : 'Incorrect.'}
          </strong>{' '}
          {current.explanation}
        </div>
      )}

      {/* Next button */}
      {showExplanation && (
        <button
          type="button"
          onClick={handleNext}
          className="mt-4 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: 'var(--color-accent)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
        >
          {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
        </button>
      )}
    </div>
  );
}
