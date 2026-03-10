import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Question, MultipleChoiceQuestion, TrueFalseQuestion, FillBlankQuestion, MatchingQuestion, ChartQuestion } from '../../../lib/quiz/types';
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Save, Loader2 } from 'lucide-react';
import ChartDisplay from '../../calculators/ChartDisplay';
import { pageTitle, sectionTitle, btnPrimary, btnSecondary, inputBase, labelBase } from '../adminStyles';

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
        chartConfig: {
          data: [
            { label: 'Q1', value: 120 },
            { label: 'Q2', value: 180 },
            { label: 'Q3', value: 150 },
            { label: 'Q4', value: 220 },
          ],
          xKey: 'label',
          yKey: 'value',
          type: 'bar' as const,
        },
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

const LETTERS = ['A', 'B', 'C', 'D'];

const CHART_TYPES: { value: 'line' | 'area' | 'bar'; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
];

function ChartQuestionEditor({ question, onChange }: { question: ChartQuestion; onChange: (q: Question) => void }) {
  const config = question.chartConfig;
  const columns = useMemo(() => {
    if (!config.data.length) return [];
    return Object.keys(config.data[0]);
  }, [config.data]);

  const updateConfig = (updates: Partial<ChartQuestion['chartConfig']>) => {
    onChange({ ...question, chartConfig: { ...config, ...updates } });
  };

  const updateCell = (rowIdx: number, col: string, value: string) => {
    const newData = config.data.map((row, i) => {
      if (i !== rowIdx) return row;
      const num = Number(value);
      return { ...row, [col]: value === '' ? '' : isNaN(num) ? value : num };
    });
    updateConfig({ data: newData });
  };

  const addRow = () => {
    const emptyRow: Record<string, unknown> = {};
    for (const col of columns) emptyRow[col] = '';
    updateConfig({ data: [...config.data, emptyRow] });
  };

  const removeRow = (idx: number) => {
    updateConfig({ data: config.data.filter((_, i) => i !== idx) });
  };

  const hasData = config.data.length > 0 && config.xKey && config.yKey;

  return (
    <div className="mb-2 space-y-3">
      {/* Live preview */}
      {hasData && (
        <ChartDisplay
          data={config.data}
          xKey={config.xKey}
          yKey={config.yKey}
          yKey2={config.yKey2}
          type={config.type}
          height={180}
        />
      )}

      {/* Chart type + axis controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          {CHART_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateConfig({ type: value })}
              style={{
                padding: '3px 8px',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                border: '1px solid',
                borderColor: config.type === value ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: config.type === value ? 'var(--color-accent)' : 'transparent',
                color: config.type === value ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {columns.length > 0 && (
          <div className="flex items-center gap-3" style={{ fontSize: '12px' }}>
            <label className="flex items-center gap-1">
              <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>X</span>
              <select value={config.xKey} onChange={(e) => updateConfig({ xKey: e.target.value })} style={{ padding: '2px 4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none' }}>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1">
              <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Y</span>
              <select value={config.yKey} onChange={(e) => updateConfig({ yKey: e.target.value })} style={{ padding: '2px 4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none' }}>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
        )}
      </div>

      {/* Data spreadsheet */}
      <div style={{ border: '1px solid var(--color-border)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: '24px', padding: '4px', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }} />
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '4px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: col === config.xKey || col === config.yKey ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-surface)',
                    borderBottom: '1px solid var(--color-border)',
                    borderRight: '1px solid var(--color-border)',
                    textAlign: 'left',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td style={{ padding: '0 2px', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => removeRow(rowIdx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', opacity: 0.3, fontSize: '10px', padding: '1px', lineHeight: 1 }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-error)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.3'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                  >
                    &times;
                  </button>
                </td>
                {columns.map((col) => (
                  <td key={col} style={{ borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', padding: 0 }}>
                    <input
                      type="text"
                      value={String(row[col] ?? '')}
                      onChange={(e) => updateCell(rowIdx, col, e.target.value)}
                      style={{ width: '100%', padding: '4px 8px', fontSize: '12px', border: 'none', outline: 'none', backgroundColor: 'transparent', color: 'var(--color-text-primary)' }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} style={{ fontSize: '11px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
        + Add row
      </button>

      {/* Answer options */}
      <div className="space-y-1.5">
        <label style={{ ...labelBase, fontSize: '10px' }}>Answer Options</label>
        {question.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name={`chart-correct-${question.id}`}
              checked={question.correctIndex === i}
              onChange={() => onChange({ ...question, correctIndex: i })}
              style={{ accentColor: 'var(--color-accent)' }}
            />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', width: '16px' }}>
              {LETTERS[i]}
            </span>
            <input
              type="text"
              value={opt}
              onChange={(e) => {
                const options = [...question.options];
                options[i] = e.target.value;
                onChange({ ...question, options });
              }}
              placeholder={`Option ${LETTERS[i]}`}
              className="flex-1 outline-none"
              style={{ padding: '8px 10px', fontSize: '13px', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', transition: 'border-color 150ms ease' }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div
      className="mb-4 p-5"
      style={{
        borderLeft: '2px solid var(--color-accent)',
        border: '1px solid var(--color-border)',
        borderLeftWidth: '2px',
        borderLeftColor: 'var(--color-accent)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          Q{index + 1}
          <span
            className="ml-2 text-xs font-normal"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {QUESTION_TYPES.find((t) => t.value === question.type)?.label}
          </span>
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 disabled:opacity-20"
            style={{
              color: 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: 0.4,
              transition: 'opacity 150ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.4'; }}
          >
            <ArrowUp size={14} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1.5 disabled:opacity-20"
            style={{
              color: 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: 0.4,
              transition: 'opacity 150ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.4'; }}
          >
            <ArrowDown size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5"
            style={{
              color: 'var(--color-error)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: 0.4,
              transition: 'opacity 150ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.4'; }}
          >
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
        style={{ ...inputBase, marginBottom: '8px' }}
        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
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
                style={{ accentColor: 'var(--color-accent)' }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  width: '16px',
                }}
              >
                {LETTERS[i]}
              </span>
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const options = [...question.options];
                  options[i] = e.target.value;
                  onChange({ ...question, options });
                }}
                placeholder={`Option ${LETTERS[i]}`}
                className="flex-1 outline-none"
                style={{
                  padding: '8px 10px',
                  fontSize: '13px',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
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
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                border: '1px solid',
                borderColor: question.correctAnswer === val ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: question.correctAnswer === val ? 'var(--color-accent-light)' : 'var(--color-background)',
                color: question.correctAnswer === val ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {val ? 'True' : 'False'}
            </button>
          ))}
        </div>
      )}

      {question.type === 'fill-blank' && (
        <div className="mb-2">
          <label style={{ ...labelBase, fontSize: '10px' }}>Accepted answers (comma-separated)</label>
          <input
            type="text"
            value={question.acceptedAnswers.join(', ')}
            onChange={(e) =>
              onChange({
                ...question,
                acceptedAnswers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
            style={{ ...inputBase, fontSize: '13px' }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
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
                className="flex-1 outline-none"
                style={{
                  padding: '8px 10px',
                  fontSize: '13px',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
              />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>→</span>
              <input
                type="text"
                value={pair.right}
                onChange={(e) => {
                  const pairs = [...question.pairs];
                  pairs[i] = { ...pairs[i], right: e.target.value };
                  onChange({ ...question, pairs });
                }}
                placeholder="Right"
                className="flex-1 outline-none"
                style={{
                  padding: '8px 10px',
                  fontSize: '13px',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
              />
              <button
                onClick={() => {
                  const pairs = question.pairs.filter((_, j) => j !== i);
                  onChange({ ...question, pairs });
                }}
                className="p-1"
                style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...question, pairs: [...question.pairs, { left: '', right: '' }] })}
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
            + Add Pair
          </button>
        </div>
      )}

      {question.type === 'chart' && (
        <ChartQuestionEditor question={question} onChange={onChange} />
      )}

      {/* Explanation */}
      <input
        type="text"
        value={question.explanation}
        onChange={(e) => onChange({ ...question, explanation: e.target.value })}
        placeholder="Explanation (shown after answering)"
        style={{ ...inputBase, fontSize: '13px' }}
        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
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
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/quizzes')}
            className="p-1"
            style={{
              color: 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {quizId ? 'Edit Quiz' : 'New Quiz'}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !title}
          className="disabled:opacity-50"
          style={btnPrimary}
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Metadata card */}
      <div
        className="mb-8 p-6"
        style={{
          border: '1px solid var(--color-border)',
          borderTopWidth: '2px',
          borderTopColor: 'var(--color-accent)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div className="space-y-4">
          <div>
            <label style={labelBase}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputBase}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelBase}>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  slugEdited.current = true;
                  setSlug(e.target.value);
                }}
                style={{ ...inputBase, fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
              />
            </div>
            <div>
              <label style={labelBase}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={inputBase}
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
            <label style={labelBase}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={{ ...inputBase, resize: 'vertical' as const }}
              onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--color-border)'; }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelBase}>Passing Score (%)</label>
              <input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                min={0}
                max={100}
                style={inputBase}
              />
            </div>
            <div>
              <label style={labelBase}>Related Post Slugs</label>
              <input
                type="text"
                value={relatedPostSlugs}
                onChange={(e) => setRelatedPostSlugs(e.target.value)}
                placeholder="slug-1, slug-2"
                style={{ ...inputBase, fontSize: '13px' }}
              />
            </div>
          </div>
          <label
            className="flex items-center gap-2 text-sm cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              style={{ accentColor: 'var(--color-accent)' }}
            />
            Published
          </label>
        </div>
      </div>

      {/* Questions */}
      <div>
        <div className="mb-4">
          <h2 style={sectionTitle}>Questions ({questions.length})</h2>
          <div
            className="mt-1"
            style={{
              width: '48px',
              height: '2px',
              backgroundColor: 'var(--color-accent)',
            }}
          />
        </div>

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
            style={{ ...inputBase, width: 'auto', fontSize: '13px' }}
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setQuestions([...questions, createQuestion(addType)])}
            style={{
              ...btnSecondary,
              color: 'var(--color-accent)',
              padding: '8px 16px',
              fontSize: '13px',
            }}
          >
            <Plus size={14} />
            Add Question
          </button>
        </div>
      </div>
    </div>
  );
}
