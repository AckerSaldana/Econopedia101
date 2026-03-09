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
    <div className="w-full">
      <label
        className="block text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Code
      </label>

      <div className="mb-2">
        <select
          value={block.language}
          onChange={(e) => onChange({ ...block, language: e.target.value })}
          className="px-3 py-1.5 text-xs border focus:outline-none focus:border-current transition-colors appearance-none cursor-pointer"
          style={{
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <option value="">Select language</option>
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
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
        className="w-full px-4 py-3 text-sm leading-relaxed resize-none border focus:outline-none focus:border-current transition-colors"
        style={{
          backgroundColor: 'var(--color-surface-elevated, var(--color-background))',
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border)',
          fontFamily: 'var(--font-mono)',
          tabSize: 2,
        }}
      />
    </div>
  );
}
