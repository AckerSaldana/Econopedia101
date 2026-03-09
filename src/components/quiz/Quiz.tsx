import { useState, useEffect, useCallback } from 'react';
import type { Quiz as QuizType, Question } from '../../lib/quiz/types';
import { getQuizBySlug, recordAttempt } from '../../lib/quiz/fetch';
import QuizShell from './QuizShell';
import QuizSkeleton from './QuizSkeleton';
import QuizResults from './QuizResults';
import MultipleChoice from './questions/MultipleChoice';
import TrueFalse from './questions/TrueFalse';
import FillBlank from './questions/FillBlank';
import ChartQuestion from './questions/ChartQuestion';
import Matching from './questions/Matching';

interface QuizProps {
  quizId: string;
}

export default function Quiz({ quizId }: QuizProps) {
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    getQuizBySlug(quizId)
      .then((data) => {
        if (!data) {
          setError('Quiz not found');
        } else {
          setQuiz(data);
        }
      })
      .catch(() => setError('Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      setAnswered(true);
      if (correct) setScore((s) => s + 1);
    },
    []
  );

  function handleNext() {
    if (!quiz) return;
    if (currentIndex + 1 >= quiz.questions.length) {
      setFinished(true);
      recordAttempt(quiz.id, score, quiz.questions.length);
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswered(false);
    }
  }

  function handleRetry() {
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setFinished(false);
  }

  if (loading) return <QuizSkeleton />;

  if (error || !quiz) {
    return (
      <div
        className="border p-6 text-sm"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
      >
        {error || 'Quiz unavailable'}
      </div>
    );
  }

  if (finished) {
    return (
      <QuizResults
        score={score}
        total={quiz.questions.length}
        passingScore={quiz.passing_score}
        onRetry={handleRetry}
      />
    );
  }

  const question = quiz.questions[currentIndex];

  return (
    <QuizShell
      title={quiz.title}
      description={quiz.description || undefined}
      currentStep={currentIndex + 1}
      totalSteps={quiz.questions.length}
    >
      <div className="border p-6" style={{ borderColor: 'var(--color-border)' }}>
        <QuestionRenderer
          question={question}
          onAnswer={handleAnswer}
          answered={answered}
        />

        {answered && (
          <button
            type="button"
            onClick={handleNext}
            className="mt-4 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--color-accent)' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                'var(--color-accent-hover)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--color-accent)')
            }
          >
            {currentIndex + 1 >= quiz.questions.length
              ? 'See Results'
              : 'Next Question'}
          </button>
        )}
      </div>
    </QuizShell>
  );
}

function QuestionRenderer({
  question,
  onAnswer,
  answered,
}: {
  question: Question;
  onAnswer: (correct: boolean) => void;
  answered: boolean;
}) {
  // Key by question id only — resets internal state when navigating to a new question
  const key = question.id;

  switch (question.type) {
    case 'multiple-choice':
      return (
        <MultipleChoice
          key={key}
          question={question}
          onAnswer={onAnswer}
          answered={answered}
        />
      );
    case 'true-false':
      return (
        <TrueFalse
          key={key}
          question={question}
          onAnswer={onAnswer}
          answered={answered}
        />
      );
    case 'fill-blank':
      return (
        <FillBlank
          key={key}
          question={question}
          onAnswer={onAnswer}
          answered={answered}
        />
      );
    case 'chart':
      return (
        <ChartQuestion
          key={key}
          question={question}
          onAnswer={onAnswer}
          answered={answered}
        />
      );
    case 'matching':
      return (
        <Matching
          key={key}
          question={question}
          onAnswer={onAnswer}
          answered={answered}
        />
      );
    default:
      return null;
  }
}
