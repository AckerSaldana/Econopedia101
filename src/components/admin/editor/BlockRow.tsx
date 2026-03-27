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
      className="admin-block-row"
      style={{ display: 'flex', gap: 0, padding: '16px 0', alignItems: 'flex-start' }}
    >
      {/* Left gutter */}
      <div style={{ width: '80px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', paddingTop: '4px', paddingRight: '12px' }}>
        <span className="admin-label" style={{ marginBottom: 0, fontSize: '10px' }}>
          {BLOCK_TYPE_LABELS[block.type]}
        </span>
      </div>

      {/* Block editor */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {renderBlockEditor(block, onChange, categories)}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px', paddingTop: '2px', flexShrink: 0 }}>
        <button
          className="admin-block-action"
          onClick={onMoveUp}
          disabled={index === 0}
        >
          <ArrowUp size={14} />
        </button>
        <button
          className="admin-block-action"
          onClick={onMoveDown}
          disabled={index === total - 1}
        >
          <ArrowDown size={14} />
        </button>
        <button
          className="admin-block-action admin-block-action--delete"
          onClick={onDelete}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
