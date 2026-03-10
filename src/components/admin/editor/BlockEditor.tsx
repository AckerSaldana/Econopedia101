import { useState } from 'react';
import type { Block } from '../../../types/blocks';
import BlockRow from './BlockRow';
import AddBlockMenu from './AddBlockMenu';
import { Plus } from 'lucide-react';
import { btnSecondary } from '../adminStyles';

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  categories?: string[];
}

export default function BlockEditor({ blocks, onChange, categories }: BlockEditorProps) {
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  const handleBlockChange = (index: number, updated: Block) => {
    const next = [...blocks];
    next[index] = updated;
    onChange(next);
  };

  const handleDelete = (index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...blocks];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const next = [...blocks];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  const handleAddBlock = (block: Block, atIndex?: number) => {
    const next = [...blocks];
    const idx = atIndex !== undefined ? atIndex : blocks.length;
    next.splice(idx, 0, block);
    onChange(next);
    setInsertIndex(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {blocks.map((block, index) => (
        <div key={block.id}>
          {/* Between-block separator */}
          {index > 0 && (
            <div
              style={{
                position: 'relative',
                height: '1px',
                borderTop: '1px dashed var(--color-border-subtle)',
                margin: '0',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 5,
                }}
              >
                {insertIndex === index ? (
                  <AddBlockMenu
                    onAdd={(b) => handleAddBlock(b, index)}
                    onClose={() => setInsertIndex(null)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setInsertIndex(index)}
                    className="insert-between-btn"
                    style={{
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '50%',
                      color: 'var(--color-accent)',
                      cursor: 'pointer',
                      opacity: 0,
                      transition: 'opacity 150ms ease',
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.opacity = '0';
                    }}
                    title="Insert block"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
              {/* Expand hover zone */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-12px 0',
                  zIndex: 4,
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget.previousElementSibling?.querySelector(
                    '.insert-between-btn'
                  ) as HTMLButtonElement | null;
                  if (btn) btn.style.opacity = '1';
                  // Shift dashed line to accent
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.style.borderTopColor = 'var(--color-accent-muted)';
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget.previousElementSibling?.querySelector(
                    '.insert-between-btn'
                  ) as HTMLButtonElement | null;
                  if (btn && insertIndex !== index) btn.style.opacity = '0';
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.style.borderTopColor = 'var(--color-border-subtle)';
                }}
              />
            </div>
          )}

          <BlockRow
            block={block}
            index={index}
            total={blocks.length}
            onChange={(updated) => handleBlockChange(index, updated)}
            onDelete={() => handleDelete(index)}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            categories={categories}
          />
        </div>
      ))}

      {/* Add block at end */}
      <div
        style={{
          borderTop: blocks.length > 0 ? '1px solid var(--color-border)' : 'none',
          padding: '24px 0',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <AddBlockMenu onAdd={(b) => handleAddBlock(b)} />
      </div>
    </div>
  );
}
