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
    <div className="w-full">
      <label
        className="block text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Paragraph
      </label>
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={(e) => {
          onChange({ ...block, content: e.target.value });
        }}
        onInput={adjustHeight}
        placeholder="Write your paragraph..."
        rows={3}
        className="w-full px-3 py-2.5 text-sm leading-relaxed resize-none border focus:outline-none focus:border-current transition-colors"
        style={{
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border)',
          fontFamily: 'var(--font-sans)',
        }}
      />
    </div>
  );
}
