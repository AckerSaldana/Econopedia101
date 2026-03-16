import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Quiz } from '../../../lib/quiz/types';
import { pageTitle, labelBase, btnPrimary, btnSecondary, btnDanger, CATEGORY_COLORS } from '../adminStyles';

type FilterTab = 'all' | 'draft' | 'published';

const SKELETON_WIDTHS = [75, 62, 88, 70, 55];

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (hours < 48) return 'yesterday';
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

interface QuizListProps {
  navigate: (to: string) => void;
}

export default function QuizList({ navigate }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('quizzes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setQuizzes((data || []) as Quiz[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase.from('quizzes').delete().eq('id', id);
      if (deleteError) {
        setError(deleteError.message);
      } else {
        setQuizzes((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz');
    } finally {
      setDeleteId(null);
    }
  };

  const deletingQuiz = deleteId ? quizzes.find((q) => q.id === deleteId) : null;

  // Counts
  const counts = {
    all: quizzes.length,
    draft: quizzes.filter((q) => q.published === false).length,
    published: quizzes.filter((q) => q.published === true).length,
  };

  // Latest date
  const latestDate = quizzes.length > 0 ? quizzes[0].updated_at : null;

  // Filtered quizzes
  const filtered =
    filter === 'all'
      ? quizzes
      : filter === 'draft'
        ? quizzes.filter((q) => q.published === false)
        : quizzes.filter((q) => q.published === true);

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'draft', label: 'Drafts', count: counts.draft },
    { key: 'published', label: 'Published', count: counts.published },
  ];

  const thStyle: React.CSSProperties = {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-muted)',
    fontWeight: 600,
    padding: '12px 16px',
    textAlign: 'left' as const,
    backgroundColor: 'transparent',
    borderBottom: '1px solid var(--color-border)',
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <span style={{ ...labelBase, marginBottom: '8px' }}>Assessments</span>
          <h1 style={pageTitle}>Quizzes</h1>
        </div>
        <button
          onClick={() => navigate('/admin/quizzes/new')}
          style={btnPrimary}
        >
          <Plus size={16} />
          New Quiz
        </button>
      </div>

      {/* Summary Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderTop: '2px solid var(--color-accent)',
          padding: '20px 24px',
          marginBottom: 0,
        }}
      >
        <div className="flex items-baseline justify-between flex-wrap gap-4">
          <div className="flex items-baseline gap-8 flex-wrap">
            <div className="flex items-baseline gap-2">
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '28px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}>
                {counts.all}
              </span>
              <span style={{ ...labelBase, marginBottom: 0 }}>Total</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '28px',
                fontWeight: 600,
                color: 'var(--color-success)',
                lineHeight: 1,
              }}>
                {counts.published}
              </span>
              <span style={{ ...labelBase, marginBottom: 0 }}>Published</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '28px',
                fontWeight: 600,
                color: 'var(--color-warning)',
                lineHeight: 1,
              }}>
                {counts.draft}
              </span>
              <span style={{ ...labelBase, marginBottom: 0 }}>Drafts</span>
            </div>
          </div>
          {latestDate && (
            <span style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
            }}>
              Latest: {timeAgo(latestDate)}
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        className="flex gap-0"
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
              marginBottom: 0,
              padding: '10px 16px',
              color:
                filter === tab.key
                  ? 'var(--color-accent)'
                  : 'var(--color-text-muted)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom:
                filter === tab.key
                  ? '2px solid var(--color-accent)'
                  : '2px solid transparent',
              marginBlockEnd: '-1px',
              cursor: 'pointer',
              transition: 'color 150ms ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tab.label}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                opacity: 0.6,
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 mt-4"
          style={{
            borderLeft: '2px solid var(--color-error)',
            backgroundColor: 'rgba(220, 38, 38, 0.04)',
            color: 'var(--color-error)',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div className="mt-0" style={{ overflowX: 'auto' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Title</th>
              <th style={{ ...thStyle, width: '120px' }}>Category</th>
              <th style={{ ...thStyle, width: '100px' }}>Questions</th>
              <th style={{ ...thStyle, width: '90px' }}>Status</th>
              <th style={{ ...thStyle, width: '100px' }} />
            </tr>
          </thead>
          <tbody>
            {/* Data rows */}
            {!loading && filtered.map((quiz) => (
              <tr
                key={quiz.id}
                style={{ borderBottom: '1px solid var(--color-border-subtle, var(--color-border))' }}
                onMouseEnter={(e) => {
                  const row = e.currentTarget;
                  row.style.backgroundColor = 'var(--color-surface-elevated)';
                  const actions = row.querySelector('[data-actions]') as HTMLElement | null;
                  if (actions) actions.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  const row = e.currentTarget;
                  row.style.backgroundColor = 'transparent';
                  const actions = row.querySelector('[data-actions]') as HTMLElement | null;
                  if (actions && !isMobile) actions.style.opacity = '0';
                }}
              >
                {/* Title */}
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                    style={{
                      textAlign: 'left',
                      color: 'var(--color-text-primary)',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '14px',
                      transition: 'color 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
                    }}
                  >
                    {quiz.title}
                  </button>
                  <p
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      marginTop: '2px',
                    }}
                  >
                    {quiz.slug}
                  </p>
                </td>

                {/* Category */}
                <td style={{ padding: '14px 16px' }}>
                  {quiz.category ? (
                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontWeight: 600,
                        color: CATEGORY_COLORS[quiz.category] || 'var(--color-text-secondary)',
                      }}
                    >
                      {quiz.category}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      Uncategorised
                    </span>
                  )}
                </td>

                {/* Questions */}
                <td
                  style={{
                    padding: '14px 16px',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {quiz.questions?.length || 0}
                </td>

                {/* Status */}
                <td style={{ padding: '14px 16px' }}>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: quiz.published ? 'var(--color-success)' : 'var(--color-warning)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--color-text-secondary)',
                        fontWeight: 600,
                      }}
                    >
                      {quiz.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td style={{ padding: '14px 16px' }}>
                  <div
                    data-actions
                    className="flex items-center justify-end gap-1"
                    style={{
                      opacity: isMobile ? 1 : 0,
                      transition: 'opacity 150ms ease',
                    }}
                  >
                    <button
                      onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        color: 'var(--color-text-muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 150ms ease',
                      }}
                      title="Edit"
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
                      }}
                    >
                      <Pencil size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setDeleteId(quiz.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        color: 'var(--color-text-muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 150ms ease',
                      }}
                      title="Delete"
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-error)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
                      }}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: '48px 16px', textAlign: 'center' }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '1px',
                      backgroundColor: 'var(--color-border)',
                      margin: '0 auto 16px',
                    }}
                  />
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                  }}>
                    {filter === 'all'
                      ? 'No quizzes yet'
                      : filter === 'draft'
                        ? 'No drafts'
                        : 'No published quizzes'}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                    marginBottom: filter === 'all' ? '16px' : '0',
                  }}>
                    {filter === 'all'
                      ? 'Create your first quiz to get started.'
                      : filter === 'draft'
                        ? 'All your quizzes are published.'
                        : 'Publish a draft to see it here.'}
                  </p>
                  {filter === 'all' && (
                    <button
                      onClick={() => navigate('/admin/quizzes/new')}
                      style={btnSecondary}
                    >
                      Create Quiz
                    </button>
                  )}
                </td>
              </tr>
            )}

            {/* Loading skeleton */}
            {loading &&
              SKELETON_WIDTHS.map((w, i) => (
                <tr
                  key={`skeleton-${i}`}
                  style={{ borderBottom: '1px solid var(--color-border-subtle, var(--color-border))' }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div
                      className="animate-pulse"
                      style={{
                        height: '14px',
                        width: `${w}%`,
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.5,
                      }}
                    />
                    <div
                      className="animate-pulse"
                      style={{
                        height: '10px',
                        width: `${w * 0.6}%`,
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.3,
                        marginTop: '6px',
                      }}
                    />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div
                      className="animate-pulse"
                      style={{
                        height: '10px',
                        width: '60px',
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.5,
                      }}
                    />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div
                      className="animate-pulse"
                      style={{
                        height: '10px',
                        width: '24px',
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.5,
                      }}
                    />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="flex items-center gap-2">
                      <div
                        className="animate-pulse"
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-border)',
                          opacity: 0.5,
                        }}
                      />
                      <div
                        className="animate-pulse"
                        style={{
                          height: '10px',
                          width: '36px',
                          backgroundColor: 'var(--color-border)',
                          opacity: 0.5,
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }} />
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && filtered.length > 0 && (
        <div
          className="flex items-center justify-center"
          style={{
            borderTop: '1px solid var(--color-border)',
            padding: '12px 16px',
          }}
        >
          <span style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
          }}>
            {filtered.length} {filtered.length === 1 ? 'quiz' : 'quizzes'} total
          </span>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteId(null);
          }}
        >
          <div
            className="w-full max-w-sm"
            style={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderTopWidth: '2px',
              borderTopColor: 'var(--color-error)',
              padding: '24px',
            }}
          >
            <h2 style={{ ...labelBase, marginBottom: '12px', color: 'var(--color-text-primary)' }}>
              Confirm Deletion
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                marginBottom: '8px',
              }}
            >
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                borderLeft: '2px solid var(--color-accent)',
                paddingLeft: '12px',
                paddingBlock: '4px',
                marginBottom: '20px',
              }}
            >
              {deletingQuiz.title}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} style={btnSecondary}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId!)} style={btnDanger}>
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
