import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import type { QuizBlock as QuizBlockType } from '../../../../types/blocks';
import { supabase } from '../../../../lib/supabase';

interface QuizBlockProps {
  block: QuizBlockType;
  onChange: (block: QuizBlockType) => void;
}

interface QuizOption {
  slug: string;
  title: string;
}

export default function QuizBlock({ block, onChange }: QuizBlockProps) {
  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('quizzes')
        .select('slug, title')
        .eq('published', true)
        .order('title', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setQuizzes(data || []);
      }

      setLoading(false);
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="w-full">
      <label
        className="block text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Quiz
      </label>

      {loading ? (
        <div
          className="flex items-center gap-2 px-3 py-3 border text-xs"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-background)',
          }}
        >
          Loading quizzes...
        </div>
      ) : error ? (
        <div
          className="px-3 py-3 border text-xs"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-error)',
            backgroundColor: 'var(--color-background)',
          }}
        >
          Error loading quizzes: {error}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <HelpCircle
            size={16}
            style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
          />
          <select
            value={block.quizId}
            onChange={(e) => onChange({ ...block, quizId: e.target.value })}
            className="flex-1 px-3 py-2 text-sm border focus:outline-none focus:border-current transition-colors appearance-none cursor-pointer"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border)',
            }}
          >
            <option value="">Select a quiz...</option>
            {quizzes.map((quiz) => (
              <option key={quiz.slug} value={quiz.slug}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {block.quizId && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Selected: <span style={{ color: 'var(--color-accent)' }}>{block.quizId}</span>
        </p>
      )}
    </div>
  );
}
