import { X } from 'lucide-react';
import type { OrderedListBlock as OrderedListBlockType } from '../../../../types/blocks';

interface OrderedListBlockProps {
  block: OrderedListBlockType;
  onChange: (block: OrderedListBlockType) => void;
}

export default function OrderedListBlock({ block, onChange }: OrderedListBlockProps) {
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
      <div className="flex flex-col gap-1.5">
        {block.items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="w-5 flex-shrink-0 text-right"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
              }}
            >
              {index + 1}.
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`List item ${index + 1}...`}
              className="flex-1 outline-none"
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="flex-shrink-0 p-1.5"
              style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 150ms ease' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        style={{
          marginTop: '8px',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--color-accent)',
          transition: 'opacity 150ms ease',
        }}
      >
        + Add item
      </button>
    </div>
  );
}
