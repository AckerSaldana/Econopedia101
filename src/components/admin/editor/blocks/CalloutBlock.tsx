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

const VARIANT_STYLES: Record<CalloutBlockType['variant'], { bg: string; activeBg: string; border: string; activeColor: string }> = {
  info: {
    bg: 'rgba(37, 99, 235, 0.06)',
    activeBg: 'var(--color-info)',
    border: 'var(--color-info)',
    activeColor: '#fff',
  },
  warning: {
    bg: 'rgba(217, 119, 6, 0.06)',
    activeBg: 'var(--color-warning)',
    border: 'var(--color-warning)',
    activeColor: '#fff',
  },
  tip: {
    bg: 'rgba(22, 163, 74, 0.06)',
    activeBg: 'var(--color-success)',
    border: 'var(--color-success)',
    activeColor: '#fff',
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

  const styles = VARIANT_STYLES[block.variant];

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 mb-2">
        {VARIANTS.map(({ value, label, icon: Icon }) => {
          const active = block.variant === value;
          const vs = VARIANT_STYLES[value];
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...block, variant: value })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.04em',
                border: '1px solid',
                borderColor: active ? vs.activeBg : 'var(--color-border)',
                backgroundColor: active ? vs.activeBg : 'transparent',
                color: active ? vs.activeColor : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <Icon size={12} />
              {label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          borderLeft: `3px solid ${styles.border}`,
          backgroundColor: styles.bg,
        }}
      >
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          onInput={adjustHeight}
          placeholder={`Enter ${block.variant} text...`}
          rows={3}
          className="w-full resize-none outline-none"
          style={{
            padding: '12px 14px',
            fontSize: '14px',
            lineHeight: 1.7,
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
            border: 'none',
          }}
        />
      </div>
    </div>
  );
}
