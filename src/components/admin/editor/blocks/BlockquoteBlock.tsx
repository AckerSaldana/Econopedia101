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
    <div className="w-full">
      <label
        className="block text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Blockquote
      </label>
      <div
        className="border-l-[3px] pl-0"
        style={{ borderColor: 'var(--color-accent)' }}
      >
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          onInput={adjustHeight}
          placeholder="Enter quote text..."
          rows={3}
          className="w-full px-3 py-2.5 text-sm italic leading-relaxed resize-none border border-l-0 focus:outline-none focus:border-current transition-colors"
          style={{
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
            fontFamily: 'var(--font-serif)',
          }}
        />
      </div>
    </div>
  );
}
