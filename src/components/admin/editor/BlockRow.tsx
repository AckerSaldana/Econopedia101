import type { Block } from '../../../types/blocks';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import ParagraphBlock from './blocks/ParagraphBlock';
import HeadingBlock from './blocks/HeadingBlock';
import BlockquoteBlock from './blocks/BlockquoteBlock';
import BulletListBlock from './blocks/BulletListBlock';
import OrderedListBlock from './blocks/OrderedListBlock';
import CodeBlock from './blocks/CodeBlock';
import ImageBlock from './blocks/ImageBlock';
import DividerBlock from './blocks/DividerBlock';
import TableBlock from './blocks/TableBlock';
import CalloutBlock from './blocks/CalloutBlock';
import QuizBlock from './blocks/QuizBlock';
import ChartBlock from './blocks/ChartBlock';
import FormulaBlock from './blocks/FormulaBlock';

interface BlockRowProps {
  block: Block;
  index: number;
  total: number;
  onChange: (block: Block) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  categories?: string[];
}

const BLOCK_TYPE_LABELS: Record<Block['type'], string> = {
  paragraph: 'Paragraph',
  heading: 'Heading',
  blockquote: 'Blockquote',
  'bullet-list': 'Bullet List',
  'ordered-list': 'Ordered List',
  code: 'Code',
  image: 'Image',
  divider: 'Divider',
  table: 'Table',
  callout: 'Callout',
  quiz: 'Quiz',
  chart: 'Chart',
  formula: 'Formula',
};

function renderBlockEditor(block: Block, onChange: (block: Block) => void, categories?: string[]) {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphBlock block={block} onChange={onChange as any} />;
    case 'heading':
      return <HeadingBlock block={block} onChange={onChange as any} />;
    case 'blockquote':
      return <BlockquoteBlock block={block} onChange={onChange as any} />;
    case 'bullet-list':
      return <BulletListBlock block={block} onChange={onChange as any} />;
    case 'ordered-list':
      return <OrderedListBlock block={block} onChange={onChange as any} />;
    case 'code':
      return <CodeBlock block={block} onChange={onChange as any} />;
    case 'image':
      return <ImageBlock block={block} onChange={onChange as any} />;
    case 'divider':
      return <DividerBlock block={block} onChange={onChange as any} />;
    case 'table':
      return <TableBlock block={block} onChange={onChange as any} />;
    case 'callout':
      return <CalloutBlock block={block} onChange={onChange as any} />;
    case 'quiz':
      return <QuizBlock block={block} onChange={onChange as any} categories={categories} />;
    case 'chart':
      return <ChartBlock block={block} onChange={onChange as any} />;
    case 'formula':
      return <FormulaBlock block={block} onChange={onChange as any} />;
    default:
      return (
        <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
          Unknown block type
        </div>
      );
  }
}

export default function BlockRow({
  block,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  categories,
}: BlockRowProps) {
  return (
    <div
      className="flex gap-0 py-4 items-start group"
      style={{ transition: 'background-color 150ms ease' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-surface-elevated)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
      }}
    >
      {/* Left gutter */}
      <div className="w-[80px] flex-shrink-0 flex flex-col items-start gap-1 pt-1 pr-3">
        <span
          className="text-[10px] uppercase tracking-wider font-medium block-type-label"
          style={{
            color: 'var(--color-text-muted)',
            transition: 'color 150ms ease',
          }}
        >
          {BLOCK_TYPE_LABELS[block.type]}
        </span>
      </div>

      {/* Block editor */}
      <div className="flex-1 min-w-0">
        {renderBlockEditor(block, onChange, categories)}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-0.5 pl-2 pt-0.5 flex-shrink-0">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="w-7 h-7 flex items-center justify-center disabled:opacity-30"
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'background-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-surface-elevated)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
        >
          <ArrowUp size={14} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="w-7 h-7 flex items-center justify-center disabled:opacity-30"
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'background-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-surface-elevated)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
        >
          <ArrowDown size={14} />
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center"
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-error)',
            cursor: 'pointer',
            opacity: 0.4,
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '0.4';
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
