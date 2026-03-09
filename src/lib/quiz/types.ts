// ── Question Types ──────────────────────────────────────────────

export interface BaseQuestion {
  id: string;
  question: string;
  explanation: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: string[];
  correctIndex: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer: boolean;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  acceptedAnswers: string[];
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface ChartQuestion extends BaseQuestion {
  type: 'chart';
  chartConfig: {
    data: Record<string, unknown>[];
    xKey: string;
    yKey: string;
    yKey2?: string;
    type: 'area' | 'bar' | 'line';
    height?: number;
    yLabel?: string;
    y2Label?: string;
  };
  options: string[];
  correctIndex: number;
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | MatchingQuestion
  | ChartQuestion;

// ── Quiz ────────────────────────────────────────────────────────

export interface Quiz {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  related_post_slugs: string[];
  questions: Question[];
  passing_score: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// ── Component Props ─────────────────────────────────────────────

export interface QuestionComponentProps<T extends Question = Question> {
  question: T;
  onAnswer: (correct: boolean) => void;
  answered: boolean;
}
