import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Question, MultipleChoiceQuestion, TrueFalseQuestion, FillBlankQuestion, MatchingQuestion, ChartQuestion } from '../../../lib/quiz/types';
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Save, Loader2 } from 'lucide-react';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

interface QuizEditorProps {
  quizId?: string;
  navigate: (to: string) => void;
}

const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'true-false', label: 'True / False' },
  { value: 'fill-blank', label: 'Fill in the Blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'chart', label: 'Chart Question' },
];

function createQuestion(type: string): Question {
  const base = { id: crypto.randomUUID(), question: '', explanation: '' };
  switch (type) {
    case 'true-false':
      return { ...base, type: 'true-false', correctAnswer: true } as TrueFalseQuestion;
    case 'fill-blank':
      return { ...base, type: 'fill-blank', acceptedAnswers: [''] } as FillBlankQuestion;
    case 'matching':
      return { ...base, type: 'matching', pairs: [{ left: '', right: '' }] } as MatchingQuestion;
    case 'chart':
      return {
        ...base,
        type: 'chart',
        chartConfig: { data: [], xKey: 'x', yKey: 'y', type: 'bar' as const },
        options: ['', '', '', ''],
        correctIndex: 0,
      } as ChartQuestion;
    default:
      return {
        ...base,
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctIndex: 0,
      } as MultipleChoiceQuestion;
  }
}

const inputStyle = {
  borderColor: 'var(--color-border)',
  backgroundColor: 'var(--color-background)',
  color: 'var(--color-text-primary)',
};

const labelStyle = { color: 'var(--color-text-muted)' };

