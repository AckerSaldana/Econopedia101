import { useState } from 'react';
import type { Block } from '../../../types/blocks';
import BlockRow from './BlockRow';
import AddBlockMenu from './AddBlockMenu';
import { Plus } from 'lucide-react';

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
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
          {/* Between-block insert button */}
          {index > 0 && (
            <div
              style={{
                position: 'relative',
                height: '1px',
                background: 'var(--color-border)',
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
                      color: 'var(--color-text-muted)',
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
              {/* Expand hover zone so the button is reachable */}
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
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget.previousElementSibling?.querySelector(
                    '.insert-between-btn'
                  ) as HTMLButtonElement | null;
                  if (btn && insertIndex !== index) btn.style.opacity = '0';
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
          />
        </div>
      ))}

      {/* Add block menu at the end */}
      <div
        style={{
          borderTop: blocks.length > 0 ? '1px solid var(--color-border)' : 'none',
          padding: '16px 0',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <AddBlockMenu onAdd={(b) => handleAddBlock(b)} />
      </div>
    </div>
  );
}
