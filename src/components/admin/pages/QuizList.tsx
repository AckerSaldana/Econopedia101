import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Quiz } from '../../../lib/quiz/types';

interface QuizListProps {
  navigate: (to: string) => void;
}

export default function QuizList({ navigate }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadQuizzes = async () => {
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .order('updated_at', { ascending: false });
    setQuizzes((data || []) as Quiz[]);
    setLoading(false);
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('quizzes').delete().eq('id', id);
    setDeleteId(null);
    loadQuizzes();
  };

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
      new Date(d),
    );

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
        >
          Quizzes
        </h1>
        <button
          onClick={() => navigate('/admin/quizzes/new')}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Plus size={16} />
          New Quiz
        </button>
      </div>

      <div className="border" style={{ borderColor: 'var(--color-border)' }}>
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_120px_100px_100px_80px] gap-4 px-5 py-2.5 border-b text-xs font-semibold uppercase tracking-wider"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>Title</span>
          <span>Category</span>
          <span>Questions</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No quizzes yet.
            </p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="grid grid-cols-[1fr_120px_100px_100px_80px] gap-4 px-5 py-3 border-b last:border-b-0 items-center"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {quiz.title}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {quiz.slug}
                </p>
              </div>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {quiz.category || '—'}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {quiz.questions?.length || 0}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 w-fit"
                style={{
                  backgroundColor: quiz.published ? '#D1FAE5' : 'var(--color-accent-light)',
                  color: quiz.published ? '#059669' : 'var(--color-accent)',
                }}
              >
                {quiz.published ? 'Published' : 'Draft'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                  className="p-1.5 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-text-muted)' }}
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteId(quiz.id)}
                  className="p-1.5 hover:opacity-70 transition-opacity"
                  style={{ color: '#DC2626' }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            className="border p-6 max-w-sm w-full mx-4"
            style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Delete Quiz
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm border hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#DC2626' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
