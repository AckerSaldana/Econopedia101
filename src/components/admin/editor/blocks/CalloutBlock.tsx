import { useRef, useEffect } from 'react';
import { Info, AlertTriangle, Lightbulb } from 'lucide-react';
import type { CalloutBlock as CalloutBlockType } from '../../../../types/blocks';

interface CalloutBlockProps {
  block: CalloutBlockType;
  onChange: (block: CalloutBlockType) => void;
}

const VARIANTS: { value: CalloutBlockType['variant']; label: string; icon: typeof Info }[] = [
  { value: 'info', label: 'Info', icon: Info },
  { value: 'warning', label: 'Warning', icon: AlertTriangle },
  { value: 'tip', label: 'Tip', icon: Lightbulb },
];

const VARIANT_COLORS: Record<CalloutBlockType['variant'], { bg: string; border: string; text: string }> = {
  info: {
    bg: 'var(--color-info)',
    border: 'var(--color-info)',
    text: '#fff',
  },
  warning: {
    bg: 'var(--color-warning)',
    border: 'var(--color-warning)',
    text: '#fff',
  },
  tip: {
    bg: 'var(--color-success)',
    border: 'var(--color-success)',
    text: '#fff',
  },
};

export default function CalloutBlock({ block, onChange }: CalloutBlockProps) {
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

  const colors = VARIANT_COLORS[block.variant];

  return (
    <div className="w-full">
      <label
        className="block text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Callout
      </label>

      {/* Variant selector */}
      <div className="flex items-center gap-1 mb-2">
        {VARIANTS.map(({ value, label, icon: Icon }) => {
          const active = block.variant === value;
          const variantColor = VARIANT_COLORS[value];
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...block, variant: value })}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium uppercase tracking-wider border transition-colors"
              style={{
                backgroundColor: active ? variantColor.bg : 'transparent',
                color: active ? variantColor.text : 'var(--color-text-secondary)',
                borderColor: active ? variantColor.border : 'var(--color-border)',
              }}
            >
              <Icon size={12} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Content textarea with accent left border */}
      <div
        className="border-l-[3px]"
        style={{ borderColor: colors.border }}
      >
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          onInput={adjustHeight}
          placeholder={`Enter ${block.variant} text...`}
          rows={3}
          className="w-full px-3 py-2.5 text-sm leading-relaxed resize-none border border-l-0 focus:outline-none focus:border-current transition-colors"
          style={{
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
          }}
        />
      </div>
    </div>
  );
}
