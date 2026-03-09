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
  factory: () => Block;
}

const BLOCK_OPTIONS: BlockOption[] = [
  {
    type: 'paragraph',
    label: 'Paragraph',
    icon: Type,
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'paragraph',
      content: '',
    }),
  },
  {
    type: 'heading',
    label: 'Heading',
    icon: Heading,
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'heading',
      level: 2,
      text: '',
    }),
  },
  {
    type: 'blockquote',
    label: 'Blockquote',
    icon: Quote,
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'blockquote',
      content: '',
    }),
  },
  {
    type: 'bullet-list',
    label: 'Bullet List',
    icon: List,
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'bullet-list',
      items: [''],
    }),
  },
  {
    type: 'ordered-list',
    label: 'Ordered List',
    icon: ListOrdered,
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'ordered-list',
      items: [''],
    }),
  },
  {
    type: 'code',
    label: 'Code',
    icon: Code,
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'code',
      language: '',
      code: '',
    }),
  },
  {
    type: 'image',
    label: 'Image',
    icon: Image,
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'image',
      url: '',
      alt: '',
    }),
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: Minus,
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'divider',
    }),
  },
  {
    type: 'table',
    label: 'Table',
    icon: Table,
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
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'quiz',
      quizId: '',
    }),
  },
  {
    type: 'chart',
    label: 'Chart',
    icon: BarChart3,
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'chart',
      chartConfig: {
        data: [],
        xKey: 'x',
        yKey: 'y',
        type: 'line',
      },
    }),
  },
  {
    type: 'formula',
    label: 'Formula',
    icon: Sigma,
    factory: () => ({
      id: crypto.randomUUID(),
      type: 'formula',
      latex: '',
    }),
  },
];

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
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.02em',
            textTransform: 'uppercase' as const,
            transition: 'border-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'var(--color-accent)';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'var(--color-border)';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--color-text-secondary)';
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
            minWidth: '220px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            maxHeight: '360px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
            }}
          >
            Add Block
          </div>
          {BLOCK_OPTIONS.map((option) => {
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
                  padding: '8px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'background 100ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'var(--color-accent-light)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'transparent';
                }}
              >
                <Icon size={16} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
