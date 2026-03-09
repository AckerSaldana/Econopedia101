import { Plus, X } from 'lucide-react';
import type { BulletListBlock as BulletListBlockType } from '../../../../types/blocks';

interface BulletListBlockProps {
  block: BulletListBlockType;
  onChange: (block: BulletListBlockType) => void;
}

export default function BulletListBlock({ block, onChange }: BulletListBlockProps) {
  const updateItem = (index: number, value: string) => {
    const items = [...block.items];
    items[index] = value;
    onChange({ ...block, items });
  };

  const addItem = () => {
    onChange({ ...block, items: [...block.items, ''] });
  };

  const removeItem = (index: number) => {
    const items = block.items.filter((_, i) => i !== index);
    onChange({ ...block, items: items.length > 0 ? items : [''] });
  };

  return (
    <div className="w-full">
      <label
        className="block text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Bullet List
      </label>

      <div className="flex flex-col gap-1.5">
        {block.items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 flex-shrink-0"
              style={{ backgroundColor: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`List item ${index + 1}...`}
              className="flex-1 px-3 py-2 text-sm border focus:outline-none focus:border-current transition-colors"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
              }}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="flex-shrink-0 p-1.5 transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-muted)' }}
              title="Remove item"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border transition-colors hover:opacity-80"
        style={{
          color: 'var(--color-accent)',
          borderColor: 'var(--color-border)',
          backgroundColor: 'transparent',
        }}
      >
        <Plus size={12} />
        Add item
      </button>
    </div>
  );
}
