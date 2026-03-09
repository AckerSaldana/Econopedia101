import type { Question } from './types';

export function checkAnswer(question: Question, answer: unknown): boolean {
  switch (question.type) {
    case 'multiple-choice':
    case 'chart':
      return answer === question.correctIndex;

    case 'true-false':
      return answer === question.correctAnswer;

    case 'fill-blank': {
      if (typeof answer !== 'string') return false;
      const normalized = answer.trim().toLowerCase();
      return question.acceptedAnswers.some(
        (a) => a.trim().toLowerCase() === normalized
      );
    }

    case 'matching': {
      if (!Array.isArray(answer)) return false;
      return question.pairs.every(
        (pair, i) => answer[i] === pair.right
      );
    }

    default:
      return false;
  }
}

export function calculateScore(
  questions: Question[],
  answers: Map<string, unknown>
): { score: number; total: number; percentage: number } {
  let score = 0;
  for (const q of questions) {
    const answer = answers.get(q.id);
    if (answer !== undefined && checkAnswer(q, answer)) {
      score++;
    }
  }
  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  return { score, total, percentage };
}
