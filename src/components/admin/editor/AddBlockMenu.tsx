import { useState, useRef, useEffect } from 'react';
import {
  Type,
  Heading,
  Quote,
  List,
  ListOrdered,
  Code,
  Image,
  Minus,
  Table,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Sigma,
  Plus,
} from 'lucide-react';
import type { Block } from '../../../types/blocks';

interface AddBlockMenuProps {
  onAdd: (block: Block) => void;
  onClose?: () => void;
}

interface BlockOption {
  type: Block['type'];
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  group: string;
  factory: () => Block;
}

const BLOCK_OPTIONS: BlockOption[] = [
  {
    type: 'paragraph',
    label: 'Paragraph',
    icon: Type,
    group: 'Text',
    factory: () => ({ id: crypto.randomUUID(), type: 'paragraph', content: '' }),
  },
  {
    type: 'heading',
    label: 'Heading',
    icon: Heading,
    group: 'Text',
    factory: () => ({ id: crypto.randomUUID(), type: 'heading', level: 2, text: '' }),
  },
  {
    type: 'blockquote',
    label: 'Blockquote',
    icon: Quote,
    group: 'Text',
    factory: () => ({ id: crypto.randomUUID(), type: 'blockquote', content: '' }),
  },
  {
    type: 'bullet-list',
    label: 'Bullet List',
    icon: List,
    group: 'Lists',
    factory: () => ({ id: crypto.randomUUID(), type: 'bullet-list', items: [''] }),
  },
  {
    type: 'ordered-list',
    label: 'Ordered List',
    icon: ListOrdered,
    group: 'Lists',
    factory: () => ({ id: crypto.randomUUID(), type: 'ordered-list', items: [''] }),
  },
  {
    type: 'image',
    label: 'Image',
    icon: Image,
    group: 'Media',
    factory: () => ({ id: crypto.randomUUID(), type: 'image', url: '', alt: '' }),
  },
  {
    type: 'chart',
    label: 'Chart',
    icon: BarChart3,
    group: 'Media',
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'chart',
      chartConfig: {
        data: [
          { label: '2020', value: 120 },
          { label: '2021', value: 180 },
          { label: '2022', value: 150 },
          { label: '2023', value: 220 },
          { label: '2024', value: 280 },
        ],
        xKey: 'label',
        yKey: 'value',
        type: 'line',
      },
    }),
  },
  {
    type: 'formula',
    label: 'Formula',
    icon: Sigma,
    group: 'Media',
    factory: () => ({ id: crypto.randomUUID(), type: 'formula', latex: '' }),
  },
  {
    type: 'code',
    label: 'Code',
    icon: Code,
    group: 'Structure',
    factory: () => ({ id: crypto.randomUUID(), type: 'code', language: '', code: '' }),
  },
  {
    type: 'table',
    label: 'Table',
    icon: Table,
    group: 'Structure',
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'table',
      headers: ['Column 1', 'Column 2'],
      rows: [['', '']],
    }),
  },
  {
    type: 'callout',
    label: 'Callout',
    icon: AlertCircle,
    group: 'Structure',
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'callout',
      variant: 'info',
      content: '',
    }),
  },
  {
    type: 'quiz',
    label: 'Quiz',
    icon: HelpCircle,
    group: 'Structure',
    factory: () => ({ id: crypto.randomUUID(), type: 'quiz', quizId: '' }),
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: Minus,
    group: 'Structure',
    factory: () => ({ id: crypto.randomUUID(), type: 'divider' }),
  },
];

const GROUP_ORDER = ['Text', 'Lists', 'Media', 'Structure'];

export default function AddBlockMenu({ onAdd, onClose }: AddBlockMenuProps) {
  const [open, setOpen] = useState(!!onClose);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        onClose?.();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  const handleSelect = (option: BlockOption) => {
    onAdd(option.factory());
    setOpen(false);
    onClose?.();
  };

  // Group options
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: BLOCK_OPTIONS.filter((o) => o.group === group),
  }));

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      {!onClose && (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.02em',
            textTransform: 'uppercase' as const,
            transition: 'border-color 150ms ease, color 150ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
          }}
        >
          <Plus size={16} />
          Add Block
        </button>
      )}

      {open && (
        <div
          style={{
            position: 'absolute',
            top: onClose ? '50%' : '100%',
            left: onClose ? '50%' : '0',
            transform: onClose ? 'translate(-50%, 8px)' : 'translateY(4px)',
            zIndex: 50,
            minWidth: '240px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderTopWidth: '2px',
            borderTopColor: 'var(--color-accent)',
            maxHeight: '360px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '13px',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            Add Block
          </div>

          {grouped.map(({ group, items }) => (
            <div key={group}>
              <div
                style={{
                  padding: '8px 16px 4px',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                }}
              >
                {group}
              </div>
              {items.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => handleSelect(option)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '10px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: 'left',
                      transition: 'background 100ms ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-light)';
                      const icon = e.currentTarget.querySelector('svg');
                      if (icon) icon.style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      const icon = e.currentTarget.querySelector('svg');
                      if (icon) icon.style.color = '';
                    }}
                  >
                    <Icon size={16} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
              {group !== GROUP_ORDER[GROUP_ORDER.length - 1] && (
                <div style={{ borderBottom: '1px solid var(--color-border)', margin: '4px 16px' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
