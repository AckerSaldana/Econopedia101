import { useRef, useEffect } from 'react';
import type { BlockquoteBlock as BlockquoteBlockType } from '../../../../types/blocks';

interface BlockquoteBlockProps {
  block: BlockquoteBlockType;
  onChange: (block: BlockquoteBlockType) => void;
}

export default function BlockquoteBlock({ block, onChange }: BlockquoteBlockProps) {
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
    <div
      style={{
        borderLeft: '4px solid var(--color-accent)',
        backgroundColor: 'var(--color-surface-elevated)',
      }}
    >
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        onInput={adjustHeight}
        placeholder="Enter quote text..."
        rows={3}
        className="w-full resize-none outline-none"
        style={{
          padding: '12px 14px',
          fontSize: '14px',
          lineHeight: 1.7,
          fontStyle: 'italic',
          backgroundColor: 'transparent',
          color: 'var(--color-text-primary)',
          border: 'none',
          fontFamily: 'var(--font-serif)',
        }}
      />
    </div>
  );
}
