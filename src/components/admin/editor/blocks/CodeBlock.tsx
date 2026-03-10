import { useRef, useEffect } from 'react';
import type { CodeBlock as CodeBlockType } from '../../../../types/blocks';

interface CodeBlockProps {
  block: CodeBlockType;
  onChange: (block: CodeBlockType) => void;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
];

export default function CodeBlock({ block, onChange }: CodeBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [block.code]);

  return (
    <div
      className="w-full"
      style={{
        borderLeft: '3px solid var(--color-accent-muted)',
        backgroundColor: 'var(--color-surface-elevated)',
      }}
    >
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)' }}>
        <select
          value={block.language}
          onChange={(e) => onChange({ ...block, language: e.target.value })}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">Select language</option>
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

      <textarea
        ref={textareaRef}
        value={block.code}
        onChange={(e) => onChange({ ...block, code: e.target.value })}
        onInput={adjustHeight}
        placeholder="Paste or write code here..."
        rows={6}
        spellCheck={false}
        className="w-full resize-none outline-none"
        style={{
          padding: '12px 14px',
          fontSize: '14px',
          lineHeight: 1.6,
          backgroundColor: 'transparent',
          color: 'var(--color-text-primary)',
          border: 'none',
          fontFamily: 'var(--font-mono)',
          tabSize: 2,
        }}
      />
    </div>
  );
}