function QuestionEditor({
  question,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  question: Question;
  index: number;
  total: number;
  onChange: (q: Question) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="border p-4 mb-3" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={labelStyle}>
          Question {index + 1} — {QUESTION_TYPES.find((t) => t.value === question.type)?.label}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={index === 0} className="p-1 disabled:opacity-30" style={{ color: 'var(--color-text-muted)' }}>
            <ArrowUp size={14} />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="p-1 disabled:opacity-30" style={{ color: 'var(--color-text-muted)' }}>
            <ArrowDown size={14} />
          </button>
          <button onClick={onDelete} className="p-1" style={{ color: '#DC2626' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Question text */}
      <input
        type="text"
        value={question.question}
        onChange={(e) => onChange({ ...question, question: e.target.value })}
        placeholder="Question text"
        className="w-full border px-3 py-2 text-sm mb-2 outline-none"
        style={inputStyle}
      />

      {/* Type-specific fields */}
      {question.type === 'multiple-choice' && (
        <div className="space-y-1.5 mb-2">
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={question.correctIndex === i}
                onChange={() => onChange({ ...question, correctIndex: i })}
              />
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const options = [...question.options];
                  options[i] = e.target.value;
                  onChange({ ...question, options });
                }}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 border px-2 py-1.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      )}

      {question.type === 'true-false' && (
        <div className="flex gap-3 mb-2">
          {[true, false].map((val) => (
            <button
              key={String(val)}
              onClick={() => onChange({ ...question, correctAnswer: val })}
              className="px-4 py-1.5 text-sm border"
              style={{
                ...inputStyle,
                backgroundColor: question.correctAnswer === val ? 'var(--color-accent-light)' : 'var(--color-background)',
                borderColor: question.correctAnswer === val ? 'var(--color-accent)' : 'var(--color-border)',
              }}
            >
              {val ? 'True' : 'False'}
            </button>
          ))}
        </div>
      )}

      {question.type === 'fill-blank' && (
        <div className="mb-2">
          <label className="text-xs mb-1 block" style={labelStyle}>Accepted answers (comma-separated)</label>
          <input
            type="text"
            value={question.acceptedAnswers.join(', ')}
            onChange={(e) =>
              onChange({
                ...question,
                acceptedAnswers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
            className="w-full border px-2 py-1.5 text-sm outline-none"
            style={inputStyle}
          />
        </div>
      )}

      {question.type === 'matching' && (
        <div className="mb-2 space-y-1.5">
          {question.pairs.map((pair, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={pair.left}
                onChange={(e) => {
                  const pairs = [...question.pairs];
                  pairs[i] = { ...pairs[i], left: e.target.value };
                  onChange({ ...question, pairs });
                }}
                placeholder="Left"
                className="flex-1 border px-2 py-1.5 text-sm outline-none"
                style={inputStyle}
              />
              <span className="text-xs" style={labelStyle}>→</span>
              <input
                type="text"
                value={pair.right}
                onChange={(e) => {
                  const pairs = [...question.pairs];
                  pairs[i] = { ...pairs[i], right: e.target.value };
                  onChange({ ...question, pairs });
                }}
                placeholder="Right"
                className="flex-1 border px-2 py-1.5 text-sm outline-none"
                style={inputStyle}
              />
              <button
                onClick={() => {
                  const pairs = question.pairs.filter((_, j) => j !== i);
                  onChange({ ...question, pairs });
                }}
                className="p-1"
                style={{ color: '#DC2626' }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...question, pairs: [...question.pairs, { left: '', right: '' }] })}
            className="flex items-center gap-1 text-xs px-2 py-1"
            style={{ color: 'var(--color-accent)' }}
          >
            <Plus size={12} /> Add Pair
          </button>
        </div>
      )}

      {question.type === 'chart' && (
        <div className="mb-2 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs block mb-1" style={labelStyle}>Chart Type</label>
              <select
                value={question.chartConfig.type}
                onChange={(e) =>
                  onChange({
                    ...question,
                    chartConfig: { ...question.chartConfig, type: e.target.value as 'area' | 'bar' | 'line' },
                  })
                }
                className="w-full border px-2 py-1.5 text-sm outline-none"
                style={inputStyle}
              >
                <option value="area">Area</option>
                <option value="bar">Bar</option>
                <option value="line">Line</option>
              </select>
            </div>
            <div>
              <label className="text-xs block mb-1" style={labelStyle}>X Key</label>
              <input
                type="text"
                value={question.chartConfig.xKey}
                onChange={(e) =>
                  onChange({ ...question, chartConfig: { ...question.chartConfig, xKey: e.target.value } })
                }
                className="w-full border px-2 py-1.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={labelStyle}>Y Key</label>
              <input
                type="text"
                value={question.chartConfig.yKey}
                onChange={(e) =>
                  onChange({ ...question, chartConfig: { ...question.chartConfig, yKey: e.target.value } })
                }
                className="w-full border px-2 py-1.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1" style={labelStyle}>Data (JSON array)</label>
            <textarea
              value={JSON.stringify(question.chartConfig.data, null, 2)}
              onChange={(e) => {
                try {
                  const data = JSON.parse(e.target.value);
                  onChange({ ...question, chartConfig: { ...question.chartConfig, data } });
                } catch {}
              }}
              className="w-full border px-2 py-1.5 text-xs font-mono outline-none"
              style={{ ...inputStyle, minHeight: '80px' }}
            />
          </div>
          <div className="space-y-1.5">
            {question.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`chart-correct-${question.id}`}
                  checked={question.correctIndex === i}
                  onChange={() => onChange({ ...question, correctIndex: i })}
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const options = [...question.options];
                    options[i] = e.target.value;
                    onChange({ ...question, options });
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  className="flex-1 border px-2 py-1.5 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <input
        type="text"
        value={question.explanation}
        onChange={(e) => onChange({ ...question, explanation: e.target.value })}
        placeholder="Explanation (shown after answering)"
        className="w-full border px-3 py-2 text-sm outline-none"
        style={inputStyle}
      />
    </div>
  );
}

export default function QuizEditor({ quizId, navigate }: QuizEditorProps) {
  const [loading, setLoading] = useState(!!quizId);
  const [saving, setSaving] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(quizId || null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [relatedPostSlugs, setRelatedPostSlugs] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [published, setPublished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [addType, setAddType] = useState('multiple-choice');

  const slugEdited = { current: false };

  useEffect(() => {
    if (!quizId) return;
    supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single()
      .then(({ data }) => {
        if (!data) {
          navigate('/admin/quizzes');
          return;
        }
        setTitle(data.title);
        setSlug(data.slug);
        setDescription(data.description || '');
        setCategory(data.category || '');
        setRelatedPostSlugs((data.related_post_slugs || []).join(', '));
        setPassingScore(data.passing_score || 70);
        setPublished(data.published || false);
        setQuestions((data.questions || []) as Question[]);
        slugEdited.current = true;
        setLoading(false);
      });
  }, [quizId]);

  useEffect(() => {
    if (!slugEdited.current && title) {
      setSlug(slugify(title));
    }
  }, [title]);

  const handleSave = async () => {
    if (!title || !slug) return;
    setSaving(true);

    const data = {
      title,
      slug,
      description,
      category,
      related_post_slugs: relatedPostSlugs
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      passing_score: passingScore,
      published,
      questions: questions as any,
    };

    if (currentId) {
      await supabase.from('quizzes').update(data).eq('id', currentId);
    } else {
      const { data: inserted } = await supabase.from('quizzes').insert(data).select('id').single();
      if (inserted) {
        setCurrentId(inserted.id);
        window.history.replaceState(null, '', `/admin/quizzes/${inserted.id}`);
      }
    }

    setSaving(false);
  };

  const updateQuestion = (index: number, q: Question) => {
    const next = [...questions];
    next[index] = q;
    setQuestions(next);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (from: number, to: number) => {
    if (to < 0 || to >= questions.length) return;
    const next = [...questions];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setQuestions(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/quizzes')} className="p-1 hover:opacity-70" style={{ color: 'var(--color-text-muted)' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
            {quizId ? 'Edit Quiz' : 'New Quiz'}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !title}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Metadata */}
      <div className="space-y-3 mb-8">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={labelStyle}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={labelStyle}>Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                slugEdited.current = true;
                setSlug(e.target.value);
              }}
              className="w-full border px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border px-3 py-2 text-sm outline-none"
              style={inputStyle}
            >
              <option value="">Select...</option>
              <option value="trading">Trading</option>
              <option value="economics">Economics</option>
              <option value="finance">Finance</option>
              <option value="business">Business</option>
              <option value="banking-insurance">Banking & Insurance</option>
              <option value="education">Education</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full border px-3 py-2 text-sm outline-none resize-none"
            style={inputStyle}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={labelStyle}>Passing Score (%)</label>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              min={0}
              max={100}
              className="w-full border px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={labelStyle}>Related Post Slugs</label>
            <input
              type="text"
              value={relatedPostSlugs}
              onChange={(e) => setRelatedPostSlugs(e.target.value)}
              placeholder="slug-1, slug-2"
              className="w-full border px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
      </div>

      {/* Questions */}
      <div className="border-t pt-6" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Questions ({questions.length})
        </h2>

        {questions.map((q, i) => (
          <QuestionEditor
            key={q.id}
            question={q}
            index={i}
            total={questions.length}
            onChange={(updated) => updateQuestion(i, updated)}
            onDelete={() => deleteQuestion(i)}
            onMoveUp={() => moveQuestion(i, i - 1)}
            onMoveDown={() => moveQuestion(i, i + 1)}
          />
        ))}

        <div className="flex items-center gap-2 mt-3">
          <select
            value={addType}
            onChange={(e) => setAddType(e.target.value)}
            className="border px-2 py-1.5 text-sm outline-none"
            style={inputStyle}
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setQuestions([...questions, createQuestion(addType)])}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold border transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}
          >
            <Plus size={14} />
            Add Question
          </button>
        </div>
      </div>
    </div>
  );
}
