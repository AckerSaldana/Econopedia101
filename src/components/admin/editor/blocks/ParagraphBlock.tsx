import { useRef, useEffect } from 'react';
import type { ParagraphBlock as ParagraphBlockType } from '../../../../types/blocks';

interface ParagraphBlockProps {
  block: ParagraphBlockType;
  onChange: (block: ParagraphBlockType) => void;
}

export default function ParagraphBlock({ block, onChange }: ParagraphBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [block.content]);

  return (
    <textarea
      ref={textareaRef}
      value={block.content}
      onChange={(e) => onChange({ ...block, content: e.target.value })}
      onInput={adjustHeight}
      placeholder="Write your paragraph..."
      rows={3}
      className="w-full resize-none outline-none"
      style={{
        padding: '12px 14px',
        fontSize: '14px',
        lineHeight: 1.7,
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border)',
        fontStyle: block.content ? 'normal' : 'italic',
        transition: 'border-color 150ms ease',
      }}
      onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--color-accent)'; }}
      onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--color-border)'; }}
    />
  );
}
