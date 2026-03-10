import { useState, useEffect, useRef, useMemo } from 'react';
import { HelpCircle, Search } from 'lucide-react';
import type { QuizBlock as QuizBlockType } from '../../../../types/blocks';
import { supabase } from '../../../../lib/supabase';

interface QuizBlockProps {
  block: QuizBlockType;
  onChange: (block: QuizBlockType) => void;
  categories?: string[];
}

interface QuizOption {
  slug: string;
  title: string;
  category: string | null;
  questions: any[];
}

export default function QuizBlock({ block, onChange, categories = [] }: QuizBlockProps) {
  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('quizzes')
        .select('slug, title, category, questions')
        .eq('published', true)
        .order('title', { ascending: true });

      if (fetchError) setError(fetchError.message);
      else setQuizzes((data || []) as QuizOption[]);
      setLoading(false);
    };
    fetchQuizzes();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  const filteredQuizzes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const matched = query
      ? quizzes.filter((q) => q.title.toLowerCase().includes(query))
      : quizzes;

    // Sort: post-matching categories first, then alphabetically
    const lowerCats = categories.map((c) => c.toLowerCase());
    return matched.sort((a, b) => {
      const aMatch = a.category ? lowerCats.includes(a.category.toLowerCase()) : false;
      const bMatch = b.category ? lowerCats.includes(b.category.toLowerCase()) : false;
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [quizzes, searchQuery, categories]);

  const selectedQuiz = block.quizId ? quizzes.find((q) => q.slug === block.quizId) : null;

  const handleSelect = (quiz: QuizOption) => {
    onChange({ ...block, quizId: quiz.slug });
    setSelecting(false);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const openSelector = () => {
    setSelecting(true);
    setShowDropdown(true);
    setSearchQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '16px',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background)',
          fontSize: '13px',
          color: 'var(--color-text-muted)',
        }}
      >
        Loading quizzes...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '16px',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background)',
          fontSize: '13px',
          color: 'var(--color-error)',
        }}
      >
        Error loading quizzes: {error}
      </div>
    );
  }

  // Selected state: mini card
  if (block.quizId && selectedQuiz && !selecting) {
    return (
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderTop: '2px solid var(--color-accent)',
          backgroundColor: 'var(--color-surface)',
          padding: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <HelpCircle size={16} style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {selectedQuiz.title}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
          {selectedQuiz.category && (
            <span style={{ marginRight: '8px' }}>{selectedQuiz.category}</span>
          )}
          {selectedQuiz.questions?.length || 0} questions
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={openSelector}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--color-accent)',
            }}
          >
            Change
          </button>
          <a
            href="/admin/quizzes/new"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
            }}
          >
            Create new quiz
          </a>
        </div>
      </div>
    );
  }

  // Empty / selecting state
  return (
    <div>
      {!block.quizId && !selecting ? (
        <button
          type="button"
          onClick={openSelector}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '24px',
            border: '1px dashed var(--color-border)',
            backgroundColor: 'var(--color-background)',
            cursor: 'pointer',
            transition: 'border-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
          }}
        >
          <HelpCircle size={24} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Select a quiz
          </span>
        </button>
      ) : (
        <div ref={containerRef} style={{ position: 'relative' }}>
          {/* Search input */}
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowDropdown(false);
                  if (!block.quizId) setSelecting(false);
                  else {
                    setSelecting(false);
                    setSearchQuery('');
                  }
                }
              }}
              placeholder="Search quizzes..."
              style={{
                width: '100%',
                padding: '10px 12px 10px 32px',
                fontSize: '14px',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-accent)',
                outline: 'none',
              }}
            />
          </div>

          {/* Dropdown list */}
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 20,
                maxHeight: '240px',
                overflowY: 'auto',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderTop: 'none',
              }}
            >
              {filteredQuizzes.length === 0 ? (
                <div
                  style={{
                    padding: '12px',
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                  }}
                >
                  No quizzes found
                </div>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <button
                    key={quiz.slug}
                    type="button"
                    onClick={() => handleSelect(quiz)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '8px',
                      padding: '8px 12px',
                      border: 'none',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 100ms ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        'var(--color-surface-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {quiz.title}
                    </span>
                    {quiz.category && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          flexShrink: 0,
                        }}
                      >
                        {quiz.category}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                        flexShrink: 0,
                      }}
                    >
                      {quiz.questions?.length || 0}q
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Cancel link */}
          {selecting && block.quizId && (
            <button
              type="button"
              onClick={() => {
                setSelecting(false);
                setShowDropdown(false);
                setSearchQuery('');
              }}
              style={{
                marginTop: '6px',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
